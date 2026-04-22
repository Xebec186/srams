package com.srams.dto.response;

import lombok.Builder;

import java.util.List;

@Builder
public record SystemAttendanceReportResponse(
        Integer termId,
        Integer totalSessions,
        Integer totalPresent,
        Integer totalAbsent,
        Integer totalLate,
        Integer totalExcused,
        Double overallAttendanceRate,
        List<SchoolAttendanceSummary> schools) {

    @Builder
    public record SchoolAttendanceSummary(
            Long schoolId,
            String schoolName,
            String region,
            Integer totalSessions,
            Integer present,
            Integer absent,
            Double attendanceRate) {
    }
}
