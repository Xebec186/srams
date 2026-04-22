package com.srams.repository;

import com.srams.entity.TeacherClassAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeacherClassAssignmentRepository extends JpaRepository<TeacherClassAssignment, Long> {
    List<TeacherClassAssignment> findByTeacherIdAndTermIdAndActiveTrue(Long teacherId, Integer termId);
    List<TeacherClassAssignment> findBySchoolIdAndGradeLevelIdAndTermId(
            Long schoolId, Short gradeLevelId, Integer termId);
    boolean existsByTeacherIdAndGradeLevelIdAndTermId(Long teacherId, Short gradeLevelId, Integer termId);
}
