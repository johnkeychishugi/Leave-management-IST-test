package com.ist.lms.service.impl;

import com.ist.lms.exception.ResourceNotFoundException;
import com.ist.lms.model.*;
import com.ist.lms.model.enums.AdjustmentType;
import com.ist.lms.model.enums.ApprovalStatus;
import com.ist.lms.model.enums.LeaveStatus;
import com.ist.lms.model.enums.NotificationType;
import com.ist.lms.repository.*;
import com.ist.lms.service.LeaveApplicationService;
import com.ist.lms.service.LeaveBalanceService;
import com.ist.lms.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class LeaveApplicationServiceImpl implements LeaveApplicationService {
    
    private final LeaveApplicationRepository leaveApplicationRepository;
    private final LeaveBalanceService leaveBalanceService;
    private final UserRepository userRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final HolidayRepository holidayRepository;
    private final LeaveApprovalRepository leaveApprovalRepository;
    private final NotificationService notificationService;
    
    @Autowired
    public LeaveApplicationServiceImpl(
            LeaveApplicationRepository leaveApplicationRepository,
            LeaveBalanceService leaveBalanceService,
            UserRepository userRepository,
            LeaveTypeRepository leaveTypeRepository,
            HolidayRepository holidayRepository,
            LeaveApprovalRepository leaveApprovalRepository,
            NotificationService notificationService) {
        this.leaveApplicationRepository = leaveApplicationRepository;
        this.leaveBalanceService = leaveBalanceService;
        this.userRepository = userRepository;
        this.leaveTypeRepository = leaveTypeRepository;
        this.holidayRepository = holidayRepository;
        this.leaveApprovalRepository = leaveApprovalRepository;
        this.notificationService = notificationService;
    }
    
    @Override
    public List<LeaveApplication> getAllLeaveApplications() {
        return leaveApplicationRepository.findAllWithUsers();
    }
    
    @Override
    public List<LeaveApplication> getLeaveApplicationsByStatus(LeaveStatus status) {
        return leaveApplicationRepository.findByStatus(status);
    }
    
    @Override
    public List<LeaveApplication> getLeaveApplicationsByUserId(Long userId) {
        return leaveApplicationRepository.findByUserId(userId);
    }
    
    @Override
    public List<LeaveApplication> getLeaveApplicationsByUserIdAndStatus(Long userId, LeaveStatus status) {
        return leaveApplicationRepository.findByUserIdAndStatus(userId, status);
    }
    
    @Override
    public List<LeaveApplication> getOverlappingLeaves(Long userId, LocalDate startDate, LocalDate endDate) {
        return leaveApplicationRepository.findOverlappingLeaves(userId, startDate, endDate);
    }
    
    @Override
    public List<LeaveApplication> getAllLeavesInDateRange(LocalDate startDate, LocalDate endDate) {
        return leaveApplicationRepository.findAllLeavesInDateRange(startDate, endDate);
    }
    
    @Override
    public List<LeaveApplication> getDepartmentLeavesInDateRange(Long departmentId, LocalDate startDate, LocalDate endDate) {
        return leaveApplicationRepository.findDepartmentLeavesInDateRange(departmentId, startDate, endDate);
    }
    
    @Override
    public List<LeaveApplication> getPendingApprovalsByApproverId(Long approverId) {
        return leaveApplicationRepository.findPendingApprovalsByApproverId(approverId);
    }
    
    @Override
    public Optional<LeaveApplication> getLeaveApplicationById(Long id) {
        return leaveApplicationRepository.findByIdWithUser(id);
    }
    
    @Override
    @Transactional
    public LeaveApplication createLeaveApplication(LeaveApplication leaveApplication) {
        // Calculate business days
        double businessDays = calculateBusinessDays(leaveApplication.getStartDate(), leaveApplication.getEndDate());
        leaveApplication.setTotalDays(businessDays);
        
        // Set initial status
        leaveApplication.setStatus(LeaveStatus.PENDING);
        
        // Set return date (next business day after end date)
        LocalDate returnDate = leaveApplication.getEndDate().plusDays(1);
        while (isWeekend(returnDate) || isHoliday(returnDate)) {
            returnDate = returnDate.plusDays(1);
        }
        leaveApplication.setReturnDate(returnDate);
        
        // Save the application
        LeaveApplication savedApplication = leaveApplicationRepository.save(leaveApplication);
        
        // Create approvals
        createApprovalChain(savedApplication);
        
        // Send notification to the employee
        notificationService.createNotification(
            savedApplication.getUser(),
            "Leave Application Submitted",
            "Your leave application for " + formatDateRange(savedApplication.getStartDate(), savedApplication.getEndDate()) + 
            " has been submitted and is pending approval.",
            NotificationType.LEAVE_REQUEST,
            "/dashboard/my-leaves",
            "View My Leaves"
        );
        
        return savedApplication;
    }
    
    @Override
    @Transactional
    public LeaveApplication updateLeaveApplication(LeaveApplication leaveApplication) {
        // Recalculate business days if dates changed
        LeaveApplication existingApplication = leaveApplicationRepository.findByIdWithUser(leaveApplication.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Leave Application not found with id: " + leaveApplication.getId()));
        
        if (!existingApplication.getStartDate().equals(leaveApplication.getStartDate()) || 
            !existingApplication.getEndDate().equals(leaveApplication.getEndDate())) {
            
            double businessDays = calculateBusinessDays(leaveApplication.getStartDate(), leaveApplication.getEndDate());
            leaveApplication.setTotalDays(businessDays);
            
            // Update return date
            LocalDate returnDate = leaveApplication.getEndDate().plusDays(1);
            while (isWeekend(returnDate) || isHoliday(returnDate)) {
                returnDate = returnDate.plusDays(1);
            }
            leaveApplication.setReturnDate(returnDate);
        }
        
        return leaveApplicationRepository.save(leaveApplication);
    }
    
    @Override
    @Transactional
    public LeaveApplication updateLeaveStatus(Long id, LeaveStatus status, String reason) {
        LeaveApplication leaveApplication = leaveApplicationRepository.findByIdWithUser(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave Application not found with id: " + id));
        
        leaveApplication.setStatus(status);
        
        User applicant = leaveApplication.getUser();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM d, yyyy");
        String dateRange = formatDateRange(leaveApplication.getStartDate(), leaveApplication.getEndDate());
        
        // Handle leave balance update if approved
        if (status == LeaveStatus.APPROVED) {
            // Update leave balance
            LeaveBalance leaveBalance = leaveBalanceService.getLeaveBalanceByUserAndType(
                    leaveApplication.getUser().getId(),
                    leaveApplication.getLeaveType().getId(),
                    LocalDate.now().getYear())
                    .orElseThrow(() -> new ResourceNotFoundException("Leave Balance not found for user and leave type"));
            
            leaveBalanceService.adjustBalance(
                    leaveBalance.getId(),
                    leaveApplication.getTotalDays(),
                    AdjustmentType.LEAVE_TAKEN,
                    "Leave taken from " + leaveApplication.getStartDate() + " to " + leaveApplication.getEndDate(),
                    leaveApplication.getUser().getId()
            );
            
            // Send approval notification to the applicant
            notificationService.createNotification(
                applicant,
                "Leave Application Approved",
                "Your leave application for " + dateRange + " has been approved.",
                NotificationType.LEAVE_APPROVAL,
                "/dashboard/my-leaves",
                "View Details"
            );
        } else if (status == LeaveStatus.REJECTED) {
            // Send rejection notification to the applicant
            notificationService.createNotification(
                applicant,
                "Leave Application Rejected",
                "Your leave application for " + dateRange + " has been rejected. Reason: " + 
                (reason != null && !reason.isEmpty() ? reason : "No reason provided."),
                NotificationType.LEAVE_REJECTION,
                "/dashboard/my-leaves",
                "View Details"
            );
        }
        
        return leaveApplicationRepository.save(leaveApplication);
    }
    
    @Override
    @Transactional
    public LeaveApplication cancelLeaveApplication(Long id, String reason) {
        LeaveApplication leaveApplication = leaveApplicationRepository.findByIdWithUser(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave Application not found with id: " + id));
        
        // Can only cancel if not already completed
        if (leaveApplication.getStatus() != LeaveStatus.COMPLETED) {
            leaveApplication.setStatus(LeaveStatus.CANCELLED);
            leaveApplication.setCancellationReason(reason);
            
            // If was approved, adjust leave balance back
            if (leaveApplication.getStatus() == LeaveStatus.APPROVED) {
                // Update leave balance
                LeaveBalance leaveBalance = leaveBalanceService.getLeaveBalanceByUserAndType(
                        leaveApplication.getUser().getId(),
                        leaveApplication.getLeaveType().getId(),
                        LocalDate.now().getYear())
                        .orElseThrow(() -> new ResourceNotFoundException("Leave Balance not found for user and leave type"));
                
                leaveBalanceService.adjustBalance(
                        leaveBalance.getId(),
                        leaveApplication.getTotalDays(),
                        AdjustmentType.LEAVE_CANCELLED,
                        "Leave cancelled: " + reason,
                        leaveApplication.getUser().getId()
                );
            }
            
            // Notify manager about cancellation
            if (leaveApplication.getUser().getManager() != null) {
                notificationService.createNotification(
                    leaveApplication.getUser().getManager(),
                    "Leave Application Cancelled",
                    leaveApplication.getUser().getFullName() + " has cancelled their leave application for " + 
                    formatDateRange(leaveApplication.getStartDate(), leaveApplication.getEndDate()) + 
                    ". Reason: " + (reason != null && !reason.isEmpty() ? reason : "No reason provided."),
                    NotificationType.LEAVE_CANCELLATION,
                    "/dashboard/pending-approvals",
                    "View Approvals"
                );
            }
        }
        
        return leaveApplicationRepository.save(leaveApplication);
    }
    
    @Override
    @Transactional
    public void deleteLeaveApplication(Long id) {
        leaveApplicationRepository.deleteById(id);
    }
    
    @Override
    public double calculateBusinessDays(LocalDate startDate, LocalDate endDate) {
        double businessDays = 0;
        LocalDate currentDate = startDate;
        
        while (!currentDate.isAfter(endDate)) {
            // Skip weekends and holidays
            if (!isWeekend(currentDate) && !isHoliday(currentDate)) {
                businessDays++;
            }
            currentDate = currentDate.plusDays(1);
        }
        
        return businessDays;
    }
    
    @Override
    public boolean checkLeaveBalanceAvailability(Long userId, Long leaveTypeId, LocalDate startDate, LocalDate endDate) {
        // Calculate business days
        double requiredDays = calculateBusinessDays(startDate, endDate);
        
        // Get current year leave balance
        Optional<LeaveBalance> leaveBalanceOpt = leaveBalanceService.getLeaveBalanceByUserAndType(
                userId, leaveTypeId, startDate.getYear());
        
        if (leaveBalanceOpt.isEmpty()) {
            return false;
        }
        
        LeaveBalance leaveBalance = leaveBalanceOpt.get();
        double availableDays = leaveBalance.getTotalDays() - leaveBalance.getUsedDays();
        
        return availableDays >= requiredDays;
    }
    
    private boolean isWeekend(LocalDate date) {
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        return dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY;
    }
    
    private boolean isHoliday(LocalDate date) {
        // Check if date is a public holiday
        return holidayRepository.findByDate(date).isPresent();
    }
    
    private void createApprovalChain(LeaveApplication leaveApplication) {
        User employee = leaveApplication.getUser();
        String dateRange = formatDateRange(leaveApplication.getStartDate(), leaveApplication.getEndDate());
        
        // First level approval - Manager
        if (employee.getManager() != null) {
            LeaveApproval managerApproval = LeaveApproval.builder()
                    .leaveApplication(leaveApplication)
                    .approver(employee.getManager())
                    .status(ApprovalStatus.PENDING)
                    .approvalLevel(1)
                    .notificationSent(false)
                    .build();
            leaveApprovalRepository.save(managerApproval);
            
            // Send notification to manager
            notificationService.createNotification(
                employee.getManager(),
                "Leave Approval Required",
                employee.getFullName() + " has requested leave for " + dateRange + 
                ". Please review and approve or reject this request.",
                NotificationType.LEAVE_REQUEST,
                "/dashboard/pending-approvals",
                "Review Request"
            );
        }
        
        // Second level approval - Department Head (if different from manager)
        if (employee.getDepartment() != null && employee.getDepartment().getManager() != null &&
                (employee.getManager() == null || !employee.getManager().getId().equals(employee.getDepartment().getManager().getId()))) {
            
            LeaveApproval deptHeadApproval = LeaveApproval.builder()
                    .leaveApplication(leaveApplication)
                    .approver(employee.getDepartment().getManager())
                    .status(employee.getManager() == null ? ApprovalStatus.PENDING : ApprovalStatus.SKIPPED)
                    .approvalLevel(2)
                    .notificationSent(false)
                    .build();
            leaveApprovalRepository.save(deptHeadApproval);
            
            // Only send notification if this is the first approver (no manager)
            if (employee.getManager() == null) {
                notificationService.createNotification(
                    employee.getDepartment().getManager(),
                    "Leave Approval Required",
                    employee.getFullName() + " has requested leave for " + dateRange + 
                    ". Please review and approve or reject this request.",
                    NotificationType.LEAVE_REQUEST,
                    "/dashboard/pending-approvals",
                    "Review Request"
                );
            }
        }
        
        // Find HR approver (first HR role user)
        userRepository.findAllActiveUsers().stream()
                .filter(user -> user.getRoles().stream()
                        .anyMatch(role -> role.getName().toString().equals("ROLE_HR")))
                .findFirst()
                .ifPresent(hrUser -> {
                    LeaveApproval hrApproval = LeaveApproval.builder()
                            .leaveApplication(leaveApplication)
                            .approver(hrUser)
                            .status(ApprovalStatus.SKIPPED)
                            .approvalLevel(3)
                            .notificationSent(false)
                            .build();
                    leaveApprovalRepository.save(hrApproval);
                });
    }
    
    // Helper method to format date ranges consistently
    private String formatDateRange(LocalDate startDate, LocalDate endDate) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM d, yyyy");
        return startDate.format(formatter) + " to " + endDate.format(formatter);
    }
} 