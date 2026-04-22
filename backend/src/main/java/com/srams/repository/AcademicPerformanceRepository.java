package com.srams.repository;


import com.srams.entity.AcademicPerformance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AcademicPerformanceRepository extends JpaRepository<AcademicPerformance, Long> {
    Optional<AcademicPerformance> findByStudentIdAndTermIdAndSubjectId(
            Long studentId, Long termId, Integer subjectId);

    List<AcademicPerformance> findByStudentIdAndTermId(Long studentId, Long termId);

    List<AcademicPerformance> findBySchoolIdAndTermIdAndGradeLevelId(
            Long schoolId, Long termId, Short gradeLevelId);
}
