package com.srams.repository;

import com.srams.entity.School;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SchoolRepository extends JpaRepository<School, Long> {
    @Query("SELECT s FROM School s JOIN FETCH s.region WHERE s.region.id = :regionId AND s.active = true")
    List<School> findByRegionIdAndActiveTrue(@Param("regionId") Integer regionId);

    @Query(value = "SELECT s FROM School s JOIN FETCH s.region WHERE s.active = true",
           countQuery = "SELECT count(s) FROM School s WHERE s.active = true")
    Page<School> findByActiveTrue(Pageable pageable);

    @Query("SELECT s FROM School s JOIN FETCH s.region WHERE s.schoolCode = :schoolCode AND s.region.id = :regionId")
    Optional<School> findBySchoolCodeAndRegionId(@Param("schoolCode") String schoolCode, @Param("regionId") Long regionId);
}
