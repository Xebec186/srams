package com.srams.repository;

import com.srams.entity.School;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SchoolRepository extends JpaRepository<School, Long> {
    List<School> findByRegionIdAndActiveTrue(Integer regionId);
    Page<School> findByActiveTrue(Pageable pageable);
    Optional<School> findBySchoolCodeAndRegionId(String schoolCode, Long regionId);
}
