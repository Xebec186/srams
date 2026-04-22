package com.srams.dto.response;

import java.time.LocalDate;

public record SystemStatsResponse(
        LocalDate date,
        long totalSchools,
        long totalStudents,
        long activeStudents,
        long totalTransfers,
        long pendingTransfers,
        double averageAttendanceRate
) {}