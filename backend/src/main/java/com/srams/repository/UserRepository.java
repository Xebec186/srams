package com.srams.repository;


import com.srams.entity.User;
import com.srams.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.school LEFT JOIN FETCH u.student WHERE u.username = :username")
    Optional<User> findByUsername(@Param("username") String username);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.school LEFT JOIN FETCH u.student WHERE u.email = :email")
    Optional<User> findByEmail(@Param("email") String email);

    boolean existsByUsername(String username);
    boolean existsByUsernameAndStudentId(String username, Long studentId);
    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.school LEFT JOIN FETCH u.student WHERE u.school.id = :schoolId AND u.role = :role")
    List<User> findBySchoolIdAndRole(@Param("schoolId") Long schoolId, @Param("role") Role role);

    @Query("""
        select u
        from User u
        where (:schoolId is null or u.school.id = :schoolId)
          and (:role is null or u.role = :role)
          and (
                :q is null or :q = '' or
                lower(concat(coalesce(u.firstName, ''), ' ', coalesce(u.lastName, ''))) like lower(concat('%', :q, '%')) or
                lower(u.username) like lower(concat('%', :q, '%')) or
                lower(u.email) like lower(concat('%', :q, '%'))
          )
        """)
    Page<User> searchUsers(
            @Param("schoolId") Long schoolId,
            @Param("role") Role role,
            @Param("q") String q,
            Pageable pageable
    );
}
