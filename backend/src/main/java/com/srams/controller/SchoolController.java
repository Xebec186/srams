package com.srams.controller;

import com.srams.dto.request.CreateSchoolRequest;
import com.srams.dto.request.UpdateSchoolRequest;
import com.srams.dto.response.SchoolResponse;
import com.srams.service.SchoolService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/schools")
@RequiredArgsConstructor
public class SchoolController {

    private final SchoolService schoolService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','SCHOOL_ADMIN')")
    public ResponseEntity<Page<SchoolResponse>> list(Pageable pageable) {
        return ResponseEntity.ok(schoolService.getAllSchools(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SCHOOL_ADMIN')")
    public ResponseEntity<SchoolResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(schoolService.getSchoolById(id));
    }

    @GetMapping("/region/{regionId}")
    @PreAuthorize("hasAnyRole('ADMIN','SCHOOL_ADMIN')")
    public ResponseEntity<List<SchoolResponse>> getByRegion(@PathVariable Integer regionId) {
        return ResponseEntity.ok(schoolService.getSchoolsByRegion(regionId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SchoolResponse> create(@RequestBody @Valid CreateSchoolRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(schoolService.createSchool(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SchoolResponse> update(@PathVariable Long id, @RequestBody @Valid UpdateSchoolRequest request) {
        return ResponseEntity.ok(schoolService.updateSchool(id, request));
    }
}
