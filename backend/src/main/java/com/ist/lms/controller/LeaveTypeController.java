package com.ist.lms.controller;

import com.ist.lms.exception.ResourceNotFoundException;
import com.ist.lms.model.LeaveType;
import com.ist.lms.service.LeaveTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/leave-types")
public class LeaveTypeController {
    
    private final LeaveTypeService leaveTypeService;
    
    @Autowired
    public LeaveTypeController(LeaveTypeService leaveTypeService) {
        this.leaveTypeService = leaveTypeService;
    }
    
    @GetMapping
    public List<LeaveType> getAllLeaveTypes() {
        return leaveTypeService.getAllLeaveTypes();
    }
    
    @GetMapping("/active")
    public List<LeaveType> getAllActiveLeaveTypes() {
        return leaveTypeService.getAllActiveLeaveTypes();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<LeaveType> getLeaveTypeById(@PathVariable Long id) {
        return leaveTypeService.getLeaveTypeById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResourceNotFoundException("Leave Type not found with id: " + id));
    }
    
    @GetMapping("/name/{name}")
    public ResponseEntity<LeaveType> getLeaveTypeByName(@PathVariable String name) {
        return leaveTypeService.getLeaveTypeByName(name)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResourceNotFoundException("Leave Type not found with name: " + name));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public LeaveType createLeaveType(@Valid @RequestBody LeaveType leaveType) {
        return leaveTypeService.createLeaveType(leaveType);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<LeaveType> updateLeaveType(@PathVariable Long id, @Valid @RequestBody LeaveType leaveType) {
        if (!leaveTypeService.getLeaveTypeById(id).isPresent()) {
            throw new ResourceNotFoundException("Leave Type not found with id: " + id);
        }
        
        leaveType.setId(id);
        return ResponseEntity.ok(leaveTypeService.updateLeaveType(leaveType));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteLeaveType(@PathVariable Long id) {
        if (!leaveTypeService.getLeaveTypeById(id).isPresent()) {
            throw new ResourceNotFoundException("Leave Type not found with id: " + id);
        }
        
        leaveTypeService.deleteLeaveType(id);
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<?> activateLeaveType(@PathVariable Long id) {
        if (!leaveTypeService.getLeaveTypeById(id).isPresent()) {
            throw new ResourceNotFoundException("Leave Type not found with id: " + id);
        }
        
        leaveTypeService.activateLeaveType(id);
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<?> deactivateLeaveType(@PathVariable Long id) {
        if (!leaveTypeService.getLeaveTypeById(id).isPresent()) {
            throw new ResourceNotFoundException("Leave Type not found with id: " + id);
        }
        
        leaveTypeService.deactivateLeaveType(id);
        return ResponseEntity.ok().build();
    }
} 