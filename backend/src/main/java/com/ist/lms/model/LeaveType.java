package com.ist.lms.model;

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

import java.time.LocalDateTime;

@Entity
@Table(name = "leave_types", uniqueConstraints = {
    @UniqueConstraint(columnNames = "name")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 50)
    private String name;

    @Size(max = 255)
    private String description;

    @NotNull
    @Column(name = "default_days")
    private double defaultDays;

    @Column(name = "is_paid")
    private boolean paid = true;

    @Column(name = "is_active")
    private boolean active = true;

    @Column(name = "requires_approval")
    private boolean requiresApproval = true;

    @Column(name = "requires_documents")
    private boolean requiresDocuments = false;

    @Column(name = "max_consecutive_days")
    private Integer maxConsecutiveDays;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    // Explicit getters and setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public double getDefaultDays() {
        return defaultDays;
    }
    
    public void setDefaultDays(double defaultDays) {
        this.defaultDays = defaultDays;
    }
    
    public boolean isPaid() {
        return paid;
    }
    
    public void setPaid(boolean paid) {
        this.paid = paid;
    }
    
    public boolean isActive() {
        return active;
    }
    
    public void setActive(boolean active) {
        this.active = active;
    }
    
    public boolean isRequiresApproval() {
        return requiresApproval;
    }
    
    public void setRequiresApproval(boolean requiresApproval) {
        this.requiresApproval = requiresApproval;
    }
    
    public boolean isRequiresDocuments() {
        return requiresDocuments;
    }
    
    public void setRequiresDocuments(boolean requiresDocuments) {
        this.requiresDocuments = requiresDocuments;
    }
    
    public Integer getMaxConsecutiveDays() {
        return maxConsecutiveDays;
    }
    
    public void setMaxConsecutiveDays(Integer maxConsecutiveDays) {
        this.maxConsecutiveDays = maxConsecutiveDays;
    }
    
    // Builder method
    public static LeaveTypeBuilder builder() {
        return new LeaveTypeBuilder();
    }
    
    // Custom Builder class
    public static class LeaveTypeBuilder {
        private LeaveType instance = new LeaveType();
        
        public LeaveTypeBuilder id(Long id) {
            instance.id = id;
            return this;
        }
        
        public LeaveTypeBuilder name(String name) {
            instance.name = name;
            return this;
        }
        
        public LeaveTypeBuilder description(String description) {
            instance.description = description;
            return this;
        }
        
        public LeaveTypeBuilder defaultDays(double defaultDays) {
            instance.defaultDays = defaultDays;
            return this;
        }
        
        public LeaveTypeBuilder paid(boolean paid) {
            instance.paid = paid;
            return this;
        }
        
        public LeaveTypeBuilder active(boolean active) {
            instance.active = active;
            return this;
        }
        
        public LeaveTypeBuilder requiresApproval(boolean requiresApproval) {
            instance.requiresApproval = requiresApproval;
            return this;
        }
        
        public LeaveTypeBuilder requiresDocuments(boolean requiresDocuments) {
            instance.requiresDocuments = requiresDocuments;
            return this;
        }
        
        public LeaveTypeBuilder maxConsecutiveDays(Integer maxConsecutiveDays) {
            instance.maxConsecutiveDays = maxConsecutiveDays;
            return this;
        }
        
        public LeaveType build() {
            return instance;
        }
    }
} 