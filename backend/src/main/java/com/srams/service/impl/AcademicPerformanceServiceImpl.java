package com.srams.service.impl;

import com.srams.dto.request.RecordScoreRequest;
import com.srams.dto.response.PerformanceResponse;
import com.srams.dto.response.ReportCardResponse;
import com.srams.entity.AcademicPerformance;
import com.srams.entity.GradeLevel;
import com.srams.entity.Student;
import com.srams.entity.Subject;
import com.srams.entity.Term;
import com.srams.entity.User;
import com.srams.exception.ResourceNotFoundException;
import com.srams.repository.AcademicPerformanceRepository;
import com.srams.repository.AttendanceRecordRepository;
import com.srams.repository.GradeLevelRepository;
import com.srams.repository.StudentRepository;
import com.srams.repository.SubjectRepository;
import com.srams.repository.TermRepository;
import com.srams.repository.UserRepository;
import com.srams.service.AcademicPerformanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AcademicPerformanceServiceImpl implements AcademicPerformanceService {

    private final AcademicPerformanceRepository performanceRepository;
    private final StudentRepository studentRepository;
    private final TermRepository termRepository;
    private final SubjectRepository subjectRepository;
    private final GradeLevelRepository gradeLevelRepository;
    private final UserRepository userRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;

    @Transactional
    @Override
    public PerformanceResponse recordScore(RecordScoreRequest request, Long recordedByUserId) {
        Student student = studentRepository.findById(request.studentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + request.studentId()));

        Term term = termRepository.findById(request.termId())
                .orElseThrow(() -> new ResourceNotFoundException("Term not found with ID: " + request.termId()));

        Integer subjectId = request.subjectId() != null ? request.subjectId().intValue() : null;
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with ID: " + request.subjectId()));

        Short gradeLevelId = request.gradeLevelId() != null ? request.gradeLevelId().shortValue() : null;
        GradeLevel gradeLevel = gradeLevelRepository.findById(gradeLevelId)
                .orElseThrow(() -> new ResourceNotFoundException("Grade level not found with ID: " + request.gradeLevelId()));

        User recorder = userRepository.findById(recordedByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + recordedByUserId));

        AcademicPerformance performance = performanceRepository
                .findByStudentIdAndTermIdAndSubjectId(student.getId(), term.getId().longValue(), subject.getId())
                .orElse(new AcademicPerformance());

        performance.setStudent(student);
        performance.setSchool(student.getSchool());
        performance.setTerm(term);
        performance.setGradeLevel(gradeLevel);
        performance.setSubject(subject);
        performance.setClassScore(request.classScore());
        performance.setExamScore(request.examScore());
        performance.setRemarks(request.remarks());
        performance.setRecordedBy(recorder);

        AcademicPerformance saved = performanceRepository.save(performance);

        return PerformanceResponse.from(saved);
    }

    @Transactional(readOnly = true)
    @Override
    public List<PerformanceResponse> getStudentTermResults(Long studentId, Long termId) {
        return performanceRepository.findByStudentIdAndTermId(studentId, termId)
                .stream()
                .map(PerformanceResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    @Override
    public List<PerformanceResponse> getClassResults(Long schoolId, Long gradeLevelId, Long termId) {
        return performanceRepository.findBySchoolIdAndTermIdAndGradeLevelId(schoolId, termId, gradeLevelId.shortValue())
                .stream()
                .map(PerformanceResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    @Override
    public ReportCardResponse generateReportCard(Long studentId, Long termId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));

        Term term = termRepository.findById(termId)
                .orElseThrow(() -> new ResourceNotFoundException("Term not found with ID: " + termId));

        List<AcademicPerformance> performances = performanceRepository.findByStudentIdAndTermId(studentId, termId);

        List<Object[]> attendanceRows = attendanceRecordRepository.getAttendanceSummary(studentId, termId);
        long present = 0, absent = 0, late = 0, excused = 0;
        for (Object[] row : attendanceRows) {
            if (row == null || row.length < 2) continue;
            String status = String.valueOf(row[0]);
            long cnt = ((Number) row[1]).longValue();
            switch (status) {
                case "PRESENT": present = cnt; break;
                case "ABSENT": absent = cnt; break;
                case "LATE": late = cnt; break;
                case "EXCUSED": excused = cnt; break;
                default: break;
            }
        }
        long totalSessions = present + absent + late + excused;
        double attendancePct = totalSessions > 0 ? ((double)(present + late) * 100.0) / totalSessions : 0.0;

        double averageScore = performances.stream()
                .map(AcademicPerformance::getTotalScore)
                .filter(Objects::nonNull)
                .mapToDouble(BigDecimal::doubleValue)
                .average().orElse(0.0);

        List<AcademicPerformance> classRecords = performanceRepository
                .findBySchoolIdAndTermIdAndGradeLevelId(student.getSchool().getId(), termId, student.getGradeLevel().getId());

        Map<Long, Double> avgByStudent = classRecords.stream()
                .filter(r -> r.getTotalScore() != null)
                .collect(Collectors.groupingBy(r -> r.getStudent().getId(), Collectors.averagingDouble(r -> r.getTotalScore().doubleValue())));

        List<Map.Entry<Long, Double>> ranking = avgByStudent.entrySet().stream()
                .sorted(Map.Entry.<Long, Double>comparingByValue(Comparator.reverseOrder()))
                .collect(Collectors.toList());

        Integer classPosition = null;
        for (int i = 0; i < ranking.size(); i++) {
            if (Objects.equals(ranking.get(i).getKey(), studentId)) {
                classPosition = i + 1;
                break;
            }
        }

        int totalStudents = avgByStudent.size();

        List<ReportCardResponse.ReportCardSubjectLine> subjectLines = performances.stream()
                .map(p -> ReportCardResponse.ReportCardSubjectLine.builder()
                        .subjectId(p.getSubject() != null ? (p.getSubject().getId() != null ? p.getSubject().getId().longValue() : null) : null)
                        .subjectName(p.getSubject() != null ? p.getSubject().getName() : null)
                        .classScore(p.getClassScore() != null ? p.getClassScore().doubleValue() : null)
                        .examScore(p.getExamScore() != null ? p.getExamScore().doubleValue() : null)
                        .totalScore(p.getTotalScore() != null ? p.getTotalScore().doubleValue() : null)
                        .grade(p.getGrade())
                        .remarks(p.getRemarks())
                        .build())
                .collect(Collectors.toList());

        return ReportCardResponse.builder()
                .studentId(student.getId())
                .studentName(student.getFullName())
                .usid(student.getUsid())
                .schoolName(student.getSchool() != null ? student.getSchool().getName() : null)
                .gradeCode(student.getGradeLevel() != null ? student.getGradeLevel().getCode() : null)
                .gradeName(student.getGradeLevel() != null ? student.getGradeLevel().getName() : null)
                .termNumber(term.getTermNumber() != null ? term.getTermNumber().intValue() : null)
                .academicYear(term.getAcademicYear() != null ? term.getAcademicYear().getLabel() : null)
                .averageScore(averageScore)
                .classPosition(classPosition)
                .totalStudents(totalStudents)
                .attendancePct(attendancePct)
                .teacherRemark(null)
                .subjects(subjectLines)
                .build();
    }
}
