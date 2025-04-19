package com.ist.lms.model;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users", uniqueConstraints = {
    @UniqueConstraint(columnNames = "email")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 50)
    private String firstName;

    @NotBlank
    @Size(max = 50)
    private String lastName;

    @NotBlank
    @Size(max = 100)
    @Email
    private String email;

    @JsonIgnore
    private String password;

    @Size(max = 255)
    private String profilePictureUrl;

    @Size(max = 20)
    private String phoneNumber;

    @Column(name = "preferred_theme")
    private String preferredTheme = "light"; // Default to light theme

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "notification_preferences", columnDefinition = "jsonb")
    private String notificationPreferences = "{\"email\":true,\"inApp\":true}"; // Default to all notifications enabled

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id")
    @JsonIgnoreProperties({"users", "manager"})
    private Department department;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "manager_id")
    @JsonIgnore
    private User manager;

    @OneToMany(mappedBy = "manager")
    @JsonIgnore
    private Set<User> subordinates = new HashSet<>();

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new HashSet<>();

    @Column(name = "employment_date")
    private LocalDate employmentDate;

    @Column(name = "is_active")
    private boolean active = true;

    @Column(name = "microsoft_id")
    private String microsoftId;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public String getFullName() {
        return firstName + " " + lastName;
    }
    
    // Explicit setters for required fields
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public void setRoles(Set<Role> roles) {
        this.roles = roles;
    }
    
    public void setActive(boolean active) {
        this.active = active;
    }
    
    public void setManager(User manager) {
        this.manager = manager;
    }
    
    public void setDepartment(Department department) {
        this.department = department;
    }
    
    // Getters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getFirstName() {
        return firstName;
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public String getEmail() {
        return email;
    }
    
    @JsonIgnore
    public String getPassword() {
        return password;
    }
    
    public Set<Role> getRoles() {
        return roles;
    }
    
    public boolean isActive() {
        return active;
    }
    
    public User getManager() {
        return manager;
    }
    
    public Department getDepartment() {
        return department;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }

    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }

    public LocalDate getEmploymentDate() {
        return employmentDate;
    }

    public void setEmploymentDate(LocalDate employmentDate) {
        this.employmentDate = employmentDate;
    }

    public String getMicrosoftId() {
        return microsoftId;
    }

    public void setMicrosoftId(String microsoftId) {
        this.microsoftId = microsoftId;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }
    
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
    
    public String getPreferredTheme() {
        return preferredTheme;
    }
    
    public void setPreferredTheme(String preferredTheme) {
        this.preferredTheme = preferredTheme;
    }
    
    public String getNotificationPreferences() {
        return notificationPreferences;
    }
    
    public void setNotificationPreferences(String notificationPreferences) {
        this.notificationPreferences = notificationPreferences;
    }
    
    // Explicit builder in case Lombok is not working
    public static UserBuilder builder() {
        return new UserBuilder();
    }
    
    // Custom builder class
    public static class UserBuilder {
        private final User user = new User();
        
        public UserBuilder firstName(String firstName) {
            user.firstName = firstName;
            return this;
        }
        
        public UserBuilder lastName(String lastName) {
            user.lastName = lastName;
            return this;
        }
        
        public UserBuilder email(String email) {
            user.email = email;
            return this;
        }
        
        public UserBuilder password(String password) {
            user.password = password;
            return this;
        }
        
        public User build() {
            return user;
        }
    }
} 