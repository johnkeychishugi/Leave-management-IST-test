package com.ist.lms.model;

import com.ist.lms.model.enums.LeaveStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "leave_applications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "leave_type_id", nullable = false)
    private LeaveType leaveType;

    @NotNull
    @Column(name = "start_date")
    private LocalDate startDate;

    @NotNull
    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "total_days")
    private double totalDays;

    @NotBlank
    @Size(max = 255)
    private String reason;

    @Column(name = "return_date")
    private LocalDate returnDate;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private LeaveStatus status;

    @Size(max = 1000)
    @Column(name = "cancellation_reason")
    private String cancellationReason;

    @OneToMany(mappedBy = "leaveApplication", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LeaveDocument> documents = new ArrayList<>();

    @OneToMany(mappedBy = "leaveApplication", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LeaveApproval> approvals = new ArrayList<>();

    @Column(name = "emergency_contact")
    private String emergencyContact;

    @Column(name = "emergency_contact_phone")
    private String emergencyContactPhone;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    // Explicit getters in case Lombok is not working
    public LocalDate getStartDate() {
        return startDate;
    }
    
    public LocalDate getEndDate() {
        return endDate;
    }
    
    // Additional getters and setters
    public Long getId() {
        return id;
    }
    
    public User getUser() {
        return user;
    }
    
    public LeaveType getLeaveType() {
        return leaveType;
    }
    
    public double getTotalDays() {
        return totalDays;
    }
    
    public void setTotalDays(double totalDays) {
        this.totalDays = totalDays;
    }
    
    public LeaveStatus getStatus() {
        return status;
    }
    
    public void setStatus(LeaveStatus status) {
        this.status = status;
    }
    
    public String getReason() {
        return reason;
    }
    
    public void setReturnDate(LocalDate returnDate) {
        this.returnDate = returnDate;
    }
    
    public void setCancellationReason(String cancellationReason) {
        this.cancellationReason = cancellationReason;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    // Builder method
    public static LeaveApplicationBuilder builder() {
        return new LeaveApplicationBuilder();
    }
    
    // Custom Builder class
    public static class LeaveApplicationBuilder {
        private LeaveApplication instance = new LeaveApplication();
        
        public LeaveApplicationBuilder id(Long id) {
            instance.id = id;
            return this;
        }
        
        public LeaveApplicationBuilder user(User user) {
            instance.user = user;
            return this;
        }
        
        public LeaveApplicationBuilder leaveType(LeaveType leaveType) {
            instance.leaveType = leaveType;
            return this;
        }
        
        public LeaveApplicationBuilder startDate(LocalDate startDate) {
            instance.startDate = startDate;
            return this;
        }
        
        public LeaveApplicationBuilder endDate(LocalDate endDate) {
            instance.endDate = endDate;
            return this;
        }
        
        public LeaveApplicationBuilder totalDays(double totalDays) {
            instance.totalDays = totalDays;
            return this;
        }
        
        public LeaveApplicationBuilder reason(String reason) {
            instance.reason = reason;
            return this;
        }
        
        public LeaveApplicationBuilder status(LeaveStatus status) {
            instance.status = status;
            return this;
        }
        
        public LeaveApplication build() {
            return instance;
        }
    }
} 