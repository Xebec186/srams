package com.srams.service.impl;

import com.srams.dto.request.CreateAcademicYearRequest;
import com.srams.dto.request.CreateTermRequest;
import com.srams.dto.response.AcademicYearResponse;
import com.srams.dto.response.TermResponse;
import com.srams.entity.AcademicYear;
import com.srams.entity.Term;
import com.srams.exception.BadRequestException;
import com.srams.exception.ConflictException;
import com.srams.exception.ResourceNotFoundException;
import com.srams.repository.AcademicYearRepository;
import com.srams.repository.TermRepository;
import com.srams.service.AcademicYearService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AcademicYearServiceImpl implements AcademicYearService {

    private final AcademicYearRepository academicYearRepository;
    private final TermRepository termRepository;

    @Transactional(readOnly = true)
    @Override
    public List<AcademicYearResponse> getAcademicYears() {
        return academicYearRepository.findAll().stream()
                .map(AcademicYearResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public AcademicYearResponse getCurrentAcademicYear() {
        return academicYearRepository.findByCurrentTrue()
                .map(AcademicYearResponse::from)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    @Override
    public List<TermResponse> getTerms(Long academicYearId) {
        return termRepository.findByAcademicYearId(academicYearId).stream()
                .map(TermResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public AcademicYearResponse createAcademicYear(CreateAcademicYearRequest request) {
        if (request.endDate().isBefore(request.startDate())) {
            throw new BadRequestException("endDate cannot be earlier than startDate");
        }

        boolean exists = academicYearRepository.findAll().stream()
                .anyMatch(y -> y.getLabel() != null && y.getLabel().equalsIgnoreCase(request.label()));
        if (exists) {
            throw new ConflictException("Academic year label already exists");
        }

        AcademicYear year = new AcademicYear();
        year.setLabel(request.label().trim());
        year.setStartDate(request.startDate());
        year.setEndDate(request.endDate());
        year.setCurrent(false);
        return AcademicYearResponse.from(academicYearRepository.save(year));
    }

    @Override
    @Transactional
    public void setCurrentAcademicYear(Long academicYearId) {
        AcademicYear target = academicYearRepository.findById(academicYearId)
                .orElseThrow(() -> new ResourceNotFoundException("Academic year not found with ID: " + academicYearId));

        List<AcademicYear> years = academicYearRepository.findAll();
        for (AcademicYear year : years) {
            year.setCurrent(year.getId().longValue() == target.getId().longValue());
        }
        academicYearRepository.saveAll(years);
    }

    @Override
    @Transactional
    public TermResponse createTerm(Long academicYearId, CreateTermRequest request) {
        if (request.endDate().isBefore(request.startDate())) {
            throw new BadRequestException("endDate cannot be earlier than startDate");
        }

        AcademicYear year = academicYearRepository.findById(academicYearId)
                .orElseThrow(() -> new ResourceNotFoundException("Academic year not found with ID: " + academicYearId));

        termRepository.findByAcademicYearIdAndTermNumber(academicYearId, request.termNumber())
                .ifPresent(term -> {
                    throw new ConflictException("Term " + request.termNumber() + " already exists for this academic year");
                });

        Term term = new Term();
        term.setAcademicYear(year);
        term.setTermNumber(request.termNumber().byteValue());
        term.setStartDate(request.startDate());
        term.setEndDate(request.endDate());
        return TermResponse.from(termRepository.save(term));
    }
}
