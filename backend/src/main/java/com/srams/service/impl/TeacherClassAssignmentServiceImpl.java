package com.srams.service.impl;

import com.srams.dto.request.AssignTeacherToClassRequest;
import com.srams.dto.response.TeacherClassAssignmentResponse;
import com.srams.entity.*;
import com.srams.enums.Role;
import com.srams.exception.ConflictException;
import com.srams.exception.ResourceNotFoundException;
import com.srams.repository.*;
import com.srams.service.TeacherClassAssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeacherClassAssignmentServiceImpl implements TeacherClassAssignmentService {

    private final UserRepository userRepository;
    private final TeacherRepository teacherRepository;
    private final TeacherClassAssignmentRepository assignmentRepository;
    private final SchoolRepository schoolRepository;
    private final GradeLevelRepository gradeLevelRepository;
    private final TermRepository termRepository;

    @Transactional
    @Override
    public TeacherClassAssignmentResponse assignTeacher(String actorUsername, AssignTeacherToClassRequest request) {
        User actor = userRepository.findByUsername(actorUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (actor.getRole() == Role.SCHOOL_ADMIN && actor.getSchool() == null) {
            throw new ConflictException("Your account is not linked to any school");
        }

        School scopeSchool = actor.getRole() == Role.ADMIN
                ? null
                : actor.getSchool();

        Teacher teacher = teacherRepository.findById(request.teacherId())
                .orElseGet(() -> teacherRepository.findByUser_Id(request.teacherId())
                        .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with ID or User ID: " + request.teacherId())));

        if (scopeSchool != null) {
            Long teacherSchoolId = teacher.getSchool().getId();
            Long actorSchoolId = scopeSchool.getId();
            Long userSchoolId = teacher.getUser().getSchool() != null ? teacher.getUser().getSchool().getId() : null;
            
            if (!teacherSchoolId.equals(actorSchoolId)) {
                // Check if user school matches actor school even if teacher profile school doesn't
                if (userSchoolId != null && userSchoolId.equals(actorSchoolId)) {
                   teacher.setSchool(scopeSchool);
                   teacherRepository.save(teacher);
                   teacherSchoolId = actorSchoolId;
                } else {
                   throw new ConflictException("Teacher (Profile School: " + teacherSchoolId + ", User School: " + userSchoolId + ") does not belong to your school (ID: " + actorSchoolId + ")");
                }
            }
        }

        if (assignmentRepository.existsByTeacherIdAndGradeLevelIdAndTermIdAndActiveTrue(
                teacher.getId(), request.gradeLevelId(), request.termId())) {
            throw new ConflictException("Teacher is already assigned to this class for the selected term");
        }

        GradeLevel gradeLevel = gradeLevelRepository.findById(request.gradeLevelId())
                .orElseThrow(() -> new ResourceNotFoundException("Grade level not found"));
        Term term = termRepository.findById(Long.valueOf(request.termId()))
                .orElseThrow(() -> new ResourceNotFoundException("Term not found"));

        TeacherClassAssignment assignment = new TeacherClassAssignment();
        assignment.setTeacher(teacher);
        assignment.setSchool(teacher.getSchool());
        assignment.setGradeLevel(gradeLevel);
        assignment.setTerm(term);
        assignment.setActive(true);

        return toResponse(assignmentRepository.save(assignment));
    }

    @Transactional(readOnly = true)
    @Override
    public List<TeacherClassAssignmentResponse> listAssignments(String actorUsername, Long schoolId, Integer termId, Short gradeLevelId) {
        User actor = userRepository.findByUsername(actorUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Long effectiveSchoolId = actor.getRole() == Role.ADMIN
                ? schoolId
                : actor.getSchool().getId();

        return assignmentRepository
                .findBySchoolIdAndTermIdAndGradeLevelIdAndActiveTrue(effectiveSchoolId, termId, gradeLevelId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    @Override
    public void deactivate(String actorUsername, Long assignmentId) {
        User actor = userRepository.findByUsername(actorUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        TeacherClassAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        System.out.println("Actor school id: " + actor.getSchool().getId());
        System.out.println("Assignment school id: " + assignment.getSchool().getId());

        if (actor.getRole().equals(Role.SCHOOL_ADMIN) && !assignment.getSchool().getId().equals(actor.getSchool().getId())) {
            throw new ConflictException("You cannot modify assignments outside your school");
        }

        assignment.setActive(false);
        assignmentRepository.save(assignment);
    }

    @Transactional
    @Override
    public List<TeacherClassAssignmentResponse> getTeacherAssignments(Long teacherId) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseGet(() -> teacherRepository.findByUser_Id(teacherId)
                        .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with ID or User ID: " + teacherId)));

        return assignmentRepository.findByTeacherId(teacher.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    private TeacherClassAssignmentResponse toResponse(TeacherClassAssignment a) {
        var teacher = a.getTeacher();
        var user = teacher.getUser();
        var grade = a.getGradeLevel();

        return new TeacherClassAssignmentResponse(
                a.getId(),
                teacher.getId(),
                user.getFirstName() + " " + user.getLastName(),
                a.getSchool().getId(),
                grade.getId(),
                grade.getCode(),
                a.getTerm().getTermNumber(),
                a.isActive(),
                a.getCreatedAt()
        );
    }
}