package com.srams.dto.request;

import java.util.List;

public record BulkRecordScoreRequest(
        Long termId,
        Long subjectId,
        Long gradeLevelId,
        List<StudentScoreRequest> scores) {

    public record StudentScoreRequest(
            Long studentId,
            java.math.BigDecimal classScore,
            java.math.BigDecimal examScore,
            String remarks
    ) {}
}
