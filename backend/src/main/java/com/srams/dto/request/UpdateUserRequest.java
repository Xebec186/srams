package com.srams.dto.request;

import lombok.Builder;

@Builder
public record UpdateUserRequest(
        String firstName,
        String lastName,
        String email) { }
