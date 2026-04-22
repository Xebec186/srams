package com.srams.dto.response;

import lombok.Builder;

import java.util.List;

@Builder
public record ReportCardResponse(
        Long studentId,
        String studentName,
        String usid,
        String schoolName,
        String gradeCode,
        String gradeName,
        Integer termNumber,
        String academicYear,
        Double averageScore,
        Integer classPosition,
        Integer totalStudents,
        Double attendancePct,
        String teacherRemark,
        List<ReportCardSubjectLine> subjects) {

    @Builder
    public record ReportCardSubjectLine(
            Long subjectId,
            String subjectName,
            Double classScore,
            Double examScore,
            Double totalScore,
            String grade,
            String remarks) {
    }
}