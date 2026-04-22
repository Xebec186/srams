package com.srams.service;

import com.srams.dto.request.BulkAttendanceRequest;
import com.srams.dto.request.MarkAttendanceRequest;
import com.srams.dto.response.AttendanceResponse;
import com.srams.dto.response.AttendanceSummaryResponse;
import com.srams.dto.response.SchoolAttendanceReportResponse;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceService {
    AttendanceResponse markAttendance(MarkAttendanceRequest request, Long markedByUserId);

    List<AttendanceResponse> markBulkAttendance(BulkAttendanceRequest request, Long markedByUserId);

    List<AttendanceResponse> getAttendanceBySchoolDateGrade(Long schoolId, LocalDate date, Long gradeLevelId);

    List<AttendanceResponse> getStudentAttendanceByTerm(Long studentId, Long termId);

    AttendanceSummaryResponse getStudentAttendanceSummary(Long studentId, Long termId);

    SchoolAttendanceReportResponse getSchoolAttendanceReport(Long schoolId, LocalDate from, LocalDate to);
}
