package com.srams.service;

import com.srams.dto.request.ChangePasswordRequest;
import com.srams.dto.request.LoginRequest;
import com.srams.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    AuthResponse refreshToken(String refreshToken);
    void changePassword(Long userId, ChangePasswordRequest request);
}


