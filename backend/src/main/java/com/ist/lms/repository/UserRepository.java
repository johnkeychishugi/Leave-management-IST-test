package com.ist.lms.repository;

import com.ist.lms.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    
    Boolean existsByEmail(String email);
    
    Optional<User> findByMicrosoftId(String microsoftId);
    
    List<User> findByDepartmentId(Long departmentId);
    
    List<User> findByManagerId(Long managerId);
    
    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = 'ROLE_MANAGER'")
    List<User> findAllManagers();
    
    @Query("SELECT u FROM User u WHERE u.active = true")
    List<User> findAllActiveUsers();
    
    /**
     * Find user by email and eagerly fetch roles
     *
     * @param email the user's email
     * @return the user with roles eagerly loaded
     */
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.roles WHERE u.email = :email")
    Optional<User> findByEmailWithRoles(String email);
} 