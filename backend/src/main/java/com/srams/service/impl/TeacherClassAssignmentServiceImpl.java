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

        School scopeSchool = actor.getRole() == Role.ADMIN
                ? null
                : actor.getSchool();

        Teacher teacher = teacherRepository.findById(request.teacherId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));

        if (scopeSchool != null && !teacher.getSchool().getId().equals(scopeSchool.getId())) {
            throw new ConflictException("Teacher does not belong to your school");
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

        if (actor.getRole() != Role.ADMIN && !assignment.getSchool().getId().equals(actor.getSchool().getId())) {
            throw new ConflictException("You cannot modify assignments outside your school");
        }

        assignment.setActive(false);
        assignmentRepository.save(assignment);
    }

    @Transactional
    @Override
    public List<TeacherClassAssignmentResponse> getTeacherAssignments(Long teacherId) {
        return assignmentRepository.findByTeacherId(teacherId).stream()
                .map(a -> new TeacherClassAssignmentResponse(
                        a.getId(),
                        a.getTeacher().getId(),
                        a.getTeacher().getUser().getFullName(),
                        a.getSchool().getId(),
                        a.getGradeLevel().getId(),
                        a.getGradeLevel().getCode(),
                        a.getTerm().getId(),
                        a.isActive(),
                        a.getCreatedAt()
                ))
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
                a.getTerm().getId(),
                a.isActive(),
                a.getCreatedAt()
        );
    }
}