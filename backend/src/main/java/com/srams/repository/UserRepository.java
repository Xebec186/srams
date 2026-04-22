package com.srams.repository;


import com.srams.entity.User;
import com.srams.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByUsernameAndStudentId(String username, Long studentId);
    boolean existsByEmail(String email);
    List<User> findBySchoolIdAndRole(Long schoolId, Role role);
}