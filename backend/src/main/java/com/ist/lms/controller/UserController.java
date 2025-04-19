package com.ist.lms.controller;

import com.ist.lms.exception.ResourceNotFoundException;
import com.ist.lms.model.User;
import com.ist.lms.security.SecurityService;
import com.ist.lms.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {
    
    private final UserService userService;
    private final SecurityService securityService;
    
    @Autowired
    public UserController(UserService userService, SecurityService securityService) {
        this.userService = userService;
        this.securityService = securityService;
    }
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }
    
    @GetMapping("/active")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR') or hasRole('MANAGER')")
    public List<User> getAllActiveUsers() {
        return userService.getAllActiveUsers();
    }
    
    @GetMapping("/managers")
    public List<User> getAllManagers() {
        return userService.getAllManagers();
    }
    
    @GetMapping("/department/{departmentId}")
    public List<User> getUsersByDepartment(@PathVariable Long departmentId) {
        return userService.getUsersByDepartment(departmentId);
    }
    
    @GetMapping("/subordinates/{managerId}")
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN') or hasRole('HR')")
    public List<User> getSubordinates(@PathVariable Long managerId) {
        return userService.getSubordinates(managerId);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }
    
    @GetMapping("/email/{email}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        return userService.getUserByEmail(email)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public User createUser(@RequestBody User user) {
        return userService.createUser(user);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR') or @securityService.isCurrentUser(#id)")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        if (!userService.getUserById(id).isPresent()) {
            throw new ResourceNotFoundException("User not found with id: " + id);
        }
        
        user.setId(id);
        return ResponseEntity.ok(userService.updateUser(user));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!userService.getUserById(id).isPresent()) {
            throw new ResourceNotFoundException("User not found with id: " + id);
        }
        
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<?> deactivateUser(@PathVariable Long id) {
        if (!userService.getUserById(id).isPresent()) {
            throw new ResourceNotFoundException("User not found with id: " + id);
        }
        
        userService.deactivateUser(id);
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<?> activateUser(@PathVariable Long id) {
        if (!userService.getUserById(id).isPresent()) {
            throw new ResourceNotFoundException("User not found with id: " + id);
        }
        
        userService.activateUser(id);
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/{userId}/manager/{managerId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<?> assignManager(@PathVariable Long userId, @PathVariable Long managerId) {
        userService.assignManager(userId, managerId);
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/{userId}/department/{departmentId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<?> assignDepartment(@PathVariable Long userId, @PathVariable Long departmentId) {
        userService.assignDepartment(userId, departmentId);
        return ResponseEntity.ok().build();
    }
    
    // New endpoints for profile and settings
    
    @GetMapping("/me/profile")
    public ResponseEntity<User> getCurrentUserProfile() {
        return securityService.getCurrentUser()
            .map(ResponseEntity::ok)
            .orElseThrow(() -> new IllegalStateException("Not authenticated"));
    }
    
    @PutMapping("/{id}/profile")
    @PreAuthorize("@securityService.isCurrentUser(#id)")
    public ResponseEntity<User> updateUserProfile(@PathVariable Long id, @RequestBody User profileData) {
        return ResponseEntity.ok(userService.updateUserProfile(id, profileData));
    }
    
    @PutMapping("/{id}/settings")
    @PreAuthorize("@securityService.isCurrentUser(#id)")
    public ResponseEntity<User> updateUserSettings(
            @PathVariable Long id, 
            @RequestBody Map<String, Object> settings) {
        
        String theme = settings.containsKey("preferredTheme") ? 
            settings.get("preferredTheme").toString() : null;
            
        String notificationPrefs = settings.containsKey("notificationPreferences") ? 
            settings.get("notificationPreferences").toString() : null;
            
        return ResponseEntity.ok(userService.updateUserSettings(id, theme, notificationPrefs));
    }
    
    @PutMapping("/{id}/password")
    @PreAuthorize("@securityService.isCurrentUser(#id)")
    public ResponseEntity<User> updateUserPassword(
            @PathVariable Long id, 
            @RequestBody Map<String, String> passwordData) {
        
        String oldPassword = passwordData.get("oldPassword");
        String newPassword = passwordData.get("newPassword");
        
        if (oldPassword == null || newPassword == null) {
            throw new IllegalArgumentException("Old and new passwords are required");
        }
        
        return ResponseEntity.ok(userService.updateUserPassword(id, oldPassword, newPassword));
    }
} 