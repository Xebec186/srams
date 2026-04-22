package com.srams.dto.request;

import lombok.Builder;

@Builder
public record CreateUserRequest(
        String firstName,
        String lastName,
        String username,
        String email,
        String password,
        String role,
        Long schoolId) { }
