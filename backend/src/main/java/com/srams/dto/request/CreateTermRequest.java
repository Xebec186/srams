package com.srams.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CreateTermRequest(
        @NotNull @Min(1) @Max(3) Integer termNumber,
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate) {
}
