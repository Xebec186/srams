package com.srams.dto.response;

import java.time.LocalDateTime;

public record TeacherClassAssignmentResponse(
        Long id,
        Long teacherId,
        String teacherName,
        Long schoolId,
        Short gradeLevelId,
        String gradeLevelCode,
        Byte termNumber,
        boolean active,
        LocalDateTime createdAt
) { }