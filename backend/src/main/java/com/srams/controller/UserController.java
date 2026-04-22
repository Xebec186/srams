package com.srams.controller;

import com.srams.dto.request.CreateUserRequest;
import com.srams.dto.request.UpdateUserRequest;
import com.srams.dto.response.UserResponse;
import com.srams.entity.User;
import com.srams.enums.Role;
import com.srams.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SCHOOL_ADMIN')")
    public ResponseEntity<UserResponse> create(@RequestBody @Valid CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','SCHOOL_ADMIN')")
    public ResponseEntity<Page<UserResponse>> list(
            @RequestParam(required = false) Long schoolId,
            @RequestParam(required = false) String role,
            Pageable pageable,
            @AuthenticationPrincipal User user) {
        if (user.getRole() == Role.ADMIN) {
            if (schoolId != null) {
                return ResponseEntity.ok(userService.getUsersBySchool(schoolId, pageable));
            }
            return ResponseEntity.ok(userService.getUsers(pageable, role));
        }
        Page<UserResponse> scoped = userService.getUsersBySchool(user.getSchool().getId(), pageable);
        if (role == null || role.isBlank()) {
            return ResponseEntity.ok(scoped);
        }
        String roleFilter = role.trim().toUpperCase();
        var filtered = scoped.getContent().stream().filter(u -> roleFilter.equals(u.role())).toList();
        return ResponseEntity.ok(new PageImpl<>(filtered, scoped.getPageable(), filtered.size()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SCHOOL_ADMIN')")
    public ResponseEntity<UserResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> update(@PathVariable Long id, @RequestBody @Valid UpdateUserRequest request) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        userService.deactivateUser(id);
        return ResponseEntity.noContent().build();
    }
}
