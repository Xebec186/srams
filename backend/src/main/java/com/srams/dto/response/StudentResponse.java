package com.srams.dto.response;

import com.srams.entity.Student;
import com.srams.enums.Gender;

import java.time.LocalDate;

public record StudentResponse(
        Long id,
        String usid,
        String firstName,
        String middleName,
        String lastName,
        String fullName,
        LocalDate dateOfBirth,
        Gender gender,
        Long schoolId,
        Long gradeLevelId,
        String nationality,
        String guardianPhone,
        String guardianRelation,
        String address,
        LocalDate enrollmentDate,
        Integer enrollmentYear,
        String photoUrl) {

    public static StudentResponse from(Student s) {
        if (s == null) return null;
        return new StudentResponse(
                s.getId(),
                s.getUsid(),
                s.getFirstName(),
                s.getMiddleName(),
                s.getLastName(),
                s.getFullName(),
                s.getDateOfBirth(),
                s.getGender(),
                s.getSchool() != null ? s.getSchool().getId() : null,
                s.getGradeLevel() != null && s.getGradeLevel().getId() != null ? s.getGradeLevel().getId().longValue() : null,
                s.getNationality(),
                s.getGuardianPhone(),
                s.getGuardianRelation(),
                s.getAddress(),
                s.getEnrollmentDate(),
                s.getEnrollmentYear(),
                s.getPhotoUrl()
        );
    }
}
