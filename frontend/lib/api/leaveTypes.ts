import apiClient from './apiClient';
import { LeaveType } from './types';

export const LeaveTypeService = {
  // Get all leave types
  getAllLeaveTypes: async (): Promise<LeaveType[]> => {
    const { data } = await apiClient.get<LeaveType[]>('/leave-types');
    return data;
  },

  // Get leave type by ID
  getLeaveTypeById: async (id: number): Promise<LeaveType> => {
    const { data } = await apiClient.get<LeaveType>(`/leave-types/${id}`);
    return data;
  },

  // Create leave type
  createLeaveType: async (leaveType: Partial<LeaveType>): Promise<LeaveType> => {
    const { data } = await apiClient.post<LeaveType>('/leave-types', leaveType);
    return data;
  },

  // Update leave type
  updateLeaveType: async (id: number, leaveType: Partial<LeaveType>): Promise<LeaveType> => {
    const { data } = await apiClient.put<LeaveType>(`/leave-types/${id}`, leaveType);
    return data;
  },

  // Delete leave type
  deleteLeaveType: async (id: number): Promise<void> => {
    await apiClient.delete(`/leave-types/${id}`);
  }
};

export default LeaveTypeService; 