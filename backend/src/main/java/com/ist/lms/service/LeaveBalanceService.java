package com.ist.lms.service;

import com.ist.lms.model.LeaveBalance;
import com.ist.lms.model.enums.AdjustmentType;

import java.util.List;
import java.util.Optional;

public interface LeaveBalanceService {
    List<LeaveBalance> getAllLeaveBalances();
    
    List<LeaveBalance> getLeaveBalancesByUserId(Long userId);
    
    List<LeaveBalance> getLeaveBalancesByUserIdAndYear(Long userId, int year);
    
    Optional<LeaveBalance> getLeaveBalanceById(Long id);
    
    Optional<LeaveBalance> getLeaveBalanceByUserAndType(Long userId, Long leaveTypeId, int year);
    
    LeaveBalance createLeaveBalance(LeaveBalance leaveBalance);
    
    LeaveBalance updateLeaveBalance(LeaveBalance leaveBalance);
    
    void deleteLeaveBalance(Long id);
    
    void accrueLeaveBalances(int month, int year);
    
    void carryOverBalances(int fromYear, int toYear, double maxDays);
    
    LeaveBalance adjustBalance(Long leaveBalanceId, double amount, AdjustmentType type, String reason, Long adjustedById);
    
    void expireBalances();
} 