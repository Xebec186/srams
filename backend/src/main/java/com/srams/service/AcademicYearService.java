package com.srams.service;

import com.srams.dto.response.AcademicYearResponse;
import com.srams.dto.response.TermResponse;

import java.util.List;

public interface AcademicYearService {
    List<AcademicYearResponse> getAcademicYears();

    AcademicYearResponse getCurrentAcademicYear();

    List<TermResponse> getTerms(Long academicYearId);
}
