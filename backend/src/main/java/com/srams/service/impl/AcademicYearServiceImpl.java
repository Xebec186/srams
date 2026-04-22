package com.srams.service.impl;

import com.srams.dto.response.AcademicYearResponse;
import com.srams.dto.response.TermResponse;
import com.srams.repository.AcademicYearRepository;
import com.srams.repository.TermRepository;
import com.srams.service.AcademicYearService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AcademicYearServiceImpl implements AcademicYearService {

    private final AcademicYearRepository academicYearRepository;
    private final TermRepository termRepository;

    @Override
    public List<AcademicYearResponse> getAcademicYears() {
        return academicYearRepository.findAll().stream()
                .map(AcademicYearResponse::from)
                .toList();
    }

    @Override
    public AcademicYearResponse getCurrentAcademicYear() {
        return academicYearRepository.findByCurrentTrue()
                .map(AcademicYearResponse::from)
                .orElse(null);
    }

    @Override
    public List<TermResponse> getTerms(Long academicYearId) {
        return termRepository.findByAcademicYearId(academicYearId).stream()
                .map(TermResponse::from)
                .toList();
    }
}
