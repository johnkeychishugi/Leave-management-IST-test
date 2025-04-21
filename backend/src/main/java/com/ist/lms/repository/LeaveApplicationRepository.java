package com.ist.lms.repository;

import com.ist.lms.model.LeaveApplication;
import com.ist.lms.model.enums.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface LeaveApplicationRepository extends JpaRepository<LeaveApplication, Long> {
       //SORT BY CREATED DATE DESC
    List<LeaveApplication> findByUserId(Long userId);
    
    List<LeaveApplication> findByUserIdAndStatus(Long userId, LeaveStatus status);
    
    List<LeaveApplication> findByStatus(LeaveStatus status);
    
    @Query("SELECT la FROM LeaveApplication la WHERE la.user.id = :userId AND la.status = 'APPROVED' " +
           "AND ((la.startDate BETWEEN :startDate AND :endDate) OR (la.endDate BETWEEN :startDate AND :endDate) " +
           "OR (:startDate BETWEEN la.startDate AND la.endDate))")
    List<LeaveApplication> findOverlappingLeaves(@Param("userId") Long userId,  
                                                @Param("startDate") LocalDate startDate, 
                                                @Param("endDate") LocalDate endDate);
    
    @Query("SELECT la FROM LeaveApplication la WHERE la.status = 'APPROVED' " +
           "AND ((la.startDate BETWEEN :startDate AND :endDate) OR (la.endDate BETWEEN :startDate AND :endDate))")
    List<LeaveApplication> findAllLeavesInDateRange(@Param("startDate") LocalDate startDate, 
                                                  @Param("endDate") LocalDate endDate);
    
    @Query("SELECT la FROM LeaveApplication la WHERE la.user.department.id = :departmentId AND la.status = 'APPROVED' " +
           "AND ((la.startDate BETWEEN :startDate AND :endDate) OR (la.endDate BETWEEN :startDate AND :endDate))")
    List<LeaveApplication> findDepartmentLeavesInDateRange(@Param("departmentId") Long departmentId,
                                                         @Param("startDate") LocalDate startDate, 
                                                         @Param("endDate") LocalDate endDate);
    
    @Query("SELECT la FROM LeaveApplication la JOIN la.approvals ap WHERE ap.approver.id = :approverId AND ap.status = 'PENDING'")
    List<LeaveApplication> findPendingApprovalsByApproverId(@Param("approverId") Long approverId);
    
    @Query("SELECT la FROM LeaveApplication la JOIN FETCH la.user")
    List<LeaveApplication> findAllWithUsers();
    
    @Query("SELECT la FROM LeaveApplication la JOIN FETCH la.user WHERE la.id = :id")
    Optional<LeaveApplication> findByIdWithUser(@Param("id") Long id);
} 