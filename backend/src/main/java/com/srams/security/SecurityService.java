package com.srams.security;

import com.srams.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.security.core.Authentication;

@Component("securityService")
@RequiredArgsConstructor
public class SecurityService {
    private final UserRepository userRepository;

    public boolean isOwnStudentRecord(Long studentId, Authentication authentication) {
        return userRepository.existsByUsernameAndStudentId(
                authentication.getName(),
                studentId
        );
    }
}
