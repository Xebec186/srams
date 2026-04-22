package com.srams.service.impl;

import com.srams.dto.request.CreateUserRequest;
import com.srams.dto.request.UpdateUserRequest;
import com.srams.dto.response.UserResponse;
import com.srams.entity.School;
import com.srams.entity.Teacher;
import com.srams.entity.User;
import com.srams.enums.Role;
import com.srams.exception.BadRequestException;
import com.srams.exception.ConflictException;
import com.srams.exception.ResourceNotFoundException;
import com.srams.repository.SchoolRepository;
import com.srams.repository.TeacherRepository;
import com.srams.repository.UserRepository;
import com.srams.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final SchoolRepository schoolRepository;
    private final TeacherRepository teacherRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    @Override
    public UserResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new ConflictException("Username already taken");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email already taken");
        }

        Role role;
        try {
            role = Role.valueOf(request.role().toUpperCase());
        } catch (Exception ex) {
            throw new BadRequestException("Invalid role: " + request.role());
        }

        School school = null;
        if (role == Role.SCHOOL_ADMIN || role == Role.TEACHER) {
            if (request.schoolId() == null) {
                throw new BadRequestException("schoolId is required for role: " + role);
            }
            school = schoolRepository.findById(request.schoolId())
                    .orElseThrow(() -> new ResourceNotFoundException("School not found with ID: " + request.schoolId()));
        }

        User user = new User();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(role);
        user.setSchool(school);

        User saved = userRepository.save(user);

        if (role == Role.TEACHER) {
            Teacher t = new Teacher();
            t.setUser(saved);
            t.setSchool(school);
            teacherRepository.save(t);
        }

        return UserResponse.from(saved);
    }

    @Override
    public UserResponse getUserById(Long id) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        return UserResponse.from(u);
    }

    @Override
    public Page<UserResponse> getUsersBySchool(Long schoolId, Pageable pageable) {
        List<User> all = userRepository.findAll();
        List<User> filtered = all.stream()
                .filter(u -> u.getSchool() != null && Objects.equals(u.getSchool().getId(), schoolId))
                .collect(Collectors.toList());

        int total = filtered.size();
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), total);
        List<UserResponse> content = start <= end && start < total ?
                filtered.subList(start, end).stream().map(UserResponse::from).collect(Collectors.toList()) : List.of();

        return new PageImpl<>(content, pageable, total);
    }

    @Transactional
    @Override
    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        if (request.firstName() != null) u.setFirstName(request.firstName());
        if (request.lastName() != null) u.setLastName(request.lastName());
        if (request.email() != null) u.setEmail(request.email());
        User updated = userRepository.save(u);
        return UserResponse.from(updated);
    }

    @Transactional
    @Override
    public void deactivateUser(Long id) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        u.setActive(false);
        userRepository.save(u);
    }

    @Transactional
    @Override
    public void activateUser(Long id) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        u.setActive(true);
        userRepository.save(u);
    }
}
