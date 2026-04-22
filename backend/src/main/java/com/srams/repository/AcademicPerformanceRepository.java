package com.srams.repository;

import com.srams.entity.AcademicPerformance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface AcademicPerformanceRepository extends JpaRepository<AcademicPerformance, Long> {

    @Query("""
        select ap
        from AcademicPerformance ap
        join fetch ap.student s
        join fetch ap.term t
        join fetch ap.subject sub
        where s.id = :studentId
          and t.id = :termId
          and sub.id = :subjectId
    """)
    Optional<AcademicPerformance> findByStudentIdAndTermIdAndSubjectId(
            Long studentId, Long termId, Integer subjectId);

    @Query("""
        select ap
        from AcademicPerformance ap
        join fetch ap.student s
        join fetch ap.term t
        join fetch ap.subject sub
        where s.id = :studentId
          and t.id = :termId
        order by sub.name asc
    """)
    List<AcademicPerformance> findByStudentIdAndTermId(Long studentId, Long termId);

    @Query("""
        select ap
        from AcademicPerformance ap
        join fetch ap.school sch
        join fetch ap.term t
        join fetch ap.gradeLevel gl
        join fetch ap.subject sub
        join fetch ap.student s
        where sch.id = :schoolId
          and t.id = :termId
          and gl.id = :gradeLevelId
        order by s.lastName asc, s.firstName asc, sub.name asc
    """)
    List<AcademicPerformance> findBySchoolIdAndTermIdAndGradeLevelId(
            Long schoolId, Long termId, Short gradeLevelId);
}