package com.ist.lms.config;

import com.ist.lms.model.ERole;
import com.ist.lms.model.Role;
import com.ist.lms.model.User;
import com.ist.lms.model.LeaveType;
import com.ist.lms.repository.LeaveTypeRepository;
import com.ist.lms.repository.RoleRepository;
import com.ist.lms.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

/**
 * Initializes reference data after database tables are created
 * This runs after Hibernate has created/updated the schema
 */
@Configuration
public class DataInitializer implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final LeaveTypeRepository leaveTypeRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public DataInitializer(LeaveTypeRepository leaveTypeRepository, 
                           UserRepository userRepository,
                           RoleRepository roleRepository,
                           PasswordEncoder passwordEncoder) {
        this.leaveTypeRepository = leaveTypeRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        logger.info("Initializing reference data...");
        
        // Initialize standard leave types
        initializeLeaveTypes();
        
        // Initialize default users
        initializeDefaultUsers();
        
        logger.info("Reference data initialization complete");
    }

    /**
     * Initialize standard leave types if they don't exist
     */
    private void initializeLeaveTypes() {
        logger.info("Checking leave types...");
        
        // Create standard leave types if they don't exist
        createLeaveTypeIfNotExists("Annual Leave", "Regular vacation leave", 20.0, true, true, false, 30);
        createLeaveTypeIfNotExists("Sick Leave", "Leave for health-related absences", 10.0, true, true, true, 30);
        createLeaveTypeIfNotExists("Maternity Leave", "Leave for childbirth and recovery", 90.0, true, true, true, 90);
        createLeaveTypeIfNotExists("Paternity Leave", "Leave for new fathers", 5.0, true, true, false, 10);
        createLeaveTypeIfNotExists("Bereavement Leave", "Leave for death of immediate family member", 5.0, true, true, true, 10);
        createLeaveTypeIfNotExists("Unpaid Leave", "Leave without pay", 30.0, false, true, false, 30);
    }
    
    /**
     * Create a leave type if it doesn't already exist
     */
    private void createLeaveTypeIfNotExists(String name, String description, double defaultDays, 
                                          boolean paid, boolean requiresApproval, 
                                          boolean requiresDocuments, Integer maxConsecutiveDays) {
        // Check if leave type already exists
        Optional<LeaveType> existingLeaveType = leaveTypeRepository.findByName(name);
        
        if (existingLeaveType.isEmpty()) {
            logger.info("Creating leave type: {}", name);
            
            LeaveType leaveType = LeaveType.builder()
                .name(name)
                .description(description)
                .defaultDays(defaultDays)
                .paid(paid)
                .active(true)
                .requiresApproval(requiresApproval)
                .requiresDocuments(requiresDocuments)
                .maxConsecutiveDays(maxConsecutiveDays)
                .build();
            
            leaveTypeRepository.save(leaveType);
            logger.info("Leave type created: {}", name);
        } else {
            logger.info("Leave type already exists: {}", name);
        }
    }
    
    /**
     * Initialize default admin and manager users if they don't exist
     */
    private void initializeDefaultUsers() {
        logger.info("Checking for default users...");
        
        // Create admin user
        createUserIfNotExists(
            "admin@ist.com", 
            "Admin", 
            "User", 
            "admin123", 
            new ERole[]{ERole.ROLE_ADMIN}
        );
        
        // Create manager user
        createUserIfNotExists(
            "manager@ist.com", 
            "Manager", 
            "User", 
            "manager123", 
            new ERole[]{ERole.ROLE_MANAGER}
        );
        
        // Create regular employee user
        createUserIfNotExists(
            "employee@ist.com", 
            "Employee", 
            "User", 
            "employee123", 
            new ERole[]{ERole.ROLE_EMPLOYEE}
        );
    }
    
    /**
     * Create a user if they don't already exist
     */
    private void createUserIfNotExists(String email, String firstName, String lastName, 
                                      String password, ERole[] roles) {
        // Check if user already exists
        if (!userRepository.existsByEmail(email)) {
            logger.info("Creating default user: {}", email);
            
            User user = new User();
            user.setEmail(email);
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setPassword(passwordEncoder.encode(password));
            user.setActive(true);
            
            // Assign roles
            Set<Role> userRoles = new HashSet<>();
            for (ERole roleName : roles) {
                Role role = roleRepository.findByName(roleName)
                    .orElseThrow(() -> new RuntimeException("Error: Role " + roleName + " not found."));
                userRoles.add(role);
            }
            user.setRoles(userRoles);
            
            userRepository.save(user);
            logger.info("Default user created: {}", email);
        } else {
            logger.info("User already exists: {}", email);
        }
    }
} 