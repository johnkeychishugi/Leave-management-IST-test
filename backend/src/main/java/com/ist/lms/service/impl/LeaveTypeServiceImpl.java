package com.ist.lms.service.impl;

import com.ist.lms.exception.ResourceNotFoundException;
import com.ist.lms.model.LeaveType;
import com.ist.lms.repository.LeaveTypeRepository;
import com.ist.lms.service.LeaveTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class LeaveTypeServiceImpl implements LeaveTypeService {
    
    private final LeaveTypeRepository leaveTypeRepository;
    
    @Autowired
    public LeaveTypeServiceImpl(LeaveTypeRepository leaveTypeRepository) {
        this.leaveTypeRepository = leaveTypeRepository;
    }
    
    @Override
    public List<LeaveType> getAllLeaveTypes() {
        return leaveTypeRepository.findAll()
                .stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .toList();
    }
    
    @Override
    public List<LeaveType> getAllActiveLeaveTypes() {
        return leaveTypeRepository.findAllActive()
                .stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .toList();
    }
    
    @Override
    public Optional<LeaveType> getLeaveTypeById(Long id) {
        return leaveTypeRepository.findById(id);
    }
    
    @Override
    public Optional<LeaveType> getLeaveTypeByName(String name) {
        return leaveTypeRepository.findByName(name);
    }
    
    @Override
    @Transactional
    public LeaveType createLeaveType(LeaveType leaveType) {
        return leaveTypeRepository.save(leaveType);
    }
    
    @Override
    @Transactional
    public LeaveType updateLeaveType(LeaveType leaveType) {
        return leaveTypeRepository.save(leaveType);
    }
    
    @Override
    @Transactional
    public void deleteLeaveType(Long id) {
        leaveTypeRepository.deleteById(id);
    }
    
    @Override
    @Transactional
    public void activateLeaveType(Long id) {
        LeaveType leaveType = leaveTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave Type not found with id: " + id));
        leaveType.setActive(true);
        leaveTypeRepository.save(leaveType);
    }
    
    @Override
    @Transactional
    public void deactivateLeaveType(Long id) {
        LeaveType leaveType = leaveTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave Type not found with id: " + id));
        leaveType.setActive(false);
        leaveTypeRepository.save(leaveType);
    }
} 