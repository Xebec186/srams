package com.srams.service.impl;

import com.srams.dto.request.CreateUserRequest;
import com.srams.dto.request.UpdateUserRequest;
import com.srams.dto.response.UserResponse;
import com.srams.entity.*;
import com.srams.enums.Gender;
import com.srams.enums.Role;
import com.srams.enums.StudentStatus;
import com.srams.exception.BadRequestException;
import com.srams.exception.ConflictException;
import com.srams.exception.ResourceNotFoundException;
import com.srams.repository.*;
import com.srams.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final SchoolRepository schoolRepository;
    private final TeacherRepository teacherRepository;
    private final GradeLevelRepository gradeLevelRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    @Override
    public UserResponse createUser(String actorUsername, CreateUserRequest request) {
        User actor = userRepository.findByUsername(actorUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Role requestedRole = parseRole(request.role());

        if (userRepository.existsByUsername(request.username())) {
            throw new ConflictException("Username already exists");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email already exists");
        }

        Long effectiveSchoolId = request.schoolId();

        if (actor.getRole() == Role.SCHOOL_ADMIN) {
            if (requestedRole == Role.ADMIN || requestedRole == Role.SCHOOL_ADMIN) {
                throw new ConflictException("School admin can only create teacher or student accounts");
            }
            if (actor.getSchool() == null) {
                throw new ConflictException("Your account is not linked to a school");
            }
            effectiveSchoolId = actor.getSchool().getId();

            if (request.schoolId() != null && !request.schoolId().equals(effectiveSchoolId)) {
                throw new ConflictException("You can only create users for your own school");
            }
        }

        if (requestedRole != Role.ADMIN && effectiveSchoolId == null) {
            throw new BadRequestException("schoolId is required for this role");
        }

        School school = null;
        if (effectiveSchoolId != null) {
            school = schoolRepository.findById(effectiveSchoolId)
                    .orElseThrow(() -> new ResourceNotFoundException("School not found"));
        }

        User user = new User();
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(requestedRole);
        user.setSchool(school);
        user.setActive(true);

        User saved = userRepository.save(user);

        if (requestedRole == Role.TEACHER) {
            createTeacherProfile(saved, user.getSchool(), request);
        } else if (requestedRole == Role.STUDENT) {
            createStudentProfile(saved, actor, user.getSchool(), request);
        }

        return UserResponse.from(saved);
    }

    @Transactional(readOnly = true)
    @Override
    public Page<UserResponse> listUsers(
            String actorUsername,
            Long schoolId,
            Role role,
            String q,
            Pageable pageable
    ) {
        User actor = userRepository.findByUsername(actorUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Long effectiveSchoolId = schoolId;

        if (actor.getRole() == Role.SCHOOL_ADMIN) {
            if (actor.getSchool() == null) {
                throw new ConflictException("Your account is not linked to a school");
            }
            effectiveSchoolId = actor.getSchool().getId();
        }

        return userRepository
                .searchUsers(effectiveSchoolId, role, blankToNull(q), pageable)
                .map(UserResponse::from);
    }

    @Transactional(readOnly = true)
    @Override
    public UserResponse getUserById(String actorUsername, Long id) {
        User actor = userRepository.findByUsername(actorUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        User u = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

        if (actor.getRole() == Role.TEACHER || actor.getRole() == Role.STUDENT) {
            if (!actor.getId().equals(id)) {
                throw new ConflictException("You can only view your own profile");
            }
        }

        if (actor.getRole() == Role.SCHOOL_ADMIN) {
            if (actor.getSchool() == null) {
                throw new ConflictException("Your account is not linked to a school");
            }
            if (u.getSchool() == null || !actor.getSchool().getId().equals(u.getSchool().getId())) {
                throw new ConflictException("You can only view profiles from your school");
            }
        }

        return UserResponse.from(u);
    }

    @Transactional(readOnly = true)
    @Override
    public Page<UserResponse> getUsersBySchool(Long schoolId, Pageable pageable) {
        return userRepository.searchUsers(schoolId, null, null, pageable)
                .map(UserResponse::from);
    }

    @Transactional(readOnly = true)
    @Override
    public Page<UserResponse> getUsers(Pageable pageable, String role) {
        Role parsedRole = role == null || role.isBlank() ? null : parseRole(role);
        return userRepository.searchUsers(null, parsedRole, null, pageable)
                .map(UserResponse::from);
    }

    @Transactional
    @Override
    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

        if (request.firstName() != null) u.setFirstName(request.firstName());
        if (request.lastName() != null) u.setLastName(request.lastName());
        if (request.email() != null) u.setEmail(request.email());

        return UserResponse.from(userRepository.save(u));
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

    private void createTeacherProfile(User saved, School school, CreateUserRequest request) {
        Teacher teacher = new Teacher();
        teacher.setUser(saved);
        teacher.setSchool(school);
        teacher.setStaffId(resolveTeacherStaffId(request.staffId(), school, saved));

        teacher.setDateOfBirth(request.dateOfBirth());
        if (hasText(request.gender())) {
            teacher.setGender(Gender.valueOf(request.gender().trim().toUpperCase(Locale.ROOT)));
        }
        teacher.setPhone(request.phone());
        teacher.setQualification(request.qualification());
        teacher.setDateEmployed(request.dateEmployed());
        teacher.setActive(true);

        teacherRepository.save(teacher);
    }

    private void createStudentProfile(User saved, User actor, School school, CreateUserRequest request) {
        if (request.gradeLevelId() == null) {
            throw new BadRequestException("gradeLevelId is required for student accounts");
        }
        if (request.dateOfBirth() == null) {
            throw new BadRequestException("dateOfBirth is required for student accounts");
        }
        if (!hasText(request.firstName()) || !hasText(request.lastName())) {
            throw new BadRequestException("Student first and last names are required");
        }
        if (!hasText(request.gender())) {
            throw new BadRequestException("gender is required for student accounts");
        }

        GradeLevel gradeLevel = gradeLevelRepository.findById(request.gradeLevelId())
                .orElseThrow(() -> new ResourceNotFoundException("Grade level not found"));

        Student student = new Student();
        student.setUsid(resolveStudentUsid(request.usid(), school, saved));
        student.setSchool(school);
        student.setGradeLevel(gradeLevel);
        student.setFirstName(request.firstName());
        student.setMiddleName(request.middleName());
        student.setLastName(request.lastName());
        student.setDateOfBirth(request.dateOfBirth());
        student.setGender(Gender.valueOf(request.gender().trim().toUpperCase(Locale.ROOT)));
        student.setNationality(hasText(request.nationality()) ? request.nationality().trim() : "Ghanaian");
        student.setGuardianName(request.guardianName());
        student.setGuardianPhone(request.guardianPhone());
        student.setGuardianRelation(request.guardianRelation());
        student.setAddress(request.address());
        student.setEnrollmentDate(LocalDate.now());
        student.setEnrollmentYear(LocalDate.now().getYear());
        student.setStatus(StudentStatus.ACTIVE);
        student.setCreatedBy(actor);

        Student savedStudent = studentRepository.save(student);
        saved.setStudent(savedStudent);
        userRepository.save(saved);
    }

    private String resolveStudentUsid(String providedUsid, School school, User saved) {
        if (hasText(providedUsid)) {
            return providedUsid.trim();
        }
        return "STD-" + school.getId() + "-" + LocalDate.now().getYear() + "-" + saved.getId();
    }

    private String resolveTeacherStaffId(String providedStaffId, School school, User saved) {
        if (hasText(providedStaffId)) {
            return providedStaffId.trim();
        }
        return "TCH-" + school.getId() + "-" + saved.getId();
    }

    private Role parseRole(String value) {
        try {
            return Role.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (Exception ex) {
            throw new BadRequestException("Invalid role: " + value);
        }
    }

    private String blankToNull(String value) {
        return hasText(value) ? value.trim() : null;
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}