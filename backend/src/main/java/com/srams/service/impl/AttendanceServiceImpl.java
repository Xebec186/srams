package com.srams.service.impl;

import com.srams.dto.request.BulkAttendanceRequest;
import com.srams.dto.request.MarkAttendanceRequest;
import com.srams.dto.response.AttendanceResponse;
import com.srams.dto.response.AttendanceSummaryResponse;
import com.srams.dto.response.SchoolAttendanceReportResponse;
import com.srams.entity.AttendanceRecord;
import com.srams.entity.Student;
import com.srams.entity.Term;
import com.srams.entity.User;
import com.srams.exception.BadRequestException;
import com.srams.exception.ConflictException;
import com.srams.exception.ResourceNotFoundException;
import com.srams.repository.AttendanceRecordRepository;
import com.srams.repository.SchoolRepository;
import com.srams.repository.StudentRepository;
import com.srams.repository.TermRepository;
import com.srams.repository.UserRepository;
import com.srams.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRecordRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final SchoolRepository schoolRepository;
    private final TermRepository termRepository;
    private final UserRepository userRepository;

    @Transactional
    @Override
    public AttendanceResponse markAttendance(MarkAttendanceRequest request, Long markedByUserId) {
        if (request.attendanceDate().isAfter(LocalDate.now())) {
            throw new BadRequestException("Attendance date cannot be in the future");
        }
        if (attendanceRepository.existsByStudentIdAndAttendanceDateAndPeriod(
            request.studentId(), request.attendanceDate(), request.period())) {
            throw new ConflictException("Attendance already marked for this student, date, and period");
        }
        Student student = studentRepository.findById(request.studentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        Term term = termRepository.findById(request.termId())
                .orElseThrow(() -> new ResourceNotFoundException("Term not found"));
        User markedBy = userRepository.findById(markedByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        AttendanceRecord record = new AttendanceRecord();
        record.setStudent(student);
        record.setSchool(student.getSchool());
        record.setGradeLevel(student.getGradeLevel());
        record.setTerm(term);
        record.setAttendanceDate(request.attendanceDate());
        record.setPeriod(request.period());
        record.setStatus(request.status());
        record.setAbsenceReason(request.absenceReason());
        record.setMarkedBy(markedBy);

        return AttendanceResponse.from(attendanceRepository.save(record));
    }

    @Transactional
    @Override
    public List<AttendanceResponse> markBulkAttendance(BulkAttendanceRequest request, Long markedByUserId) {
        return request.records().stream()
            .map(r -> markAttendance(r, markedByUserId))
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    @Override
    public List<AttendanceResponse> getAttendanceBySchoolDateGrade(Long schoolId, LocalDate date, Long gradeLevelId) {
        return attendanceRepository.findBySchoolIdAndAttendanceDateAndGradeLevelId(schoolId, date, gradeLevelId.shortValue())
                .stream().map(AttendanceResponse::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    @Override
    public List<AttendanceResponse> getStudentAttendanceByTerm(Long studentId, Long termId) {
        return attendanceRepository.findByStudentAndTerm(studentId, termId)
                .stream().map(AttendanceResponse::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    @Override
    public SchoolAttendanceReportResponse getSchoolAttendanceReport(Long schoolId, LocalDate from, LocalDate to) {
        List<AttendanceRecord> records = attendanceRepository.findBySchoolIdAndAttendanceDateBetween(schoolId, from, to);
        long present = records.stream().filter(r -> r.getStatus() == com.srams.enums.AttendanceStatus.PRESENT).count();
        long absent = records.stream().filter(r -> r.getStatus() == com.srams.enums.AttendanceStatus.ABSENT).count();
        long total = records.size();
        return new SchoolAttendanceReportResponse(schoolId, from, to, present, absent, total);
    }

    @Transactional(readOnly = true)
    @Override
    public AttendanceSummaryResponse getStudentAttendanceSummary(Long studentId, Long termId) {
        List<Object[]> results = attendanceRepository.getAttendanceSummary(studentId, termId);
        Map<String, Long> counts = new HashMap<>();
        results.forEach(row -> counts.put(row[0].toString(), ((Number) row[1]).longValue()));

        long present  = counts.getOrDefault("PRESENT",  0L);
        long absent   = counts.getOrDefault("ABSENT",   0L);
        long late     = counts.getOrDefault("LATE",     0L);
        long excused  = counts.getOrDefault("EXCUSED",  0L);
        long total    = present + absent + late + excused;
        double pct    = total > 0 ? (present + late) * 100.0 / total : 0.0;

        return new AttendanceSummaryResponse(present, absent, late, excused, total,
                Math.round(pct * 100.0) / 100.0);
    }
}
