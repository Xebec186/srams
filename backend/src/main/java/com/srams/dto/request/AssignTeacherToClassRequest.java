package com.srams.dto.request;

import jakarta.validation.constraints.NotNull;

public record AssignTeacherToClassRequest(
        @NotNull Long teacherId,
        @NotNull Short gradeLevelId,
        @NotNull Integer termId
) { }