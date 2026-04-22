package com.srams.dto.response;

public record AttendanceSummaryResponse(long present, long absent, long late, long excused, long total, double percentPresent) { }
