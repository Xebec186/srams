package com.srams.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

import java.time.LocalDate;

@Builder
public record CreateUserRequest(
        @NotBlank String firstName,
        String middleName,
        @NotBlank String lastName,
        @NotBlank String username,
        @Email @NotBlank String email,
        @NotBlank String password,
        @NotBlank String role,
        Long schoolId,

        // Shared profile fields
        LocalDate dateOfBirth,
        String gender,
        String phone,

        // Teacher-specific fields
        String staffId,
        String qualification,
        LocalDate dateEmployed,

        // Student-specific fields
        Short gradeLevelId,
        String usid,
        String guardianName,
        String guardianPhone,
        String guardianRelation,
        String address,
        String nationality
) {}