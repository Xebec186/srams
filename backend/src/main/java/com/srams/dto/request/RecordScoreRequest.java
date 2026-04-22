package com.srams.dto.request;

import lombok.Builder;

import java.math.BigDecimal;

@Builder
public record RecordScoreRequest(
        Long studentId,
        Long termId,
        Long subjectId,
        Long gradeLevelId,
        BigDecimal classScore,
        BigDecimal examScore,
        String remarks) { }
