package com.ist.lms.model;

import com.ist.lms.model.enums.AdjustmentType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "leave_balance_adjustments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveBalanceAdjustment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "leave_balance_id", nullable = false)
    private LeaveBalance leaveBalance;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "adjusted_by_id", nullable = false)
    private User adjustedBy;

    @NotNull
    @Column(name = "adjustment_value")
    private double adjustmentValue;

    @Size(max = 255)
    private String reason;

    @NotNull
    @Enumerated(EnumType.STRING)
    private AdjustmentType type;

    @CreationTimestamp
    private LocalDateTime createdAt;

    // Builder method
    public static LeaveBalanceAdjustmentBuilder builder() {
        return new LeaveBalanceAdjustmentBuilder();
    }

    // Custom Builder class
    public static class LeaveBalanceAdjustmentBuilder {
        private LeaveBalanceAdjustment instance = new LeaveBalanceAdjustment();
        
        public LeaveBalanceAdjustmentBuilder id(Long id) {
            instance.id = id;
            return this;
        }
        
        public LeaveBalanceAdjustmentBuilder leaveBalance(LeaveBalance leaveBalance) {
            instance.leaveBalance = leaveBalance;
            return this;
        }
        
        public LeaveBalanceAdjustmentBuilder adjustedBy(User adjustedBy) {
            instance.adjustedBy = adjustedBy;
            return this;
        }
        
        public LeaveBalanceAdjustmentBuilder adjustmentValue(double adjustmentValue) {
            instance.adjustmentValue = adjustmentValue;
            return this;
        }
        
        public LeaveBalanceAdjustmentBuilder reason(String reason) {
            instance.reason = reason;
            return this;
        }
        
        public LeaveBalanceAdjustmentBuilder type(AdjustmentType type) {
            instance.type = type;
            return this;
        }
        
        public LeaveBalanceAdjustment build() {
            return instance;
        }
    }
} 