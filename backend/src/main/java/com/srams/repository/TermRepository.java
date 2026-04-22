package com.srams.repository;

import com.srams.entity.Term;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TermRepository extends JpaRepository<Term, Long> {
    @Query("SELECT t FROM Term t JOIN FETCH t.academicYear WHERE t.academicYear.id = :academicYearId")
    List<Term> findByAcademicYearId(@Param("academicYearId") Long academicYearId);

    @Query("SELECT t FROM Term t JOIN FETCH t.academicYear WHERE t.academicYear.id = :academicYearId AND t.termNumber = :termNumber")
    Optional<Term> findByAcademicYearIdAndTermNumber(@Param("academicYearId") Long academicYearId, @Param("termNumber") int termNumber);

    @Query("SELECT t FROM Term t JOIN FETCH t.academicYear ay WHERE ay.current = true")
    List<Term> findCurrentYearTerms();
}
