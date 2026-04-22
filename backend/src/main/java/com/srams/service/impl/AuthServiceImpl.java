package com.srams.service.impl;

import com.srams.dto.request.ChangePasswordRequest;
import com.srams.dto.request.LoginRequest;
import com.srams.dto.response.AuthResponse;
import com.srams.entity.User;
import com.srams.exception.BadRequestException;
import com.srams.exception.ResourceNotFoundException;
import com.srams.repository.UserRepository;
import com.srams.security.JwtUtil;
import com.srams.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );
        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        String token = jwtUtil.generateToken(user);
        String refreshToken = jwtUtil.generateRefreshToken(user);
        return new AuthResponse(
                token,
                refreshToken,
                user.getRole(),
                user.getFullName(),
                user.getId(),
                user.getSchool() != null ? user.getSchool().getId() : null,
                user.getStudent() != null ? user.getStudent().getId() : null);
    }

    @Transactional
    @Override
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    @Override
    public AuthResponse refreshToken(String refreshToken) {
        String username = jwtUtil.extractUsername(refreshToken);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!jwtUtil.isTokenValid(refreshToken, user)) {
            throw new BadRequestException("Invalid refresh token");
        }
        String token = jwtUtil.generateToken(user);
        String newRefreshToken = jwtUtil.generateRefreshToken(user);
        return new AuthResponse(
                token,
                newRefreshToken,
                user.getRole(),
                user.getFullName(),
                user.getId(),
                user.getSchool() != null ? user.getSchool().getId() : null,
                user.getStudent() != null ? user.getStudent().getId() : null);
    }
}
