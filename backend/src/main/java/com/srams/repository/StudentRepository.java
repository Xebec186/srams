package com.srams.repository;

import com.srams.entity.Student;
import com.srams.enums.StudentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUsid(String usid);
    boolean existsByUsid(String usid);
    Page<Student> findBySchoolId(Long schoolId, Pageable pageable);
    Page<Student> findBySchoolIdAndStatus(Long schoolId, StudentStatus status, Pageable pageable);

    @Query("SELECT s FROM Student s WHERE s.school.id = :schoolId AND " +
            "(LOWER(s.firstName) LIKE LOWER(CONCAT('%',:q,'%')) OR " +
            "LOWER(s.lastName) LIKE LOWER(CONCAT('%',:q,'%')) OR " +
            "s.usid LIKE CONCAT('%',:q,'%'))")
    Page<Student> searchBySchool(@Param("schoolId") Long schoolId,
                                 @Param("q") String query,
                                 Pageable pageable);

    @Query("SELECT s FROM Student s WHERE s.school.id = :schoolId AND s.gradeLevel.id = :gradeLevelId AND " +
            "(LOWER(s.firstName) LIKE LOWER(CONCAT('%',:q,'%')) OR " +
            "LOWER(s.lastName) LIKE LOWER(CONCAT('%',:q,'%')) OR " +
            "s.usid LIKE CONCAT('%',:q,'%'))")
    Page<Student> searchBySchoolAndGrade(@Param("schoolId") Long schoolId,
                                         @Param("gradeLevelId") Short gradeLevelId,
                                         @Param("q") String query,
                                         Pageable pageable);

    @Query("SELECT s FROM Student s WHERE " +
            "(LOWER(s.firstName) LIKE LOWER(CONCAT('%',:q,'%')) OR " +
            "LOWER(s.lastName) LIKE LOWER(CONCAT('%',:q,'%')) OR " +
            "s.usid LIKE CONCAT('%',:q,'%'))")
    Page<Student> searchAll(@Param("q") String query, Pageable pageable);

    @Query("SELECT MAX(CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(s.usid, '-', 5), '-', -1) AS integer)) " +
            "FROM Student s WHERE s.usid LIKE CONCAT('GH-',:rc,'-',:sc,'-',:yr,'-%')")
    Optional<Integer> findMaxSequenceForSchoolYear(@Param("rc") String regionCode,
                                                   @Param("sc") String schoolCode,
                                                   @Param("yr") int year);
}
