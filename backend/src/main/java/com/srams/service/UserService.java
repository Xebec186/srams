package com.srams.service;

import com.srams.dto.request.CreateUserRequest;
import com.srams.dto.request.UpdateUserRequest;
import com.srams.dto.response.UserResponse;
import com.srams.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {
    UserResponse createUser(String actorUsername, CreateUserRequest request);
    Page<UserResponse> listUsers(String actorUsername, Long schoolId, Role role, String q, Pageable pageable);
    Page<UserResponse> getUsersBySchool(Long schoolId, Pageable pageable);
    Page<UserResponse> getUsers(Pageable pageable, String role);
    UserResponse getUserById(Long id);
    UserResponse updateUser(Long id, UpdateUserRequest request);
    void deactivateUser(Long id);
    void activateUser(Long id);
}