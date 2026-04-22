package com.srams.dto.request;

public record InitiateTransferRequest(Long studentId, Long toSchoolId, String reason) { }
