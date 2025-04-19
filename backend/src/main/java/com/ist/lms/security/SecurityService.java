package com.ist.lms.security;

import com.ist.lms.model.User;
import com.ist.lms.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class SecurityService {
    
    private static final Logger logger = LoggerFactory.getLogger(SecurityService.class);

    private final UserRepository userRepository;

    @Autowired
    public SecurityService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Checks if the current authenticated user matches the provided user ID
     *
     * @param userId The ID to check against the current user
     * @return true if the current user's ID matches the provided ID, false otherwise
     */
    public boolean isCurrentUser(Long userId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            logger.debug("No authenticated user found for ID check: {}", userId);
            return false;
        }
        
        // Get the email from the authenticated principal
        String email = authentication.getName();
        logger.debug("Checking if user with email {} matches ID: {}", email, userId);
        
        // Find the user by email to get their ID
        return userRepository.findByEmail(email)
                .map(user -> {
                    boolean matches = user.getId().equals(userId);
                    logger.debug("User ID check result for {}: {}", email, matches ? "MATCH" : "NO MATCH");
                    return matches;
                })
                .orElse(false);
    }
    
    /**
     * Retrieves the current authenticated user
     *
     * @return Optional containing the User if authenticated, empty Optional otherwise
     */
    @Transactional(readOnly = true)
    public Optional<User> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        logger.debug("Getting current user - Authentication present: {}", authentication != null);
        
        if (authentication == null) {
            logger.warn("No authentication object found in security context");
            return Optional.empty();
        }
        
        logger.debug("Authentication details - Name: {}, Principal: {}, Authenticated: {}, Authorities: {}",
                authentication.getName(),
                authentication.getPrincipal(),
                authentication.isAuthenticated(),
                authentication.getAuthorities());
        
        if (!authentication.isAuthenticated()) {
            logger.warn("Authentication is not authenticated");
            return Optional.empty();
        }
        
        // Get the email from the authenticated principal
        String email = authentication.getName();
        logger.debug("Fetching user with email: {}", email);
        
        // Find and return the user by email with roles eagerly loaded
        Optional<User> userOpt = userRepository.findByEmailWithRoles(email);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            logger.debug("User found: ID={}, Email={}, Roles={}", 
                    user.getId(), 
                    user.getEmail(),
                    user.getRoles() != null ? user.getRoles().size() : "null");
        } else {
            logger.warn("No user found with email: {}", email);
        }
        
        return userOpt;
    }
    
    /**
     * Retrieves the current authenticated user's ID
     *
     * @return Optional containing the User ID if authenticated, empty Optional otherwise
     */
    public Optional<Long> getCurrentUserId() {
        return getCurrentUser().map(User::getId);
    }
} 