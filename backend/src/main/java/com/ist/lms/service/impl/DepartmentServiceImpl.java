package com.ist.lms.service.impl;

import com.ist.lms.exception.ResourceNotFoundException;
import com.ist.lms.model.Department;
import com.ist.lms.model.User;
import com.ist.lms.repository.DepartmentRepository;
import com.ist.lms.repository.UserRepository;
import com.ist.lms.service.DepartmentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DepartmentServiceImpl implements DepartmentService {

    private static final Logger logger = LoggerFactory.getLogger(DepartmentServiceImpl.class);
    
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;

    @Autowired
    public DepartmentServiceImpl(DepartmentRepository departmentRepository, UserRepository userRepository) {
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<Department> getAllDepartments() {
        logger.debug("Getting all departments");
        return departmentRepository.findAll();
    }

    @Override
    public Department getDepartmentById(Long id) {
        logger.debug("Getting department with ID: {}", id);
        return departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
    }

    @Override
    @Transactional
    public Department createDepartment(Department department) {
        logger.debug("Creating new department: {}", department.getName());
        
        if (departmentRepository.existsByName(department.getName())) {
            logger.error("Department with name '{}' already exists", department.getName());
            throw new IllegalArgumentException("Department with this name already exists");
        }
        
        return departmentRepository.save(department);
    }

    @Override
    @Transactional
    public Department updateDepartment(Long id, Department departmentDetails) {
        logger.debug("Updating department with ID: {}", id);
        
        Department department = getDepartmentById(id);
        
        // Check if the name is being changed and if the new name already exists
        if (!department.getName().equals(departmentDetails.getName()) && 
                departmentRepository.existsByName(departmentDetails.getName())) {
            logger.error("Department with name '{}' already exists", departmentDetails.getName());
            throw new IllegalArgumentException("Department with this name already exists");
        }
        
        department.setName(departmentDetails.getName());
        department.setDescription(departmentDetails.getDescription());
        
        return departmentRepository.save(department);
    }

    @Override
    @Transactional
    public void deleteDepartment(Long id) {
        logger.debug("Deleting department with ID: {}", id);
        
        Department department = getDepartmentById(id);
        
        // Check if there are users in this department
        if (!department.getUsers().isEmpty()) {
            logger.error("Cannot delete department with ID {} as it has users assigned", id);
            throw new IllegalStateException("Cannot delete department that has users assigned to it");
        }
        
        departmentRepository.delete(department);
    }

    @Override
    @Transactional
    public Department assignManager(Long departmentId, Long managerId) {
        logger.debug("Assigning manager with ID: {} to department with ID: {}", managerId, departmentId);
        
        Department department = getDepartmentById(departmentId);
        User manager = userRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + managerId));
        
        department.setManager(manager);
        return departmentRepository.save(department);
    }
} 