package com.srams.service;

import com.srams.dto.response.SchoolPerformanceSummary;
import com.srams.dto.response.SystemAttendanceReportResponse;

import java.util.List;


public interface ReportService {
    SystemAttendanceReportResponse generateSystemAttendanceReport(Integer academicYearId, Integer termId);
    List<SchoolPerformanceSummary> generateSystemPerformanceReport(Integer termId);
}
