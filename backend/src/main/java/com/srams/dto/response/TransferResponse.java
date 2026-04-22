package com.srams.dto.response;

import com.srams.entity.TransferRequest;
import com.srams.enums.TransferStatus;

import java.time.LocalDate;

public record TransferResponse(
        Long id,
        Long studentId,
        String studentName,
        String studentUsid,
        Long fromSchoolId,
        String fromSchoolName,
        Long toSchoolId,
        String toSchoolName,
        String requestedByName,
        LocalDate requestDate,
        TransferStatus status,
        String reason,
        String rejectionReason) {

    public static TransferResponse from(TransferRequest t) {
        if (t == null) return null;
        return new TransferResponse(
                t.getId(),
                t.getStudent() != null ? t.getStudent().getId() : null,
                t.getStudent() != null ? t.getStudent().getFullName() : null,
                t.getStudent() != null ? t.getStudent().getUsid() : null,
                t.getFromSchool() != null ? t.getFromSchool().getId() : null,
                t.getFromSchool() != null ? t.getFromSchool().getName() : null,
                t.getToSchool() != null ? t.getToSchool().getId() : null,
                t.getToSchool() != null ? t.getToSchool().getName() : null,
                t.getRequestedBy() != null ? t.getRequestedBy().getFullName() : null,
                t.getRequestDate(),
                t.getStatus(),
                t.getReason(),
                t.getRejectionReason()
        );
    }
}
