package com.srams.repository;

import com.srams.entity.AttendanceRecord;
import com.srams.enums.Period;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigInteger;
import java.time.LocalDate;
import java.util.List;

public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, BigInteger> {
    boolean existsByStudentIdAndAttendanceDateAndPeriod(Long studentId, LocalDate date, Period period);

    List<AttendanceRecord> findBySchoolIdAndAttendanceDateAndGradeLevelId(
            Long schoolId, LocalDate date, Short gradeLevelId);

    @Query("SELECT ar FROM AttendanceRecord ar WHERE ar.student.id = :studentId " +
            "AND ar.term.id = :termId ORDER BY ar.attendanceDate, ar.period")
    List<AttendanceRecord> findByStudentAndTerm(@Param("studentId") Long studentId,
                                                @Param("termId") Long termId);

    @Query("SELECT ar.status, COUNT(ar) FROM AttendanceRecord ar " +
            "WHERE ar.student.id = :studentId AND ar.term.id = :termId GROUP BY ar.status")
    List<Object[]> getAttendanceSummary(@Param("studentId") Long studentId,
                                        @Param("termId") Long termId);

    List<AttendanceRecord> findBySchoolIdAndAttendanceDateBetween(Long schoolId, LocalDate from, LocalDate to);
}
