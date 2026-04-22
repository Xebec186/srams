package com.srams.repository;

import com.srams.entity.Teacher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface TeacherRepository extends JpaRepository<Teacher, Long> {

    Optional<Teacher> findByUserId(Long userId);

    @Query("""
        select t
        from Teacher t
        join t.user u
        where t.school.id = :schoolId
          and (
                :q is null or :q = '' or
                lower(concat(coalesce(u.firstName, ''), ' ', coalesce(u.lastName, ''))) like lower(concat('%', :q, '%')) or
                lower(u.username) like lower(concat('%', :q, '%')) or
                lower(u.email) like lower(concat('%', :q, '%')) or
                lower(coalesce(t.staffId, '')) like lower(concat('%', :q, '%'))
          )
        order by u.lastName asc, u.firstName asc
    """)
    Page<Teacher> searchBySchool(
            @Param("schoolId") Long schoolId,
            @Param("q") String q,
            Pageable pageable
    );
}