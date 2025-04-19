package com.ist.lms.config;

import com.ist.lms.model.ERole;
import com.ist.lms.model.Role;
import com.ist.lms.repository.RoleRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.dao.DataAccessException;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Database seeder to initialize required data when the application starts
 */
@Configuration
public class DatabaseSeeder {
    
    private static final Logger logger = LoggerFactory.getLogger(DatabaseSeeder.class);
    
    @PersistenceContext
    private EntityManager entityManager;
    
    /**
     * CommandLineRunner that checks tables and seeds initial data if needed
     */
    @Bean
    @Transactional
    public CommandLineRunner seedDatabase(RoleRepository roleRepository) {
        return args -> {
            logger.info("Checking database tables and seeding required data...");
            
            // Check if tables exist and create them if needed
            checkAndCreateTables();
            
            // Check and seed roles
            seedRoles(roleRepository);
        };
    }
    
    /**
     * Check if required tables exist and create them if not
     */
    private void checkAndCreateTables() {
        logger.info("Checking if all required tables exist...");
        
        // List of required tables to check
        List<String> requiredTables = List.of(
            "roles", "users", "users_roles", "departments", "leave_types", 
            "leave_applications", "leave_balances", "holidays", "documents"
        );
        
        try {
            // Get existing tables from the database
            @SuppressWarnings("unchecked")
            List<String> existingTables = entityManager
                .createNativeQuery("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
                .getResultList();
            
            // Convert to lowercase for case-insensitive comparison
            Set<String> existingTablesLower = existingTables.stream()
                .map(String::toLowerCase)
                .collect(Collectors.toSet());
            
            // Check which tables are missing
            Set<String> missingTables = requiredTables.stream()
                .filter(table -> !existingTablesLower.contains(table.toLowerCase()))
                .collect(Collectors.toSet());
            
            if (!missingTables.isEmpty()) {
                logger.info("Missing tables detected: {}", missingTables);
                logger.info("Tables will be created by Hibernate if entity classes exist");
            } else {
                logger.info("All required tables exist");
            }
        } catch (Exception e) {
            logger.error("Error checking database tables", e);
        }
    }
    
    /**
     * Seed roles if they don't exist or add missing roles
     */
    private void seedRoles(RoleRepository roleRepository) {
        logger.info("Checking roles...");
        
        try {
            // Get all existing roles
            List<Role> existingRoles = roleRepository.findAll();
            Set<ERole> existingERoles = existingRoles.stream()
                .map(Role::getName)
                .collect(Collectors.toSet());
            
            // Check which roles need to be created
            Set<ERole> rolesToCreate = new HashSet<>(Arrays.asList(ERole.values()));
            rolesToCreate.removeAll(existingERoles);
            
            // Create missing roles
            if (!rolesToCreate.isEmpty()) {
                logger.info("Creating missing roles: {}", rolesToCreate);
                
                for (ERole eRole : rolesToCreate) {
                    Role role = Role.builder()
                            .name(eRole)
                            .build();
                    roleRepository.save(role);
                    logger.info("Created role: {}", eRole);
                }
                
                logger.info("Roles created successfully!");
            } else {
                logger.info("All required roles already exist");
            }
        } catch (DataAccessException e) {
            logger.error("Error seeding roles", e);
            logger.warn("This might be because the roles table doesn't exist yet. " +
                        "It will be created by Hibernate automatically.");
        }
    }
} 