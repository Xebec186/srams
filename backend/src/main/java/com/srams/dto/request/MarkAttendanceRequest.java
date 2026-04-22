package com.srams.dto.request;

import com.srams.enums.AttendanceStatus;
import com.srams.enums.Period;
import java.time.LocalDate;

public record MarkAttendanceRequest(
        Long studentId,
        Long termId,
        LocalDate attendanceDate,
        Period period,
        AttendanceStatus status,
        String absenceReason) {
}
