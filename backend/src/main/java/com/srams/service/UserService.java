package com.srams.service;

import com.srams.dto.request.CreateUserRequest;
import com.srams.dto.request.UpdateUserRequest;
import com.srams.dto.response.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {
    UserResponse createUser(CreateUserRequest request);
    UserResponse getUserById(Long id);
    Page<UserResponse> getUsersBySchool(Long schoolId, Pageable pageable);
    Page<UserResponse> getUsers(Pageable pageable, String role);
    UserResponse updateUser(Long id, UpdateUserRequest request);
    void deactivateUser(Long id);
    void activateUser(Long id);
}