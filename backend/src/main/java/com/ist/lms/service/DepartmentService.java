package com.ist.lms.service;

import com.ist.lms.model.Department;

import java.util.List;

public interface DepartmentService {
    
    /**
     * Get all departments
     * @return list of all departments
     */
    List<Department> getAllDepartments();
    
    /**
     * Get department by ID
     * @param id department ID
     * @return department if found
     */
    Department getDepartmentById(Long id);
    
    /**
     * Create a new department
     * @param department the department to create
     * @return the created department
     */
    Department createDepartment(Department department);
    
    /**
     * Update an existing department
     * @param id department ID
     * @param departmentDetails updated department details
     * @return the updated department
     */
    Department updateDepartment(Long id, Department departmentDetails);
    
    /**
     * Delete a department
     * @param id department ID
     */
    void deleteDepartment(Long id);
    
    /**
     * Assign a manager to a department
     * @param departmentId department ID
     * @param managerId manager ID
     * @return the updated department
     */
    Department assignManager(Long departmentId, Long managerId);
} 