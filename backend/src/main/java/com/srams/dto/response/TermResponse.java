package com.srams.dto.response;

import com.srams.entity.Term;

import java.time.LocalDate;

public record TermResponse(Long id, Long academicYearId, Integer termNumber, LocalDate startDate, LocalDate endDate) {

    public static TermResponse from(Term t) {
        if(t == null) return null;
        return new TermResponse(
                t.getId() != null ? t.getId().longValue() : null,
                t.getAcademicYear().getId() != null ? t.getAcademicYear().getId().longValue() : null,
                t.getTermNumber() != null ? t.getTermNumber().intValue() : null,
                t.getStartDate(),
                t.getEndDate()
        );
    }
}
