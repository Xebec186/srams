package com.srams.service.impl;

import com.srams.dto.response.SchoolPerformanceSummary;
import com.srams.dto.response.SystemAttendanceReportResponse;
import com.srams.entity.AttendanceRecord;
import com.srams.entity.School;
import com.srams.entity.AcademicPerformance;
import com.srams.repository.AcademicPerformanceRepository;
import com.srams.repository.AttendanceRecordRepository;
import com.srams.repository.SchoolRepository;
import com.srams.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.DoubleSummaryStatistics;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final SchoolRepository schoolRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final AcademicPerformanceRepository performanceRepository;

    @Override
    public SystemAttendanceReportResponse generateSystemAttendanceReport(Integer academicYearId, Integer termId) {
        List<School> schools = schoolRepository.findByActiveTrue(Pageable.unpaged()).getContent();

        List<SystemAttendanceReportResponse.SchoolAttendanceSummary> schoolSummaries = new ArrayList<>();

        int totalSessions = 0;
        int totalPresent = 0;
        int totalAbsent = 0;
        int totalLate = 0;
        int totalExcused = 0;

        List<AttendanceRecord> all = attendanceRecordRepository.findAll();

        for (School s : schools) {
            List<AttendanceRecord> recs = all.stream()
                    .filter(ar -> ar.getSchool() != null && Objects.equals(ar.getSchool().getId(), s.getId()))
                    .filter(ar -> ar.getTerm() != null && Objects.equals(ar.getTerm().getId(), termId))
                    .collect(Collectors.toList());

            int present = (int) recs.stream().filter(r -> r.getStatus() != null && r.getStatus().name().equals("PRESENT")).count();
            int absent = (int) recs.stream().filter(r -> r.getStatus() != null && r.getStatus().name().equals("ABSENT")).count();
            int late = (int) recs.stream().filter(r -> r.getStatus() != null && r.getStatus().name().equals("LATE")).count();
            int excused = (int) recs.stream().filter(r -> r.getStatus() != null && r.getStatus().name().equals("EXCUSED")).count();

            int sessions = recs.size();
            double attendanceRate = sessions > 0 ? ((double)(present + late) * 100.0) / sessions : 0.0;

            totalSessions += sessions;
            totalPresent += present;
            totalAbsent += absent;
            totalLate += late;
            totalExcused += excused;

            schoolSummaries.add(SystemAttendanceReportResponse.SchoolAttendanceSummary.builder()
                    .schoolId(s.getId())
                    .schoolName(s.getName())
                    .region(s.getRegion() != null ? s.getRegion().getName() : null)
                    .totalSessions(sessions)
                    .present(present)
                    .absent(absent)
                    .attendanceRate(attendanceRate)
                    .build());
        }

        double overallRate = totalSessions > 0 ? ((double)(totalPresent + totalLate) * 100.0) / totalSessions : 0.0;

        schoolSummaries.sort(Comparator.comparingDouble(SystemAttendanceReportResponse.SchoolAttendanceSummary::attendanceRate).reversed());

        return SystemAttendanceReportResponse.builder()
                .termId(termId)
                .totalSessions(totalSessions)
                .totalPresent(totalPresent)
                .totalAbsent(totalAbsent)
                .totalLate(totalLate)
                .totalExcused(totalExcused)
                .overallAttendanceRate(overallRate)
                .schools(schoolSummaries)
                .build();
    }

    @Override
    public List<SchoolPerformanceSummary> generateSystemPerformanceReport(Integer termId) {
        List<School> schools = schoolRepository.findByActiveTrue(Pageable.unpaged()).getContent();

        List<AcademicPerformance> all = performanceRepository.findAll();

        List<SchoolPerformanceSummary> summaries = new ArrayList<>();

        for (School s : schools) {
            List<AcademicPerformance> recs = all.stream()
                    .filter(p -> p.getSchool() != null && Objects.equals(p.getSchool().getId(), s.getId()))
                    .filter(p -> p.getTerm() != null && Objects.equals(p.getTerm().getId(), termId))
                    .collect(Collectors.toList());

            Double average = recs.stream()
                    .map(AcademicPerformance::getTotalScore)
                    .filter(Objects::nonNull)
                    .mapToDouble(BigDecimalValue::toDouble)
                    .average().orElse(0.0);

            int totalRecords = recs.size();
            long passCount = recs.stream().filter(r -> r.getTotalScore() != null && r.getTotalScore().doubleValue() >= 50.0).count();
            long distinctionCount = recs.stream().filter(r -> r.getGrade() != null && r.getGrade().equalsIgnoreCase("A1")).count();

            double passRate = totalRecords > 0 ? (passCount * 100.0) / totalRecords : 0.0;
            double distinctionRate = totalRecords > 0 ? (distinctionCount * 100.0) / totalRecords : 0.0;

            summaries.add(SchoolPerformanceSummary.builder()
                    .schoolId(s.getId())
                    .schoolName(s.getName())
                    .region(s.getRegion() != null ? s.getRegion().getName() : null)
                    .averageScore(average)
                    .totalRecords(totalRecords)
                    .passRate(passRate)
                    .distinctionRate(distinctionRate)
                    .build());
        }

        summaries.sort(Comparator.comparingDouble(SchoolPerformanceSummary::averageScore).reversed());
        return summaries;
    }

    // small helper to avoid importing BigDecimal in the method stream chain
    private static class BigDecimalValue {
        static double toDouble(java.math.BigDecimal b) { return b.doubleValue(); }
    }
}
