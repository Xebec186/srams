package com.srams.controller;

import com.srams.dto.request.InitiateTransferRequest;
import com.srams.dto.request.RejectTransferRequest;
import com.srams.dto.response.TransferResponse;
import com.srams.entity.User;
import com.srams.enums.TransferStatus;
import com.srams.service.TransferService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/transfers")
@RequiredArgsConstructor
public class TransferController {
    private final TransferService transferService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SCHOOL_ADMIN','STUDENT')")
    public ResponseEntity<TransferResponse> initiate(@RequestBody @Valid InitiateTransferRequest request,
                                                     @AuthenticationPrincipal User user) {
        return ResponseEntity.status(201)
                .body(transferService.initiateTransfer(request, user.getId()));
    }

    @PutMapping("/{id}/approve-sending")
    @PreAuthorize("hasAnyRole('ADMIN','SCHOOL_ADMIN')")
    public ResponseEntity<TransferResponse> approveSending(@PathVariable Long id,
                                                           @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(transferService.approveSending(id, user.getId()));
    }

    @PutMapping("/{id}/confirm-receiving")
    @PreAuthorize("hasAnyRole('ADMIN','SCHOOL_ADMIN')")
    public ResponseEntity<TransferResponse> confirmReceiving(@PathVariable Long id,
                                                             @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(transferService.confirmReceiving(id, user.getId()));
    }

    @PutMapping("/{id}/complete")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TransferResponse> complete(@PathVariable Long id) {
        return ResponseEntity.ok(transferService.completeTransfer(id));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN','SCHOOL_ADMIN')")
    public ResponseEntity<TransferResponse> reject(@PathVariable Long id,
                                                   @RequestBody RejectTransferRequest request,
                                                   @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(transferService.rejectTransfer(id, request.reason(), user.getId()));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TransferResponse>> listAll(
            @RequestParam(required = false) TransferStatus status) {
        return ResponseEntity.ok(transferService.getAllTransfers(status));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN','SCHOOL_ADMIN') or (hasRole('STUDENT') and @securityService.isOwnStudentRecord(#studentId, authentication))")
    public ResponseEntity<List<TransferResponse>> getByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(transferService.getTransfersByStudent(studentId));
    }

    @GetMapping("/school/{schoolId}")
    @PreAuthorize("hasAnyRole('ADMIN','SCHOOL_ADMIN')")
    public ResponseEntity<List<TransferResponse>> getBySchool(
            @PathVariable Long schoolId,
            @RequestParam(required = false) TransferStatus status,
            @RequestParam(defaultValue = "both") String direction) {
        return ResponseEntity.ok(transferService.getTransfersBySchool(schoolId, status, direction));
    }
}
