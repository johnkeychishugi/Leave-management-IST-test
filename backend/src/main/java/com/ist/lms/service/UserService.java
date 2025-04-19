package com.ist.lms.service;

import com.ist.lms.model.User;

import java.util.List;
import java.util.Optional;

public interface UserService {
    List<User> getAllUsers();
    
    List<User> getAllActiveUsers();
    
    List<User> getAllManagers();
    
    List<User> getUsersByDepartment(Long departmentId);
    
    List<User> getSubordinates(Long managerId);
    
    Optional<User> getUserById(Long id);
    
    Optional<User> getUserByEmail(String email);
    
    Optional<User> getUserByMicrosoftId(String microsoftId);
    
    User createUser(User user);
    
    User updateUser(User user);
    
    User updateUserProfile(Long userId, User profileData);
    
    User updateUserSettings(Long userId, String preferredTheme, String notificationPreferences);
    
    User updateUserPassword(Long userId, String oldPassword, String newPassword);
    
    void deleteUser(Long id);
    
    void deactivateUser(Long id);
    
    void activateUser(Long id);
    
    void assignManager(Long userId, Long managerId);
    
    void assignDepartment(Long userId, Long departmentId);
} 