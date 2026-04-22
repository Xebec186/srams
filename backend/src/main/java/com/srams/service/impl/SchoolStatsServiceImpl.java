package com.srams.service.impl;

import com.srams.dto.response.SchoolStatsResponse;
import com.srams.entity.AttendanceRecord;
import com.srams.entity.School;
import com.srams.enums.StudentStatus;
import com.srams.enums.TransferStatus;
import com.srams.exception.ResourceNotFoundException;
import com.srams.repository.AttendanceRecordRepository;
import com.srams.repository.SchoolRepository;
import com.srams.repository.StudentRepository;
import com.srams.repository.TransferRequestRepository;
import com.srams.service.SchoolStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SchoolStatsServiceImpl implements SchoolStatsService {

    private final SchoolRepository schoolRepository;
    private final StudentRepository studentRepository;
    private final TransferRequestRepository transferRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;

    @Transactional(readOnly = true)
    @Override
    public SchoolStatsResponse getSchoolStats(Long schoolId, LocalDate date) {
        LocalDate reportDate = date != null ? date : LocalDate.now();

        School school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("School not found: " + schoolId));

        long totalStudents = studentRepository.countBySchoolId(schoolId);
        long activeStudents = studentRepository.countBySchoolIdAndStatus(schoolId, StudentStatus.ACTIVE);
        long pendingTransfers = transferRepository.countByFromSchoolIdAndStatus(schoolId, TransferStatus.PENDING);

        List<AttendanceRecord> records = attendanceRecordRepository
                .findBySchoolIdAndAttendanceDateBetween(schoolId, reportDate, reportDate);

        long present = 0;
        long absent = 0;
        long late = 0;
        long excused = 0;

        for (AttendanceRecord r : records) {
            if (r.getStatus() == null) {
                continue;
            }
            switch (r.getStatus()) {
                case PRESENT -> present++;
                case ABSENT -> absent++;
                case LATE -> late++;
                case EXCUSED -> excused++;
            }
        }

        long totalAttendance = present + absent + late + excused;
        double attendanceRate = totalAttendance > 0
                ? Math.round(((present + late) * 10000.0 / totalAttendance)) / 100.0
                : 0.0;

        return new SchoolStatsResponse(
                school.getId(),
                school.getName(),
                reportDate,
                totalStudents,
                activeStudents,
                pendingTransfers,
                present,
                absent,
                late,
                excused,
                totalAttendance,
                attendanceRate
        );
    }
}