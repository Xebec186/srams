package com.srams.repository;

import com.srams.entity.Term;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface TermRepository extends JpaRepository<Term, Long> {
    List<Term> findByAcademicYearId(Long academicYearId);
    Optional<Term> findByAcademicYearIdAndTermNumber(Long academicYearId, int termNumber);

    @Query("SELECT t FROM Term t JOIN t.academicYear ay WHERE ay.current = true")
    List<Term> findCurrentYearTerms();
}
