package com.ist.lms.model;

import com.ist.lms.model.enums.ApprovalStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "leave_approvals")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveApproval {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leave_application_id", nullable = false)
    private LeaveApplication leaveApplication;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "approver_id", nullable = false)
    private User approver;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ApprovalStatus status;

    @Size(max = 255)
    private String comments;

    @Column(name = "approval_level")
    private int approvalLevel;

    @Column(name = "notification_sent")
    private boolean notificationSent;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // Builder method
    public static LeaveApprovalBuilder builder() {
        return new LeaveApprovalBuilder();
    }

    // Custom Builder class
    public static class LeaveApprovalBuilder {
        private LeaveApproval instance = new LeaveApproval();
        
        public LeaveApprovalBuilder id(Long id) {
            instance.id = id;
            return this;
        }
        
        public LeaveApprovalBuilder leaveApplication(LeaveApplication leaveApplication) {
            instance.leaveApplication = leaveApplication;
            return this;
        }
        
        public LeaveApprovalBuilder approver(User approver) {
            instance.approver = approver;
            return this;
        }
        
        public LeaveApprovalBuilder status(ApprovalStatus status) {
            instance.status = status;
            return this;
        }
        
        public LeaveApprovalBuilder comments(String comments) {
            instance.comments = comments;
            return this;
        }
        
        public LeaveApprovalBuilder approvalLevel(int approvalLevel) {
            instance.approvalLevel = approvalLevel;
            return this;
        }
        
        public LeaveApprovalBuilder notificationSent(boolean notificationSent) {
            instance.notificationSent = notificationSent;
            return this;
        }
        
        public LeaveApproval build() {
            return instance;
        }
    }
} 