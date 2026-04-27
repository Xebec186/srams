package com.srams.dto.response;

import com.srams.entity.AttendanceRecord;
import com.srams.entity.User;
import com.srams.enums.AttendanceStatus;
import com.srams.enums.Period;
import java.math.BigInteger;
import java.time.LocalDate;

public record AttendanceResponse(
        BigInteger id,
        Long studentId,
        String studentName,
        Long schoolId,
        Long termId,
        LocalDate attendanceDate,
        Period period,
        AttendanceStatus status,
        String absenceReason,
        Long markedByUserId,
        String markedByName) {

    public static AttendanceResponse from(AttendanceRecord r) {
        if (r == null) return null;
        var s = r.getStudent();
        var t = r.getTerm();
        User m = r.getMarkedBy();
        return new AttendanceResponse(
                r.getId(),
                s != null ? s.getId() : null,
                s != null ? s.getFullName() : null,
                r.getSchool() != null ? r.getSchool().getId() : null,
                t != null && t.getId() != null ? t.getId().longValue() : null,
                r.getAttendanceDate(),
                r.getPeriod(),
                r.getStatus(),
                r.getAbsenceReason(),
                m != null ? m.getId() : null,
                m != null ? m.getFullName() : null
        );
    }
}
