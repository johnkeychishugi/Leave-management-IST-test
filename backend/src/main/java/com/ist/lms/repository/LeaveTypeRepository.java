package com.ist.lms.repository;

import com.ist.lms.model.LeaveType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeaveTypeRepository extends JpaRepository<LeaveType, Long> {
    Optional<LeaveType> findByName(String name);
    
    boolean existsByName(String name);
    
    @Query("SELECT lt FROM LeaveType lt WHERE lt.active = true")
    List<LeaveType> findAllActive();
} 