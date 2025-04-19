package com.ist.lms.service;

import com.ist.lms.model.LeaveApplication;
import com.ist.lms.model.enums.LeaveStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface LeaveApplicationService {
    List<LeaveApplication> getAllLeaveApplications();
    
    List<LeaveApplication> getLeaveApplicationsByStatus(LeaveStatus status);
    
    List<LeaveApplication> getLeaveApplicationsByUserId(Long userId);
    
    List<LeaveApplication> getLeaveApplicationsByUserIdAndStatus(Long userId, LeaveStatus status);
    
    List<LeaveApplication> getOverlappingLeaves(Long userId, LocalDate startDate, LocalDate endDate);
    
    List<LeaveApplication> getAllLeavesInDateRange(LocalDate startDate, LocalDate endDate);
    
    List<LeaveApplication> getDepartmentLeavesInDateRange(Long departmentId, LocalDate startDate, LocalDate endDate);
    
    List<LeaveApplication> getPendingApprovalsByApproverId(Long approverId);
    
    Optional<LeaveApplication> getLeaveApplicationById(Long id);
    
    LeaveApplication createLeaveApplication(LeaveApplication leaveApplication);
    
    LeaveApplication updateLeaveApplication(LeaveApplication leaveApplication);
    
    LeaveApplication updateLeaveStatus(Long id, LeaveStatus status, String reason);
    
    LeaveApplication cancelLeaveApplication(Long id, String reason);
    
    void deleteLeaveApplication(Long id);
    
    double calculateBusinessDays(LocalDate startDate, LocalDate endDate);
    
    boolean checkLeaveBalanceAvailability(Long userId, Long leaveTypeId, LocalDate startDate, LocalDate endDate);
} 