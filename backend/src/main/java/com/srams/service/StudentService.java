package com.srams.service;

import com.srams.dto.request.CreateStudentRequest;
import com.srams.dto.request.UpdateStudentRequest;
import com.srams.dto.response.StudentResponse;
import com.srams.enums.StudentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface StudentService {
    StudentResponse registerStudent(CreateStudentRequest request, Long createdByUserId);

    StudentResponse getStudentById(Long id);

    StudentResponse getStudentByUsid(String usid);

    Page<StudentResponse> getStudentsBySchool(Long schoolId, String query, Pageable pageable);

    Page<StudentResponse> searchAllStudents(String query, Pageable pageable);

    StudentResponse updateStudent(Long id, UpdateStudentRequest request);

    void updateStudentStatus(Long id, StudentStatus status);

    String generateUsid(Long schoolId, int enrollmentYear);
}
