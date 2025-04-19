package com.ist.lms.controller;

import com.ist.lms.model.Department;
import com.ist.lms.payload.request.DepartmentRequest;
import com.ist.lms.service.DepartmentService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/departments")
public class DepartmentController {
    
    private static final Logger logger = LoggerFactory.getLogger(DepartmentController.class);
    
    private final DepartmentService departmentService;
    
    @Autowired
    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }
    
    /**
     * Get all departments
     * @return list of all departments
     */
    @GetMapping
    public ResponseEntity<List<Department>> getAllDepartments() {
        logger.debug("REST request to get all departments");
        
        List<Department> departments = departmentService.getAllDepartments();
        return ResponseEntity.ok(departments);
    }
    
    /**
     * Get a department by ID
     * @param id department ID
     * @return the department
     */
    @GetMapping("/{id}")
    public ResponseEntity<Department> getDepartmentById(@PathVariable Long id) {
        logger.debug("REST request to get department with ID: {}", id);
        
        Department department = departmentService.getDepartmentById(id);
        return ResponseEntity.ok(department);
    }
    
    /**
     * Create a new department
     * @param departmentRequest the department data
     * @return the created department
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<Department> createDepartment(
            @Valid @RequestBody DepartmentRequest departmentRequest) {
        
        logger.debug("REST request to create department: {}", departmentRequest);
        
        // Create a new department using constructor instead of builder
        Department department = new Department();
        department.setName(departmentRequest.getName());
        department.setDescription(departmentRequest.getDescription());
        
        Department createdDepartment = departmentService.createDepartment(department);
        
        // If manager ID is provided, assign the manager
        if (departmentRequest.getManagerId() != null) {
            createdDepartment = departmentService.assignManager(
                    createdDepartment.getId(), 
                    departmentRequest.getManagerId());
        }
        
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdDepartment);
    }
    
    /**
     * Update a department
     * @param id department ID
     * @param departmentRequest the updated department data
     * @return the updated department
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<Department> updateDepartment(
            @PathVariable Long id,
            @Valid @RequestBody DepartmentRequest departmentRequest) {
        
        logger.debug("REST request to update department with ID: {}", id);
        
        // Create a department using constructor instead of builder
        Department department = new Department();
        department.setName(departmentRequest.getName());
        department.setDescription(departmentRequest.getDescription());
        
        Department updatedDepartment = departmentService.updateDepartment(id, department);
        
        // If manager ID is provided, assign the manager
        if (departmentRequest.getManagerId() != null) {
            updatedDepartment = departmentService.assignManager(id, departmentRequest.getManagerId());
        }
        
        return ResponseEntity.ok(updatedDepartment);
    }
    
    /**
     * Delete a department
     * @param id department ID
     * @return no content
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDepartment(@PathVariable Long id) {
        logger.debug("REST request to delete department with ID: {}", id);
        
        departmentService.deleteDepartment(id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Assign a manager to a department
     * @param departmentId department ID
     * @param managerId manager ID
     * @return the updated department
     */
    @PutMapping("/{departmentId}/manager/{managerId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<Department> assignManagerToDepartment(
            @PathVariable Long departmentId,
            @PathVariable Long managerId) {
        
        logger.debug("REST request to assign manager with ID: {} to department with ID: {}", 
                managerId, departmentId);
        
        Department department = departmentService.assignManager(departmentId, managerId);
        return ResponseEntity.ok(department);
    }
} 