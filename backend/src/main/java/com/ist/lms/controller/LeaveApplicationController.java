package com.ist.lms.controller;

import com.ist.lms.exception.ResourceNotFoundException;
import com.ist.lms.model.LeaveApplication;
import com.ist.lms.model.enums.LeaveStatus;
import com.ist.lms.service.LeaveApplicationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/leave-applications")
public class LeaveApplicationController {
    
    private static final Logger logger = LoggerFactory.getLogger(LeaveApplicationController.class);
    
    private final LeaveApplicationService leaveApplicationService;
    
    @Autowired
    public LeaveApplicationController(LeaveApplicationService leaveApplicationService) {
        this.leaveApplicationService = leaveApplicationService;
    }
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public List<LeaveApplication> getAllLeaveApplications(
            @RequestParam(required = false) LeaveStatus status) {
        
        if (status != null) {
            // If status is provided, filter by status
            return leaveApplicationService.getLeaveApplicationsByStatus(status);
        }
        
        // Otherwise, return all leave applications
        return leaveApplicationService.getAllLeaveApplications();
    }
    
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR') or hasRole('MANAGER') or @securityService.isCurrentUser(#userId)")
    public List<LeaveApplication> getLeaveApplicationsByUserId(@PathVariable Long userId) {
        return leaveApplicationService.getLeaveApplicationsByUserId(userId);
    }
    
    @GetMapping("/user/{userId}/status/{status}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR') or hasRole('MANAGER') or @securityService.isCurrentUser(#userId)")
    public List<LeaveApplication> getLeaveApplicationsByUserIdAndStatus(
            @PathVariable Long userId, 
            @PathVariable LeaveStatus status) {
        return leaveApplicationService.getLeaveApplicationsByUserIdAndStatus(userId, status);
    }
    
    @GetMapping("/overlapping")
    public List<LeaveApplication> getOverlappingLeaves(
            @RequestParam Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return leaveApplicationService.getOverlappingLeaves(userId, startDate, endDate);
    }
    
    @GetMapping("/date-range")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR') or hasRole('MANAGER')")
    public List<LeaveApplication> getAllLeavesInDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return leaveApplicationService.getAllLeavesInDateRange(startDate, endDate);
    }
    
    @GetMapping("/department/{departmentId}/date-range")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR') or hasRole('MANAGER')")
    public List<LeaveApplication> getDepartmentLeavesInDateRange(
            @PathVariable Long departmentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return leaveApplicationService.getDepartmentLeavesInDateRange(departmentId, startDate, endDate);
    }
    
    @GetMapping("/pending-approvals/{approverId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR') or hasRole('MANAGER') or @securityService.isCurrentUser(#approverId)")
    public List<LeaveApplication> getPendingApprovalsByApproverId(@PathVariable Long approverId) {
        return leaveApplicationService.getPendingApprovalsByApproverId(approverId);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<LeaveApplication> getLeaveApplicationById(@PathVariable Long id) {
        return leaveApplicationService.getLeaveApplicationById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResourceNotFoundException("Leave Application not found with id: " + id));
    }
    
    @PostMapping
    public LeaveApplication createLeaveApplication(@Valid @RequestBody LeaveApplication leaveApplication) {
        // Let the validation annotations handle the field validation
        // The @Valid annotation will validate @NotBlank constraints
        logger.debug("Creating leave application: {}", leaveApplication);
        
        // Manual validation for required fields with detailed messages
        if (leaveApplication.getUser() == null) {
            logger.error("User is null in leave application");
            throw new IllegalArgumentException("User is required");
        }
        
        if (leaveApplication.getUser().getId() == null) {
            logger.error("User ID is null in leave application");
            throw new IllegalArgumentException("User ID is required");
        }
        
        if (leaveApplication.getLeaveType() == null) {
            logger.error("Leave type is null in leave application");
            throw new IllegalArgumentException("Leave type is required");
        }
        
        if (leaveApplication.getLeaveType().getId() == null) {
            logger.error("Leave type ID is null in leave application");
            throw new IllegalArgumentException("Leave type ID is required");
        }
        
        if (leaveApplication.getStartDate() == null) {
            logger.error("Start date is null in leave application");
            throw new IllegalArgumentException("Start date is required");
        }
        
        if (leaveApplication.getEndDate() == null) {
            logger.error("End date is null in leave application");
            throw new IllegalArgumentException("End date is required");
        }
        
        // Check reason field
        if (leaveApplication.getReason() == null || leaveApplication.getReason().trim().isEmpty()) {
            logger.error("Reason is blank in leave application");
            throw new IllegalArgumentException("Reason is required");
        }
        
        // Process the leave application
        return leaveApplicationService.createLeaveApplication(leaveApplication);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR') or @securityService.isApplicationOwner(#id)")
    public ResponseEntity<LeaveApplication> updateLeaveApplication(
            @PathVariable Long id, 
            @Valid @RequestBody LeaveApplication leaveApplication) {
        
        if (!leaveApplicationService.getLeaveApplicationById(id).isPresent()) {
            throw new ResourceNotFoundException("Leave Application not found with id: " + id);
        }
        
        leaveApplication.setId(id);
        return ResponseEntity.ok(leaveApplicationService.updateLeaveApplication(leaveApplication));
    }
    
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR') or hasRole('MANAGER')")
    public ResponseEntity<LeaveApplication> updateLeaveStatus(
            @PathVariable Long id, 
            @RequestBody Map<String, Object> statusData) {
        
        if (!leaveApplicationService.getLeaveApplicationById(id).isPresent()) {
            throw new ResourceNotFoundException("Leave Application not found with id: " + id);
        }
        
        LeaveStatus status = LeaveStatus.valueOf(statusData.get("status").toString());
        String reason = statusData.get("reason") != null ? statusData.get("reason").toString() : "";
        
        return ResponseEntity.ok(leaveApplicationService.updateLeaveStatus(id, status, reason));
    }
    
    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR') or @securityService.isApplicationOwner(#id)")
    public ResponseEntity<LeaveApplication> cancelLeaveApplication(
            @PathVariable Long id, 
            @RequestBody Map<String, String> cancelData) {
        
        if (!leaveApplicationService.getLeaveApplicationById(id).isPresent()) {
            throw new ResourceNotFoundException("Leave Application not found with id: " + id);
        }
        
        String reason = cancelData.get("reason");
        return ResponseEntity.ok(leaveApplicationService.cancelLeaveApplication(id, reason));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteLeaveApplication(@PathVariable Long id) {
        if (!leaveApplicationService.getLeaveApplicationById(id).isPresent()) {
            throw new ResourceNotFoundException("Leave Application not found with id: " + id);
        }
        
        leaveApplicationService.deleteLeaveApplication(id);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/calculate-days")
    public ResponseEntity<Double> calculateBusinessDays(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        double days = leaveApplicationService.calculateBusinessDays(startDate, endDate);
        return ResponseEntity.ok(days);
    }
    
    @GetMapping("/check-balance")
    public ResponseEntity<Boolean> checkLeaveBalanceAvailability(
            @RequestParam Long userId,
            @RequestParam Long leaveTypeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        boolean isAvailable = leaveApplicationService.checkLeaveBalanceAvailability(userId, leaveTypeId, startDate, endDate);
        return ResponseEntity.ok(isAvailable);
    }
} 