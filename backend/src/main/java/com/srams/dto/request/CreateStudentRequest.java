package com.srams.dto.request;

import com.srams.enums.Gender;
import java.time.LocalDate;

public record CreateStudentRequest(
        Long schoolId,
        Long gradeLevelId,
        String firstName,
        String middleName,
        String lastName,
        LocalDate dateOfBirth,
        Gender gender,
        String guardianName,
        String guardianPhone,
        String guardianRelation,
        String address,
        LocalDate enrollmentDate,
        Integer enrollmentYear) {
}
