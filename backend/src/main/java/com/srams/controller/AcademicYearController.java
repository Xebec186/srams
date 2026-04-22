package com.srams.controller;

import com.srams.dto.request.CreateAcademicYearRequest;
import com.srams.dto.request.CreateTermRequest;
import com.srams.dto.response.AcademicYearResponse;
import com.srams.dto.response.TermResponse;
import com.srams.service.AcademicYearService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
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

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AcademicYearResponse> createAcademicYear(@RequestBody @Valid CreateAcademicYearRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(academicYearService.createAcademicYear(request));
    }

    @PutMapping("/{yearId}/set-current")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> setCurrentAcademicYear(@PathVariable Long yearId) {
        academicYearService.setCurrentAcademicYear(yearId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{yearId}/terms")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TermResponse> createTerm(@PathVariable Long yearId, @RequestBody @Valid CreateTermRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(academicYearService.createTerm(yearId, request));
    }
}
