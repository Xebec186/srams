package com.srams.controller;

import com.srams.repository.GradeLevelRepository;
import com.srams.repository.RegionRepository;
import com.srams.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ReferenceDataController {

    private final RegionRepository regionRepository;
    private final GradeLevelRepository gradeLevelRepository;
    private final SubjectRepository subjectRepository;

    @GetMapping("/regions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<RegionItem>> getRegions() {
        return ResponseEntity.ok(regionRepository.findAll().stream()
                .map(r -> new RegionItem(r.getId(), r.getCode(), r.getName()))
                .toList());
    }

    @GetMapping("/grade-levels")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<GradeLevelItem>> getGradeLevels() {
        return ResponseEntity.ok(gradeLevelRepository.findAll().stream()
                .map(g -> new GradeLevelItem(g.getId(), g.getCode(), g.getName(), g.getLevelOrder(), g.getSchoolType().name()))
                .toList());
    }

    @GetMapping("/subjects")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SubjectItem>> getSubjects() {
        return ResponseEntity.ok(subjectRepository.findAll().stream()
                .map(s -> new SubjectItem(s.getId(), s.getCode(), s.getName()))
                .toList());
    }

    private record RegionItem(Short id, String code, String name) {}

    private record GradeLevelItem(Short id, String code, String name, Byte levelOrder, String schoolType) {}

    private record SubjectItem(Integer id, String code, String name) {}
}
