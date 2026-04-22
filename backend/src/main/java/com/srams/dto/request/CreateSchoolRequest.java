package com.srams.dto.request;

import lombok.Builder;

@Builder
public record CreateSchoolRequest(
        String name,
        String schoolCode,
        Long regionId,
        String district,
        String address,
        String phone,
        String email,
        String schoolType) { }
