package com.ist.lms.repository;

import com.ist.lms.model.LeaveApproval;
import com.ist.lms.model.enums.ApprovalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveApprovalRepository extends JpaRepository<LeaveApproval, Long> {
    List<LeaveApproval> findByLeaveApplicationId(Long leaveApplicationId);
    
    List<LeaveApproval> findByApproverId(Long approverId);
    
    List<LeaveApproval> findByApproverIdAndStatus(Long approverId, ApprovalStatus status);
    
    List<LeaveApproval> findByLeaveApplicationIdAndStatus(Long leaveApplicationId, ApprovalStatus status);
    
    List<LeaveApproval> findByLeaveApplicationIdOrderByApprovalLevelAsc(Long leaveApplicationId);
} 