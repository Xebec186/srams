package com.srams.dto.response;

import com.srams.entity.TransferRequest;
import com.srams.enums.TransferStatus;

public record TransferResponse(
        Long id,
        Long studentId,
        Long fromSchoolId,
        Long toSchoolId,
        TransferStatus status,
        String reason) {

    public static TransferResponse from(TransferRequest t) {
        if (t == null) return null;
        return new TransferResponse(
                t.getId(),
                t.getStudent() != null ? t.getStudent().getId() : null,
                t.getFromSchool() != null ? t.getFromSchool().getId() : null,
                t.getToSchool() != null ? t.getToSchool().getId() : null,
                t.getStatus(),
                t.getReason()
        );
    }
}
