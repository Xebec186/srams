package com.srams.dto.response;

import com.srams.enums.Role;

public record AuthResponse(String token, String refreshToken, Role role, String fullName) { }
