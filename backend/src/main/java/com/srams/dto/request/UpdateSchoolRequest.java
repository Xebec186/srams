package com.srams.dto.request;

import lombok.Builder;

@Builder
public record UpdateSchoolRequest(
        String name,
        String district,
        String address,
        String phone,
        String email,
        String schoolType,
        Boolean active) { }
