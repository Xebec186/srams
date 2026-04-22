package com.srams.dto.response;

import com.srams.entity.AcademicYear;

import java.time.LocalDate;

public record AcademicYearResponse(Long id, String label, LocalDate startDate, LocalDate endDate, boolean current) {

    public static AcademicYearResponse from(AcademicYear a) {
        if(a == null) return null;
        return new AcademicYearResponse(a.getId() != null ? a.getId().longValue() : null, a.getLabel(), a.getStartDate(), a.getEndDate(), a.isCurrent());
    }
}
