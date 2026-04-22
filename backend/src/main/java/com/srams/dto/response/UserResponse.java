package com.srams.dto.response;

import com.srams.entity.User;
import lombok.Builder;

@Builder
public record UserResponse(
        Long id,
        String firstName,
        String lastName,
        String username,
        String email,
        String role,
        Long schoolId,
        String schoolName,
        boolean active,
        String lastLogin) {

    public static UserResponse from(User u) {
        if (u == null) return null;
        return UserResponse.builder()
                .id(u.getId())
                .firstName(u.getFirstName())
                .lastName(u.getLastName())
                .username(u.getUsername())
                .email(u.getEmail())
                .role(u.getRole() != null ? u.getRole().name() : null)
                .schoolId(u.getSchool() != null ? u.getSchool().getId() : null)
                .schoolName(u.getSchool() != null ? u.getSchool().getName() : null)
                .active(u.isActive())
                .lastLogin(u.getLastLogin() != null ? u.getLastLogin().toString() : null)
                .build();
    }
}