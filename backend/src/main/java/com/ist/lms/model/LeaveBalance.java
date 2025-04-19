package com.ist.lms.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "leave_balances", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "leave_type_id", "year"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveBalance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "leave_type_id", nullable = false)
    private LeaveType leaveType;
    
    private int year;
    
    @Column(name = "total_days")
    private double totalDays;
    
    @Column(name = "used_days")
    private double usedDays;
    
    @Column(name = "carried_over_days")
    private double carriedOverDays;
    
    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    public double getRemainingDays() {
        return totalDays - usedDays;
    }
    
    // Explicitly added getters to resolve compilation issues
    public Long getId() {
        return id;
    }
    
    public User getUser() {
        return user;
    }
    
    public LeaveType getLeaveType() {
        return leaveType;
    }
    
    public int getYear() {
        return year;
    }
    
    public double getTotalDays() {
        return totalDays;
    }
    
    public double getUsedDays() {
        return usedDays;
    }
    
    public double getCarriedOverDays() {
        return carriedOverDays;
    }
    
    // Explicitly added setters to resolve compilation issues
    public void setId(Long id) {
        this.id = id;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public void setLeaveType(LeaveType leaveType) {
        this.leaveType = leaveType;
    }
    
    public void setYear(int year) {
        this.year = year;
    }
    
    public void setTotalDays(double totalDays) {
        this.totalDays = totalDays;
    }
    
    public void setUsedDays(double usedDays) {
        this.usedDays = usedDays;
    }
    
    public void setCarriedOverDays(double carriedOverDays) {
        this.carriedOverDays = carriedOverDays;
    }
    
    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }
    
    // Explicit builder method
    public static LeaveBalanceBuilder builder() {
        return new LeaveBalanceBuilder();
    }
    
    // Custom Builder class
    public static class LeaveBalanceBuilder {
        private LeaveBalance instance = new LeaveBalance();
        
        public LeaveBalanceBuilder id(Long id) {
            instance.id = id;
            return this;
        }
        
        public LeaveBalanceBuilder user(User user) {
            instance.user = user;
            return this;
        }
        
        public LeaveBalanceBuilder leaveType(LeaveType leaveType) {
            instance.leaveType = leaveType;
            return this;
        }
        
        public LeaveBalanceBuilder year(int year) {
            instance.year = year;
            return this;
        }
        
        public LeaveBalanceBuilder totalDays(double totalDays) {
            instance.totalDays = totalDays;
            return this;
        }
        
        public LeaveBalanceBuilder usedDays(double usedDays) {
            instance.usedDays = usedDays;
            return this;
        }
        
        public LeaveBalanceBuilder carriedOverDays(double carriedOverDays) {
            instance.carriedOverDays = carriedOverDays;
            return this;
        }
        
        public LeaveBalanceBuilder expiryDate(LocalDate expiryDate) {
            instance.expiryDate = expiryDate;
            return this;
        }
        
        public LeaveBalance build() {
            return instance;
        }
    }
} 