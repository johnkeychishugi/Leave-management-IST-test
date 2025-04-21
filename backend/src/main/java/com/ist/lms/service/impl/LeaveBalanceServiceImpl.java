package com.ist.lms.service.impl;

import com.ist.lms.exception.ResourceNotFoundException;
import com.ist.lms.model.LeaveBalance;
import com.ist.lms.model.LeaveBalanceAdjustment;
import com.ist.lms.model.User;
import com.ist.lms.model.enums.AdjustmentType;
import com.ist.lms.model.enums.NotificationType;
import com.ist.lms.repository.LeaveBalanceAdjustmentRepository;
import com.ist.lms.repository.LeaveBalanceRepository;
import com.ist.lms.repository.LeaveTypeRepository;
import com.ist.lms.repository.UserRepository;
import com.ist.lms.service.LeaveBalanceService;
import com.ist.lms.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class LeaveBalanceServiceImpl implements LeaveBalanceService {
    
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final LeaveBalanceAdjustmentRepository adjustmentRepository;
    private final UserRepository userRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final NotificationService notificationService;
    
    @Autowired
    public LeaveBalanceServiceImpl(
            LeaveBalanceRepository leaveBalanceRepository,
            LeaveBalanceAdjustmentRepository adjustmentRepository,
            UserRepository userRepository,
            LeaveTypeRepository leaveTypeRepository,
            NotificationService notificationService) {
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.adjustmentRepository = adjustmentRepository;
        this.userRepository = userRepository;
        this.leaveTypeRepository = leaveTypeRepository;
        this.notificationService = notificationService;
    }
    
    @Override
    public List<LeaveBalance> getAllLeaveBalances() {
        return leaveBalanceRepository.findAll();
    }
    
    @Override
    public List<LeaveBalance> getLeaveBalancesByUserId(Long userId) {
        return leaveBalanceRepository.findByUserId(userId);
    }
    
    @Override
    public List<LeaveBalance> getLeaveBalancesByUserIdAndYear(Long userId, int year) {
        return leaveBalanceRepository.findByUserIdAndYear(userId, year);
    }
    
    @Override
    public Optional<LeaveBalance> getLeaveBalanceById(Long id) {
        return leaveBalanceRepository.findById(id);
    }
    
    @Override
    public Optional<LeaveBalance> getLeaveBalanceByUserAndType(Long userId, Long leaveTypeId, int year) {
        return leaveBalanceRepository.findUserLeaveBalance(userId, leaveTypeId, year);
    }
    
    @Override
    @Transactional
    public LeaveBalance createLeaveBalance(LeaveBalance leaveBalance) {
        return leaveBalanceRepository.save(leaveBalance);
    }
    
    @Override
    @Transactional
    public LeaveBalance updateLeaveBalance(LeaveBalance leaveBalance) {
        return leaveBalanceRepository.save(leaveBalance);
    }
    
    @Override
    @Transactional
    public void deleteLeaveBalance(Long id) {
        leaveBalanceRepository.deleteById(id);
    }
    
    @Override
    @Transactional
    public void accrueLeaveBalances(int month, int year) {
        // Get all active users
        List<User> activeUsers = userRepository.findAllActiveUsers();
        
        // For each user, accrue 1.66 days for annual leave
        LocalDate now = LocalDate.now();
        
        activeUsers.forEach(user -> {
            // Find annual leave type
            leaveTypeRepository.findByName("Annual Leave").ifPresent(leaveType -> {
                // Get or create leave balance
                LeaveBalance leaveBalance = leaveBalanceRepository
                        .findUserLeaveBalance(user.getId(), leaveType.getId(), year)
                        .orElseGet(() -> {
                            LeaveBalance newBalance = LeaveBalance.builder()
                                    .user(user)
                                    .leaveType(leaveType)
                                    .year(year)
                                    .totalDays(0)
                                    .usedDays(0)
                                    .carriedOverDays(0)
                                    .expiryDate(LocalDate.of(year + 1, 3, 31)) // Expires March 31 next year
                                    .build();
                            return leaveBalanceRepository.save(newBalance);
                        });
                
                // Add 1.66 days
                double accrualAmount = 1.66;
                leaveBalance.setTotalDays(leaveBalance.getTotalDays() + accrualAmount);
                LeaveBalance updatedBalance = leaveBalanceRepository.save(leaveBalance);
                
                // Record adjustment
                LeaveBalanceAdjustment adjustment = LeaveBalanceAdjustment.builder()
                        .leaveBalance(updatedBalance)
                        .adjustedBy(user) // System accrual
                        .adjustmentValue(accrualAmount)
                        .reason("Monthly accrual for " + month + "/" + year)
                        .type(AdjustmentType.ACCRUAL)
                        .build();
                
                adjustmentRepository.save(adjustment);
                
                // Send notification
                notificationService.createNotification(
                    user,
                    "Leave Balance Updated",
                    "Your " + leaveType.getName() + " balance has been increased by " + accrualAmount + 
                    " days as part of the monthly accrual for " + month + "/" + year + ". Your new balance is " + 
                    updatedBalance.getRemainingDays() + " days.",
                    NotificationType.BALANCE_UPDATE,
                    "/dashboard/leave-balances",
                    "View Leave Balances"
                );
            });
        });
    }
    
    @Override
    @Transactional
    public void carryOverBalances(int fromYear, int toYear, double maxDays) {
        // Get all balances from the previous year
        List<LeaveBalance> previousYearBalances = leaveBalanceRepository.findAll().stream()
                .filter(balance -> balance.getYear() == fromYear)
                .filter(balance -> balance.getRemainingDays() > 0)
                .toList();
        
        for (LeaveBalance previousBalance : previousYearBalances) {
            double remainingDays = previousBalance.getRemainingDays();
            double daysToCarryOver = Math.min(remainingDays, maxDays);
            
            if (daysToCarryOver <= 0) {
                continue;
            }
            
            // Get or create next year's balance
            LeaveBalance nextYearBalance = leaveBalanceRepository
                    .findUserLeaveBalance(
                            previousBalance.getUser().getId(),
                            previousBalance.getLeaveType().getId(),
                            toYear)
                    .orElseGet(() -> {
                        LeaveBalance newBalance = LeaveBalance.builder()
                                .user(previousBalance.getUser())
                                .leaveType(previousBalance.getLeaveType())
                                .year(toYear)
                                .totalDays(0)
                                .usedDays(0)
                                .carriedOverDays(0)
                                .expiryDate(LocalDate.of(toYear + 1, 3, 31)) // Expires March 31 next year
                                .build();
                        return leaveBalanceRepository.save(newBalance);
                    });
            
            // Add carried over days
            nextYearBalance.setCarriedOverDays(daysToCarryOver);
            nextYearBalance.setTotalDays(nextYearBalance.getTotalDays() + daysToCarryOver);
            LeaveBalance updatedBalance = leaveBalanceRepository.save(nextYearBalance);
            
            // Record adjustment
            LeaveBalanceAdjustment adjustment = LeaveBalanceAdjustment.builder()
                    .leaveBalance(updatedBalance)
                    .adjustedBy(previousBalance.getUser()) // System carry-over
                    .adjustmentValue(daysToCarryOver)
                    .reason("Carried over from " + fromYear)
                    .type(AdjustmentType.CARRIED_OVER)
                    .build();
            
            adjustmentRepository.save(adjustment);
            
            // Send notification
            notificationService.createNotification(
                previousBalance.getUser(),
                "Leave Balance Carried Over",
                daysToCarryOver + " days of " + previousBalance.getLeaveType().getName() + 
                " have been carried over from " + fromYear + " to " + toYear + ".",
                NotificationType.BALANCE_UPDATE,
                "/dashboard/leave-balances",
                "View Leave Balances"
            );
        }
    }
    
    @Override
    @Transactional
    public LeaveBalance adjustBalance(Long leaveBalanceId, double amount, AdjustmentType type, 
                                      String reason, Long adjustedById) {
        LeaveBalance leaveBalance = leaveBalanceRepository.findById(leaveBalanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave Balance not found with id: " + leaveBalanceId));
        
        User adjustedBy = userRepository.findById(adjustedById)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + adjustedById));
        
        // Update balance
        if (type == AdjustmentType.MANUAL_ADDITION || type == AdjustmentType.ACCRUAL || 
            type == AdjustmentType.LEAVE_CANCELLED || type == AdjustmentType.CARRIED_OVER) {
            leaveBalance.setTotalDays(leaveBalance.getTotalDays() + amount);
        } else if (type == AdjustmentType.MANUAL_DEDUCTION || type == AdjustmentType.LEAVE_TAKEN) {
            leaveBalance.setUsedDays(leaveBalance.getUsedDays() + amount);
        } else if (type == AdjustmentType.EXPIRED) {
            double remainingDays = leaveBalance.getTotalDays() - leaveBalance.getUsedDays();
            leaveBalance.setTotalDays(leaveBalance.getTotalDays() - Math.min(remainingDays, amount));
        }
        
        LeaveBalance updatedBalance = leaveBalanceRepository.save(leaveBalance);
        
        // Record adjustment
        LeaveBalanceAdjustment adjustment = LeaveBalanceAdjustment.builder()
                .leaveBalance(updatedBalance)
                .adjustedBy(adjustedBy)
                .adjustmentValue(amount)
                .reason(reason)
                .type(type)
                .build();
        
        adjustmentRepository.save(adjustment);
        
        // Don't send notification for leave application-related adjustments (those are handled in LeaveApplicationService)
        if (type != AdjustmentType.LEAVE_TAKEN && type != AdjustmentType.LEAVE_CANCELLED) {
            String title;
            String message;
            
            if (type == AdjustmentType.MANUAL_ADDITION) {
                title = "Leave Balance Increased";
                message = "Your " + leaveBalance.getLeaveType().getName() + " balance has been increased by " + 
                          amount + " days. Reason: " + reason + ". Your new balance is " + 
                          updatedBalance.getRemainingDays() + " days.";
            } else if (type == AdjustmentType.MANUAL_DEDUCTION) {
                title = "Leave Balance Decreased";
                message = "Your " + leaveBalance.getLeaveType().getName() + " balance has been decreased by " + 
                          amount + " days. Reason: " + reason + ". Your new balance is " + 
                          updatedBalance.getRemainingDays() + " days.";
            } else if (type == AdjustmentType.EXPIRED) {
                title = "Leave Balance Expired";
                message = amount + " days of your " + leaveBalance.getLeaveType().getName() + 
                         " balance have expired. Your new balance is " + 
                         updatedBalance.getRemainingDays() + " days.";
            } else {
                title = "Leave Balance Updated";
                message = "Your " + leaveBalance.getLeaveType().getName() + " balance has been updated. Reason: " + 
                          reason + ". Your new balance is " + updatedBalance.getRemainingDays() + " days.";
            }
            
            // Send notification to the user
            notificationService.createNotification(
                updatedBalance.getUser(),
                title,
                message,
                NotificationType.BALANCE_UPDATE,
                "/dashboard/leave-balances",
                "View Leave Balances"
            );
        }
        
        return updatedBalance;
    }
    
    @Override
    @Transactional
    public void expireBalances() {
        LocalDate today = LocalDate.now();
        List<LeaveBalance> expiredBalances = leaveBalanceRepository.findAllExpiredBalances(today);
        
        for (LeaveBalance balance : expiredBalances) {
            double remainingDays = balance.getRemainingDays();
            
            if (remainingDays > 0) {
                // Record the expiry
                adjustBalance(
                        balance.getId(),
                        remainingDays,
                        AdjustmentType.EXPIRED,
                        "Balance expired on " + today,
                        balance.getUser().getId() // Use the user's ID as the adjuster (system)
                );
                
                // Notification will be sent within the adjustBalance method
            }
        }
    }
} 