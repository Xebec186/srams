package com.srams.dto.response;

import lombok.Builder;

@Builder
public record SchoolPerformanceSummary(
        Long schoolId,
        String schoolName,
        String region,
        Double averageScore,
        Integer totalRecords,
        Double passRate,
        Double distinctionRate) { }
