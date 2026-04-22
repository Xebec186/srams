package com.srams.controller;

import com.srams.dto.request.CreateStudentRequest;
import com.srams.dto.request.UpdateStudentRequest;
import com.srams.dto.response.StudentResponse;
import com.srams.entity.User;
import com.srams.enums.Role;
import com.srams.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/students")
@RequiredArgsConstructor
public class StudentController {
    private final StudentService studentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SCHOOL_ADMIN')")
    public ResponseEntity<StudentResponse> register(@RequestBody @Valid CreateStudentRequest request,
                                                    @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(studentService.registerStudent(request, user.getId()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','SCHOOL_ADMIN','TEACHER')")
    public ResponseEntity<Page<StudentResponse>> list(
            @RequestParam(required = false) Long schoolId,
            @RequestParam(required = false) Short gradeLevelId,
            @RequestParam(required = false) String q,
            Pageable pageable,
            @AuthenticationPrincipal User user) {
        if (user.getRole() == Role.ADMIN) {
            return ResponseEntity.ok(studentService.searchAllStudents(q != null ? q : "", pageable));
        }
        Long scopedSchoolId = schoolId != null ? schoolId : user.getSchool().getId();
        if (gradeLevelId != null) {
            return ResponseEntity.ok(studentService.getStudentsBySchoolAndGrade(scopedSchoolId, gradeLevelId, q != null ? q : "", pageable));
        }
        return ResponseEntity.ok(studentService.getStudentsBySchool(scopedSchoolId, q != null ? q : "", pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SCHOOL_ADMIN','TEACHER') or (hasRole('STUDENT') and @securityService.isOwnStudentRecord(#id, authentication))")
    public ResponseEntity<StudentResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    @GetMapping("/usid/{usid}")
    @PreAuthorize("hasAnyRole('ADMIN','SCHOOL_ADMIN','TEACHER')")
    public ResponseEntity<StudentResponse> getByUsid(@PathVariable String usid) {
        return ResponseEntity.ok(studentService.getStudentByUsid(usid));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SCHOOL_ADMIN')")
    public ResponseEntity<StudentResponse> update(@PathVariable Long id,
                                                  @RequestBody @Valid UpdateStudentRequest request) {
        return ResponseEntity.ok(studentService.updateStudent(id, request));
    }
}
