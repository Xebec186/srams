package com.srams.service;

import com.srams.dto.request.AssignTeacherToClassRequest;
import com.srams.dto.response.TeacherClassAssignmentResponse;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface TeacherClassAssignmentService {
    TeacherClassAssignmentResponse assignTeacher(String actorUsername, AssignTeacherToClassRequest request);
    List<TeacherClassAssignmentResponse> listAssignments(String actorUsername, Long schoolId, Integer termId, Short gradeLevelId);
    List<TeacherClassAssignmentResponse> getTeacherAssignments(Long teacherId);
    void deactivate(String actorUsername, Long assignmentId);
}