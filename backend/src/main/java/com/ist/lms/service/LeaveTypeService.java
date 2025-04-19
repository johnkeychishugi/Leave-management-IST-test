package com.ist.lms.service;

import com.ist.lms.model.LeaveType;

import java.util.List;
import java.util.Optional;

public interface LeaveTypeService {
    List<LeaveType> getAllLeaveTypes();
    
    List<LeaveType> getAllActiveLeaveTypes();
    
    Optional<LeaveType> getLeaveTypeById(Long id);
    
    Optional<LeaveType> getLeaveTypeByName(String name);
    
    LeaveType createLeaveType(LeaveType leaveType);
    
    LeaveType updateLeaveType(LeaveType leaveType);
    
    void deleteLeaveType(Long id);
    
    void activateLeaveType(Long id);
    
    void deactivateLeaveType(Long id);
} 