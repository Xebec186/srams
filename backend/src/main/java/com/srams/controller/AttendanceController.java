package com.srams.controller;

import com.srams.dto.request.BulkAttendanceRequest;
import com.srams.dto.request.MarkAttendanceRequest;
import com.srams.dto.response.AttendanceResponse;
import com.srams.dto.response.AttendanceSummaryResponse;
import com.srams.dto.response.SchoolAttendanceReportResponse;
import com.srams.entity.User;
import com.srams.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
public class AttendanceController {
    private final AttendanceService attendanceService;

    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER','SCHOOL_ADMIN')")
    public ResponseEntity<AttendanceResponse> mark(@RequestBody @Valid MarkAttendanceRequest request,
                                                   @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(attendanceService.markAttendance(request, user.getId()));
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasAnyRole('TEACHER','SCHOOL_ADMIN')")
    public ResponseEntity<List<AttendanceResponse>> markBulk(@RequestBody @Valid BulkAttendanceRequest request,
                                                             @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(attendanceService.markBulkAttendance(request, user.getId()));
    }

    @GetMapping("/class")
    @PreAuthorize("hasAnyRole('ADMIN','SCHOOL_ADMIN','TEACHER')")
    public ResponseEntity<List<AttendanceResponse>> getClassAttendance(
            @RequestParam Long schoolId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam Long gradeLevelId) {
        return ResponseEntity.ok(
                attendanceService.getAttendanceBySchoolDateGrade(schoolId, date, gradeLevelId));
    }

    @GetMapping("/student/{studentId}/term/{termId}")
    @PreAuthorize("hasAnyRole('ADMIN','SCHOOL_ADMIN','TEACHER') or (hasRole('STUDENT') and @securityService.isOwnStudentRecord(#studentId, authentication))")
    public ResponseEntity<List<AttendanceResponse>> getStudentAttendance(
            @PathVariable Long studentId, @PathVariable Long termId) {
        return ResponseEntity.ok(attendanceService.getStudentAttendanceByTerm(studentId, termId));
    }

    @GetMapping("/student/{studentId}/term/{termId}/summary")
    @PreAuthorize("hasAnyRole('ADMIN','SCHOOL_ADMIN','TEACHER') or (hasRole('STUDENT') and @securityService.isOwnStudentRecord(#studentId, authentication))")
    public ResponseEntity<AttendanceSummaryResponse> getSummary(
            @PathVariable Long studentId, @PathVariable Long termId) {
        return ResponseEntity.ok(attendanceService.getStudentAttendanceSummary(studentId, termId));
    }

    @GetMapping("/school/{schoolId}/report")
    @PreAuthorize("hasAnyRole('ADMIN','SCHOOL_ADMIN')")
    public ResponseEntity<SchoolAttendanceReportResponse> getSchoolReport(
            @PathVariable Long schoolId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(attendanceService.getSchoolAttendanceReport(schoolId, from, to));
    }
}
