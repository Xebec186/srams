package com.srams.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CreateAcademicYearRequest(
        @NotBlank String label,
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate) {
}
