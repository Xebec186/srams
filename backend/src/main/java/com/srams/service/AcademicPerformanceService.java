package com.srams.service;

import java.util.List;

import com.srams.dto.response.PerformanceResponse;
import com.srams.dto.request.RecordScoreRequest;
import com.srams.dto.response.ReportCardResponse;


public interface AcademicPerformanceService {
    PerformanceResponse recordScore(RecordScoreRequest request, Long recordedByUserId);
    List<PerformanceResponse> getStudentTermResults(Long studentId, Long termId);
    List<PerformanceResponse> getClassResults(Long schoolId, Long gradeLevelId, Long termId);
    ReportCardResponse generateReportCard(Long studentId, Long termId);
}