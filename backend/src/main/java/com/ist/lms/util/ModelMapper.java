package com.ist.lms.util;

import org.springframework.stereotype.Component;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Utility class for mapping between entity and model classes.
 * This helps with the package structure confusion in the codebase.
 */
@Component
public class ModelMapper {

    /**
     * Maps a model User to an entity User if needed
     */
    public com.ist.lms.entity.User toEntityUser(com.ist.lms.model.User modelUser) {
        if (modelUser == null) return null;
        
        com.ist.lms.entity.User entityUser = new com.ist.lms.entity.User();
        // Map properties as needed
        // This is a stub implementation - expand as necessary
        
        return entityUser;
    }
    
    /**
     * Maps an entity User to a model User if needed
     */
    public com.ist.lms.model.User toModelUser(com.ist.lms.entity.User entityUser) {
        if (entityUser == null) return null;
        
        // Use the builder pattern that's available in the model classes
        return com.ist.lms.model.User.builder()
                .build();
    }
    
    /**
     * Maps entity Role to model Role if needed
     */
    public com.ist.lms.model.Role toModelRole(com.ist.lms.entity.Role entityRole) {
        if (entityRole == null) return null;
        
        return com.ist.lms.model.Role.builder()
                .build();
    }
    
    /**
     * Maps a set of entity Roles to model Roles if needed
     */
    public Set<com.ist.lms.model.Role> toModelRoles(Set<com.ist.lms.entity.Role> entityRoles) {
        if (entityRoles == null) return null;
        
        return entityRoles.stream()
                .map(this::toModelRole)
                .collect(Collectors.toSet());
    }
} 