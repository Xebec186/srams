package com.srams.dto.response;

import java.time.LocalDate;

public record SchoolAttendanceReportResponse(
        Long schoolId,
        LocalDate from,
        LocalDate to,
        long present,
        long absent,
        long total) { }
