package com.ist.lms.config;

import com.ist.lms.model.LeaveType;
import com.ist.lms.repository.LeaveTypeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

/**
 * Initializes reference data after database tables are created
 * This runs after Hibernate has created/updated the schema
 */
@Configuration
public class DataInitializer implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final LeaveTypeRepository leaveTypeRepository;

    @Autowired
    public DataInitializer(LeaveTypeRepository leaveTypeRepository) {
        this.leaveTypeRepository = leaveTypeRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        logger.info("Initializing reference data...");
        
        // Initialize standard leave types
        initializeLeaveTypes();
        
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
} 