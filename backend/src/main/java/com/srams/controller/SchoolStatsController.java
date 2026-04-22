package com.srams.controller;

import com.srams.dto.response.SchoolStatsResponse;
import com.srams.dto.response.SystemStatsResponse;
import com.srams.service.SchoolStatsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/schools")
@RequiredArgsConstructor
@Tag(name = "School Stats")
public class SchoolStatsController {

    private final SchoolStatsService schoolStatsService;

    @GetMapping("/system-stats")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get global system dashboard stats")
    public ResponseEntity<SystemStatsResponse> getSystemStats(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(schoolStatsService.getSystemStats(date));
    }

    @GetMapping("/{schoolId}/stats")
    @PreAuthorize("hasAnyRole('ADMIN','SCHOOL_ADMIN')")
    @Operation(summary = "Get school dashboard stats")
    public ResponseEntity<SchoolStatsResponse> getSchoolStats(
            @PathVariable Long schoolId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(schoolStatsService.getSchoolStats(schoolId, date));
    }
}