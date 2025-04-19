package com.ist.lms.repository;

import com.ist.lms.model.LeaveBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, Long> {
    List<LeaveBalance> findByUserId(Long userId);
    
    List<LeaveBalance> findByUserIdAndYear(Long userId, int year);
    
    Optional<LeaveBalance> findByUserIdAndLeaveTypeIdAndYear(Long userId, Long leaveTypeId, int year);
    
    @Query("SELECT lb FROM LeaveBalance lb WHERE lb.user.id = :userId AND lb.leaveType.id = :leaveTypeId AND lb.year = :year")
    Optional<LeaveBalance> findUserLeaveBalance(@Param("userId") Long userId, 
                                              @Param("leaveTypeId") Long leaveTypeId, 
                                              @Param("year") int year);
    
    @Query("SELECT lb FROM LeaveBalance lb WHERE lb.expiryDate < :currentDate AND lb.totalDays > lb.usedDays")
    List<LeaveBalance> findAllExpiredBalances(@Param("currentDate") LocalDate currentDate);
} 