package com.ist.lms.service.impl;

import com.ist.lms.exception.ResourceNotFoundException;
import com.ist.lms.model.Department;
import com.ist.lms.model.User;
import com.ist.lms.repository.DepartmentRepository;
import com.ist.lms.repository.UserRepository;
import com.ist.lms.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {
    
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Autowired
    public UserServiceImpl(
        UserRepository userRepository, 
        DepartmentRepository departmentRepository,
        PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    @Override
    public List<User> getAllActiveUsers() {
        return userRepository.findAllActiveUsers();
    }
    
    @Override
    public List<User> getAllManagers() {
        return userRepository.findAllManagers();
    }
    
    @Override
    public List<User> getUsersByDepartment(Long departmentId) {
        return userRepository.findByDepartmentId(departmentId);
    }
    
    @Override
    public List<User> getSubordinates(Long managerId) {
        return userRepository.findByManagerId(managerId);
    }
    
    @Override
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }
    
    @Override
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    @Override
    public Optional<User> getUserByMicrosoftId(String microsoftId) {
        return userRepository.findByMicrosoftId(microsoftId);
    }
    
    @Override
    @Transactional
    public User createUser(User user) {
        return userRepository.save(user);
    }
    
    @Override
    @Transactional
    public User updateUser(User updatedUser) {
        User existingUser = userRepository.findById(updatedUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + updatedUser.getId()));
        
        // Update only non-null fields
        if (updatedUser.getFirstName() != null) {
            existingUser.setFirstName(updatedUser.getFirstName());
        }
        if (updatedUser.getLastName() != null) {
            existingUser.setLastName(updatedUser.getLastName());
        }
        if (updatedUser.getEmail() != null) {
            existingUser.setEmail(updatedUser.getEmail());
        }
        if (updatedUser.getPassword() != null) {
            existingUser.setPassword(updatedUser.getPassword());
        }
        if (updatedUser.getProfilePictureUrl() != null) {
            existingUser.setProfilePictureUrl(updatedUser.getProfilePictureUrl());
        }
        if (updatedUser.getDepartment() != null) {
            existingUser.setDepartment(updatedUser.getDepartment());
        }
        if (updatedUser.getManager() != null) {
            existingUser.setManager(updatedUser.getManager());
        }
        if (updatedUser.getRoles() != null && !updatedUser.getRoles().isEmpty()) {
            existingUser.setRoles(updatedUser.getRoles());
        }
        if (updatedUser.getEmploymentDate() != null) {
            existingUser.setEmploymentDate(updatedUser.getEmploymentDate());
        }
        if (updatedUser.getMicrosoftId() != null) {
            existingUser.setMicrosoftId(updatedUser.getMicrosoftId());
        }
        if (updatedUser.getPhoneNumber() != null) {
            existingUser.setPhoneNumber(updatedUser.getPhoneNumber());
        }
        if (updatedUser.getPreferredTheme() != null) {
            existingUser.setPreferredTheme(updatedUser.getPreferredTheme());
        }
        if (updatedUser.getNotificationPreferences() != null) {
            existingUser.setNotificationPreferences(updatedUser.getNotificationPreferences());
        }
        
        // Update active status only if it's explicitly set in the update request
        existingUser.setActive(updatedUser.isActive());
        
        return userRepository.save(existingUser);
    }
    
    @Override
    @Transactional
    public User updateUserProfile(Long userId, User profileData) {
        User existingUser = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        // Update only profile-related fields
        if (profileData.getFirstName() != null) {
            existingUser.setFirstName(profileData.getFirstName());
        }
        if (profileData.getLastName() != null) {
            existingUser.setLastName(profileData.getLastName());
        }
        if (profileData.getEmail() != null) {
            existingUser.setEmail(profileData.getEmail());
        }
        if (profileData.getProfilePictureUrl() != null) {
            existingUser.setProfilePictureUrl(profileData.getProfilePictureUrl());
        }
        if (profileData.getPhoneNumber() != null) {
            existingUser.setPhoneNumber(profileData.getPhoneNumber());
        }
        
        return userRepository.save(existingUser);
    }
    
    @Override
    @Transactional
    public User updateUserSettings(Long userId, String preferredTheme, String notificationPreferences) {
        User existingUser = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        if (preferredTheme != null) {
            existingUser.setPreferredTheme(preferredTheme);
        }
        
        if (notificationPreferences != null) {
            existingUser.setNotificationPreferences(notificationPreferences);
        }
        
        return userRepository.save(existingUser);
    }
    
    @Override
    @Transactional
    public User updateUserPassword(Long userId, String oldPassword, String newPassword) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        // Verify old password
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        
        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        
        return userRepository.save(user);
    }
    
    @Override
    @Transactional
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
    
    @Override
    @Transactional
    public void deactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        user.setActive(false);
        userRepository.save(user);
    }
    
    @Override
    @Transactional
    public void activateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        user.setActive(true);
        userRepository.save(user);
    }
    
    @Override
    @Transactional
    public void assignManager(Long userId, Long managerId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        User manager = userRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found with id: " + managerId));
        
        user.setManager(manager);
        userRepository.save(user);
    }
    
    @Override
    @Transactional
    public void assignDepartment(Long userId, Long departmentId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + departmentId));
        
        user.setDepartment(department);
        userRepository.save(user);
    }
} 