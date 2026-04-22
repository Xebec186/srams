package com.srams.dto.response;

import java.time.LocalDate;

public record SchoolStatsResponse(
        Long schoolId,
        String schoolName,
        LocalDate reportDate,
        long totalStudents,
        long activeStudents,
        long pendingTransfers,
        long present,
        long absent,
        long late,
        long excused,
        long totalAttendance,
        double attendanceRate
) {}