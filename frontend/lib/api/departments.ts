import apiClient from './apiClient';
import { Department } from './types';

export const DepartmentService = {
  // Get all departments
  getAllDepartments: async (): Promise<Department[]> => {
    const { data } = await apiClient.get<Department[]>('/departments');
    return data;
  },

  // Get department by ID
  getDepartmentById: async (id: number): Promise<Department> => {
    const { data } = await apiClient.get<Department>(`/departments/${id}`);
    return data;
  },

  // Create department
  createDepartment: async (department: Partial<Department>): Promise<Department> => {
    const { data } = await apiClient.post<Department>('/departments', department);
    return data;
  },

  // Update department
  updateDepartment: async (id: number, department: Partial<Department>): Promise<Department> => {
    const { data } = await apiClient.put<Department>(`/departments/${id}`, department);
    return data;
  },

  // Delete department
  deleteDepartment: async (id: number): Promise<void> => {
    await apiClient.delete(`/departments/${id}`);
  },

  // Assign manager to department
  assignManager: async (departmentId: number, managerId: number): Promise<void> => {
    await apiClient.put(`/departments/${departmentId}/manager/${managerId}`);
  }
};

export default DepartmentService; 