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

    @Query("SELECT ar FROM AttendanceRecord ar " +
            "JOIN FETCH ar.student " +
            "JOIN FETCH ar.term " +
            "JOIN FETCH ar.gradeLevel " +
            "WHERE ar.school.id = :schoolId AND ar.attendanceDate = :date AND ar.gradeLevel.id = :gradeLevelId")
    List<AttendanceRecord> findBySchoolIdAndAttendanceDateAndGradeLevelId(
            @Param("schoolId") Long schoolId, @Param("date") LocalDate date, @Param("gradeLevelId") Short gradeLevelId);

    @Query("SELECT ar FROM AttendanceRecord ar " +
            "JOIN FETCH ar.student " +
            "JOIN FETCH ar.term " +
            "JOIN FETCH ar.gradeLevel " +
            "WHERE ar.student.id = :studentId " +
            "AND ar.term.id = :termId ORDER BY ar.attendanceDate, ar.period")
    List<AttendanceRecord> findByStudentAndTerm(@Param("studentId") Long studentId,
                                                @Param("termId") Long termId);

    @Query("SELECT ar.status, COUNT(ar) FROM AttendanceRecord ar " +
            "WHERE ar.student.id = :studentId AND ar.term.id = :termId GROUP BY ar.status")
    List<Object[]> getAttendanceSummary(@Param("studentId") Long studentId,
                                        @Param("termId") Long termId);

    @Query("SELECT ar FROM AttendanceRecord ar " +
            "JOIN FETCH ar.student " +
            "JOIN FETCH ar.term " +
            "JOIN FETCH ar.gradeLevel " +
            "WHERE ar.school.id = :schoolId AND ar.attendanceDate BETWEEN :from AND :to")
    List<AttendanceRecord> findBySchoolIdAndAttendanceDateBetween(
            @Param("schoolId") Long schoolId, @Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT ar FROM AttendanceRecord ar " +
            "JOIN FETCH ar.student " +
            "JOIN FETCH ar.term " +
            "JOIN FETCH ar.gradeLevel " +
            "WHERE ar.attendanceDate BETWEEN :from AND :to")
    List<AttendanceRecord> findByAttendanceDateBetween(
            @Param("from") LocalDate from, @Param("to") LocalDate to);
}
