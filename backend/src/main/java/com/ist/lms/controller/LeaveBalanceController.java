package com.ist.lms.controller;

import com.ist.lms.exception.ResourceNotFoundException;
import com.ist.lms.model.LeaveBalance;
import com.ist.lms.model.enums.AdjustmentType;
import com.ist.lms.service.LeaveBalanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/leave-balances")
public class LeaveBalanceController {
    
    private final LeaveBalanceService leaveBalanceService;
    
    @Autowired
    public LeaveBalanceController(LeaveBalanceService leaveBalanceService) {
        this.leaveBalanceService = leaveBalanceService;
    }
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public List<LeaveBalance> getAllLeaveBalances() {
        return leaveBalanceService.getAllLeaveBalances();
    }
    
    @GetMapping("/user/{userId}")
    public List<LeaveBalance> getLeaveBalancesByUserId(@PathVariable Long userId) {
        return leaveBalanceService.getLeaveBalancesByUserId(userId);
    }
    
    @GetMapping("/user/{userId}/year/{year}")
    public List<LeaveBalance> getLeaveBalancesByUserIdAndYear(@PathVariable Long userId, @PathVariable int year) {
        return leaveBalanceService.getLeaveBalancesByUserIdAndYear(userId, year);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<LeaveBalance> getLeaveBalanceById(@PathVariable Long id) {
        return leaveBalanceService.getLeaveBalanceById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResourceNotFoundException("Leave Balance not found with id: " + id));
    }
    
    @GetMapping("/user/{userId}/type/{leaveTypeId}/year/{year}")
    public ResponseEntity<LeaveBalance> getLeaveBalanceByUserAndType(
            @PathVariable Long userId, 
            @PathVariable Long leaveTypeId, 
            @PathVariable int year) {
        
        return leaveBalanceService.getLeaveBalanceByUserAndType(userId, leaveTypeId, year)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResourceNotFoundException("Leave Balance not found for user, type and year"));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public LeaveBalance createLeaveBalance(@RequestBody LeaveBalance leaveBalance) {
        return leaveBalanceService.createLeaveBalance(leaveBalance);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<LeaveBalance> updateLeaveBalance(@PathVariable Long id, @RequestBody LeaveBalance leaveBalance) {
        if (!leaveBalanceService.getLeaveBalanceById(id).isPresent()) {
            throw new ResourceNotFoundException("Leave Balance not found with id: " + id);
        }
        
        leaveBalance.setId(id);
        return ResponseEntity.ok(leaveBalanceService.updateLeaveBalance(leaveBalance));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteLeaveBalance(@PathVariable Long id) {
        if (!leaveBalanceService.getLeaveBalanceById(id).isPresent()) {
            throw new ResourceNotFoundException("Leave Balance not found with id: " + id);
        }
        
        leaveBalanceService.deleteLeaveBalance(id);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/accrue/{month}/{year}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<?> accrueLeaveBalances(@PathVariable int month, @PathVariable int year) {
        leaveBalanceService.accrueLeaveBalances(month, year);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/carry-over")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<?> carryOverBalances(
            @RequestParam int fromYear, 
            @RequestParam int toYear, 
            @RequestParam double maxDays) {
        
        leaveBalanceService.carryOverBalances(fromYear, toYear, maxDays);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{id}/adjust")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<LeaveBalance> adjustBalance(
            @PathVariable Long id, 
            @RequestBody Map<String, Object> adjustmentData) {
        
        if (!leaveBalanceService.getLeaveBalanceById(id).isPresent()) {
            throw new ResourceNotFoundException("Leave Balance not found with id: " + id);
        }
        
        double amount = Double.parseDouble(adjustmentData.get("amount").toString());
        AdjustmentType type = AdjustmentType.valueOf(adjustmentData.get("type").toString());
        String reason = adjustmentData.get("reason").toString();
        Long adjustedById = Long.parseLong(adjustmentData.get("adjustedById").toString());
        
        LeaveBalance adjusted = leaveBalanceService.adjustBalance(id, amount, type, reason, adjustedById);
        return ResponseEntity.ok(adjusted);
    }
    
    @PostMapping("/expire")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<?> expireBalances() {
        leaveBalanceService.expireBalances();
        return ResponseEntity.ok().build();
    }
} 