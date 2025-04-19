package com.ist.lms.repository;

import com.ist.lms.model.LeaveBalanceAdjustment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveBalanceAdjustmentRepository extends JpaRepository<LeaveBalanceAdjustment, Long> {
    List<LeaveBalanceAdjustment> findByLeaveBalanceId(Long leaveBalanceId);
    
    List<LeaveBalanceAdjustment> findByLeaveBalanceUserId(Long userId);
} 