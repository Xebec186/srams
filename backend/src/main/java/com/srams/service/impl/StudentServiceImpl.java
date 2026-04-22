package com.srams.service.impl;

import com.srams.dto.request.CreateStudentRequest;
import com.srams.dto.request.UpdateStudentRequest;
import com.srams.dto.response.StudentResponse;
import com.srams.entity.GradeLevel;
import com.srams.entity.School;
import com.srams.entity.Student;
import com.srams.entity.User;
import com.srams.exception.ResourceNotFoundException;
import com.srams.repository.GradeLevelRepository;
import com.srams.repository.RegionRepository;
import com.srams.repository.SchoolRepository;
import com.srams.repository.StudentRepository;
import com.srams.repository.UserRepository;
import com.srams.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final SchoolRepository schoolRepository;
    private final GradeLevelRepository gradeLevelRepository;
    private final UserRepository userRepository;
    private final RegionRepository regionRepository;

    @Transactional
    @Override
    public StudentResponse registerStudent(CreateStudentRequest request, Long createdByUserId) {
        School school = schoolRepository.findById(request.schoolId())
                .orElseThrow(() -> new ResourceNotFoundException("School not found"));
        GradeLevel gradeLevel = gradeLevelRepository.findById(request.gradeLevelId().shortValue())
                .orElseThrow(() -> new ResourceNotFoundException("Grade level not found"));
        User createdBy = userRepository.findById(createdByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String usid = generateUsid(request.schoolId(), request.enrollmentYear());

        Student student = new Student();
        student.setUsid(usid);
        student.setSchool(school);
        student.setGradeLevel(gradeLevel);
        student.setFirstName(request.firstName());
        student.setMiddleName(request.middleName());
        student.setLastName(request.lastName());
        student.setDateOfBirth(request.dateOfBirth());
        student.setGender(request.gender());
        student.setGuardianName(request.guardianName());
        student.setGuardianPhone(request.guardianPhone());
        student.setGuardianRelation(request.guardianRelation());
        student.setAddress(request.address());
        student.setEnrollmentDate(request.enrollmentDate());
        student.setEnrollmentYear(request.enrollmentYear());
        student.setCreatedBy(createdBy);

        Student saved = studentRepository.save(student);
        return StudentResponse.from(saved);
    }

    @Transactional
    @Override
    public String generateUsid(Long schoolId, int enrollmentYear) {
        School school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new ResourceNotFoundException("School not found"));
        String regionCode = school.getRegion().getCode();
        String schoolCode = school.getSchoolCode();

        int sequence = studentRepository
                .findMaxSequenceForSchoolYear(regionCode, schoolCode, enrollmentYear)
                .orElse(0) + 1;

        String baseDigits = String.format("%s%d%04d", schoolCode, enrollmentYear, sequence);
        int checkDigit = computeLuhnCheckDigit(baseDigits);

        String candidate = String.format("GH-%s-%s-%d-%04d-%d",
                regionCode, schoolCode, enrollmentYear, sequence, checkDigit);

        while (studentRepository.existsByUsid(candidate)) {
            sequence++;
            baseDigits = String.format("%s%d%04d", schoolCode, enrollmentYear, sequence);
            checkDigit = computeLuhnCheckDigit(baseDigits);
            candidate = String.format("GH-%s-%s-%d-%04d-%d",
                    regionCode, schoolCode, enrollmentYear, sequence, checkDigit);
        }
        return candidate;
    }

    @Transactional
    @Override
    public void updateStudentStatus(Long id, com.srams.enums.StudentStatus status) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        student.setStatus(status);
        studentRepository.save(student);
    }

    @Transactional
    @Override
    public StudentResponse updateStudent(Long id, UpdateStudentRequest request) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        student.setFirstName(request.firstName());
        student.setMiddleName(request.middleName());
        student.setLastName(request.lastName());
        student.setDateOfBirth(request.dateOfBirth());
        student.setGender(request.gender());
        student.setGuardianName(request.guardianName());
        student.setGuardianPhone(request.guardianPhone());
        student.setGuardianRelation(request.guardianRelation());
        student.setAddress(request.address());
        Student saved = studentRepository.save(student);
        return StudentResponse.from(saved);
    }

    @Transactional(readOnly = true)
    @Override
    public StudentResponse getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        return StudentResponse.from(student);
    }

    @Transactional(readOnly = true)
    @Override
    public StudentResponse getStudentByUsid(String usid) {
        Student student = studentRepository.findByUsid(usid)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        return StudentResponse.from(student);
    }

    @Transactional(readOnly = true)
    @Override
    public Page<StudentResponse> getStudentsBySchool(Long schoolId, String query, Pageable pageable) {
        return studentRepository.searchBySchool(schoolId, query, pageable)
                .map(StudentResponse::from);
    }

    @Transactional(readOnly = true)
    @Override
    public Page<StudentResponse> getStudentsBySchoolAndGrade(Long schoolId, Short gradeLevelId, String query, Pageable pageable) {
        return studentRepository.searchBySchoolAndGrade(schoolId, gradeLevelId, query, pageable)
                .map(StudentResponse::from);
    }

    @Transactional(readOnly = true)
    @Override
    public Page<StudentResponse> searchAllStudents(String query, Pageable pageable) {
        return studentRepository.searchAll(query, pageable)
                .map(StudentResponse::from);
    }

    private int computeLuhnCheckDigit(String digits) {
    int total = 0;
    boolean alternate = false;
    for (int i = digits.length() - 1; i >= 0; i--) {
        int d = Character.getNumericValue(digits.charAt(i));
        if (alternate) {
            d *= 2;
            if (d > 9) d -= 9;
        }
        total += d;
        alternate = !alternate;
    }
    return (10 - (total % 10)) % 10;
    }
}
