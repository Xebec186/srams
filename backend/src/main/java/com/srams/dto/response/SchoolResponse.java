package com.srams.dto.response;

import com.srams.entity.School;
import lombok.Builder;

@Builder
public record SchoolResponse(
        Long id,
        String schoolCode,
        String name,
        String district,
        String address,
        String phone,
        String email,
        String schoolType,
        Long regionId,
        String regionName,
        boolean active) {

    public static SchoolResponse from(School s) {
        if (s == null) return null;
        return SchoolResponse.builder()
                .id(s.getId())
                .schoolCode(s.getSchoolCode())
                .name(s.getName())
                .district(s.getDistrict())
                .address(s.getAddress())
                .phone(s.getPhone())
                .email(s.getEmail())
                .schoolType(s.getSchoolType() != null ? s.getSchoolType().name() : null)
                .regionId(s.getRegion() != null && s.getRegion().getId() != null ? s.getRegion().getId().longValue() : null)
                .regionName(s.getRegion() != null ? s.getRegion().getName() : null)
                .active(s.isActive())
                .build();
    }
}
