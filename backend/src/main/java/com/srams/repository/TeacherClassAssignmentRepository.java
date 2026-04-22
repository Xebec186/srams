package com.srams.repository;

import com.srams.entity.TeacherClassAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TeacherClassAssignmentRepository extends JpaRepository<TeacherClassAssignment, Long> {
    @Query("SELECT tca FROM TeacherClassAssignment tca " +
            "JOIN FETCH tca.teacher " +
            "JOIN FETCH tca.school " +
            "JOIN FETCH tca.gradeLevel " +
            "JOIN FETCH tca.term " +
            "WHERE tca.teacher.id = :teacherId AND tca.term.id = :termId AND tca.active = true")
    List<TeacherClassAssignment> findByTeacherIdAndTermIdAndActiveTrue(@Param("teacherId") Long teacherId, @Param("termId") Integer termId);

    @Query("SELECT tca FROM TeacherClassAssignment tca " +
            "JOIN FETCH tca.teacher " +
            "JOIN FETCH tca.school " +
            "JOIN FETCH tca.gradeLevel " +
            "JOIN FETCH tca.term " +
            "WHERE tca.school.id = :schoolId AND tca.gradeLevel.id = :gradeLevelId AND tca.term.id = :termId")
    List<TeacherClassAssignment> findBySchoolIdAndGradeLevelIdAndTermId(
            @Param("schoolId") Long schoolId, @Param("gradeLevelId") Short gradeLevelId, @Param("termId") Integer termId);

    boolean existsByTeacherIdAndGradeLevelIdAndTermId(Long teacherId, Short gradeLevelId, Integer termId);

    boolean existsByTeacherIdAndGradeLevelIdAndTermIdAndActiveTrue(Long teacherId, Short gradeLevelId, Integer termId);

    List<TeacherClassAssignment> findBySchoolIdAndTermIdAndGradeLevelIdAndActiveTrue(
            Long schoolId, Integer termId, Short gradeLevelId);

    Optional<TeacherClassAssignment> findByIdAndSchoolId(Long id, Long schoolId);

    Optional<TeacherClassAssignment> findByTeacherId(Long teacherId);
}
