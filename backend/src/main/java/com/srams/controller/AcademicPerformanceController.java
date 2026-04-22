package com.srams.controller;

import com.srams.dto.request.RecordScoreRequest;
import com.srams.dto.response.PerformanceResponse;
import com.srams.dto.response.ReportCardResponse;
import com.srams.entity.User;
import com.srams.service.AcademicPerformanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/performance")
@RequiredArgsConstructor
public class AcademicPerformanceController {
    private final AcademicPerformanceService performanceService;

    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER','SCHOOL_ADMIN')")
    public ResponseEntity<PerformanceResponse> record(@RequestBody @Valid RecordScoreRequest request,
                                                      @AuthenticationPrincipal User user) {
        return ResponseEntity.status(201)
                .body(performanceService.recordScore(request, user.getId()));
    }

    @GetMapping("/student/{studentId}/term/{termId}")
    @PreAuthorize("hasAnyRole('ADMIN','SCHOOL_ADMIN','TEACHER') or (hasRole('STUDENT') and @securityService.isOwnStudentRecord(#studentId, authentication))")
    public ResponseEntity<List<PerformanceResponse>> getStudentResults(
            @PathVariable Long studentId, @PathVariable Long termId) {
        return ResponseEntity.ok(performanceService.getStudentTermResults(studentId, termId));
    }

    @GetMapping("/student/{studentId}/term/{termId}/report-card")
    @PreAuthorize("hasAnyRole('ADMIN','SCHOOL_ADMIN','TEACHER') or (hasRole('STUDENT') and @securityService.isOwnStudentRecord(#studentId, authentication))")
    public ResponseEntity<ReportCardResponse> getReportCard(
            @PathVariable Long studentId, @PathVariable Long termId) {
        return ResponseEntity.ok(performanceService.generateReportCard(studentId, termId));
    }

    @GetMapping("/class")
    @PreAuthorize("hasAnyRole('ADMIN','SCHOOL_ADMIN','TEACHER')")
    public ResponseEntity<List<PerformanceResponse>> getClassResults(
            @RequestParam Long schoolId,
            @RequestParam Long gradeLevelId,
            @RequestParam Long termId) {
        return ResponseEntity.ok(performanceService.getClassResults(schoolId, gradeLevelId, termId));
    }
}
