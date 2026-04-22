package com.srams.dto.request;

public record ChangePasswordRequest(String currentPassword, String newPassword) { }
