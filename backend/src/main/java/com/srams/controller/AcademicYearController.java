package com.srams.controller;

import com.srams.dto.response.AcademicYearResponse;
import com.srams.dto.response.TermResponse;
import com.srams.service.AcademicYearService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/academic-years")
@RequiredArgsConstructor
public class AcademicYearController {

    private final AcademicYearService academicYearService;

    @GetMapping
    public ResponseEntity<List<AcademicYearResponse>> getAcademicYears() {
        return ResponseEntity.ok(academicYearService.getAcademicYears());
    }

    @GetMapping("/current")
    public ResponseEntity<AcademicYearResponse> getCurrentAcademicYear() {
        AcademicYearResponse response = academicYearService.getCurrentAcademicYear();
        if (response == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{yearId}/terms")
    public ResponseEntity<List<TermResponse>> getTerms(@PathVariable Long yearId) {
        return ResponseEntity.ok(academicYearService.getTerms(yearId));
    }
}
