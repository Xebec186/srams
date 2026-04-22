package com.srams.controller;

import com.srams.dto.request.AssignTeacherToClassRequest;
import com.srams.dto.response.TeacherClassAssignmentResponse;
import com.srams.entity.User;
import com.srams.service.TeacherClassAssignmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/teacher-assignments")
@RequiredArgsConstructor
public class TeacherClassAssignmentController {

    private final TeacherClassAssignmentService assignmentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SCHOOL_ADMIN')")
    public ResponseEntity<TeacherClassAssignmentResponse> assign(
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody @Valid AssignTeacherToClassRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(assignmentService.assignTeacher(principal.getUsername(), request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','SCHOOL_ADMIN')")
    public ResponseEntity<List<TeacherClassAssignmentResponse>> list(
            @AuthenticationPrincipal UserDetails principal,
            @RequestParam(required = false) Long schoolId,
            @RequestParam Integer termId,
            @RequestParam Short gradeLevelId
    ) {
        return ResponseEntity.ok(
                assignmentService.listAssignments(principal.getUsername(), schoolId, termId, gradeLevelId)
        );
    }

    @GetMapping("/teacher/{teacherId}")
    @PreAuthorize("hasAnyRole('ADMIN','SCHOOL_ADMIN', 'TEACHER')")
    public ResponseEntity<List<TeacherClassAssignmentResponse>> getByTeacher(
            @PathVariable Long teacherId
    ) {
        return ResponseEntity.ok(assignmentService.getTeacherAssignments(teacherId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SCHOOL_ADMIN')")
    public ResponseEntity<Void> deactivate(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long id
    ) {
        assignmentService.deactivate(principal.getUsername(), id);
        return ResponseEntity.noContent().build();
    }
}