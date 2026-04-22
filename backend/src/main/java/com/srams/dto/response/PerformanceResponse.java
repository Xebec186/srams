package com.srams.dto.response;

import com.srams.entity.AcademicPerformance;
import lombok.Builder;

import java.math.BigDecimal;
import java.util.Optional;

@Builder
public record PerformanceResponse(
        Long id,
        Long studentId,
        String studentName,
        String studentUsid,
        Long schoolId,
        Long termId,
        Integer termNumber,
        String academicYear,
        Long gradeLevelId,
        String gradeCode,
        Long subjectId,
        String subjectName,
        BigDecimal classScore,
        BigDecimal examScore,
        BigDecimal totalScore,
        String grade,
        Integer position,
        String remarks,
        String recordedByName) {

    public static PerformanceResponse from(AcademicPerformance p) {
        if (p == null) return null;
        var student = p.getStudent();
        var term = p.getTerm();
        var gradeLevel = p.getGradeLevel();
        var subject = p.getSubject();
        var recorder = p.getRecordedBy();

        return PerformanceResponse.builder()
                .id(p.getId())
                .studentId(student != null ? student.getId() : null)
                .studentName(student != null ? student.getFullName() : null)
                .studentUsid(student != null ? student.getUsid() : null)
                .schoolId(p.getSchool() != null ? p.getSchool().getId() : null)
                .termId(term != null && term.getId() != null ? term.getId().longValue() : null)
                .termNumber(term != null && term.getTermNumber() != null ? term.getTermNumber().intValue() : null)
                .academicYear(term != null && term.getAcademicYear() != null ? term.getAcademicYear().getLabel() : null)
                .gradeLevelId(gradeLevel != null && gradeLevel.getId() != null ? gradeLevel.getId().longValue() : null)
                .gradeCode(gradeLevel != null ? gradeLevel.getCode() : null)
                .subjectId(subject != null && subject.getId() != null ? subject.getId().longValue() : null)
                .subjectName(subject != null ? subject.getName() : null)
                .classScore(p.getClassScore())
                .examScore(p.getExamScore())
                .totalScore(p.getTotalScore())
                .grade(p.getGrade())
                .position(p.getPosition())
                .remarks(p.getRemarks())
                .recordedByName(recorder != null ? recorder.getFullName() : null)
                .build();
    }
}
