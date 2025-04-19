import apiClient from './apiClient';
import { LeaveBalance } from './types';

export const LeaveBalanceService = {
  // Get all leave balances
  getAllLeaveBalances: async (): Promise<LeaveBalance[]> => {
    const { data } = await apiClient.get<LeaveBalance[]>('/leave-balances');
    return data;
  },

  // Get leave balances by user ID
  getLeaveBalancesByUserId: async (userId: number): Promise<LeaveBalance[]> => {
    const { data } = await apiClient.get<LeaveBalance[]>(`/leave-balances/user/${userId}`);
    return data;
  },

  // Get leave balances by user ID and year
  getLeaveBalancesByUserIdAndYear: async (userId: number, year: number): Promise<LeaveBalance[]> => {
    const { data } = await apiClient.get<LeaveBalance[]>(`/leave-balances/user/${userId}/year/${year}`);
    return data;
  },

  // Get specific leave balance by user ID, leave type ID, and year
  getLeaveBalance: async (userId: number, leaveTypeId: number, year: number): Promise<LeaveBalance> => {
    const { data } = await apiClient.get<LeaveBalance>(`/leave-balances/user/${userId}/type/${leaveTypeId}/year/${year}`);
    return data;
  },

  // Get leave balance by ID
  getLeaveBalanceById: async (id: number): Promise<LeaveBalance> => {
    const { data } = await apiClient.get<LeaveBalance>(`/leave-balances/${id}`);
    return data;
  },

  // Create leave balance
  createLeaveBalance: async (leaveBalance: Partial<LeaveBalance>): Promise<LeaveBalance> => {
    const { data } = await apiClient.post<LeaveBalance>('/leave-balances', leaveBalance);
    return data;
  },

  // Update leave balance
  updateLeaveBalance: async (id: number, leaveBalance: Partial<LeaveBalance>): Promise<LeaveBalance> => {
    const { data } = await apiClient.put<LeaveBalance>(`/leave-balances/${id}`, leaveBalance);
    return data;
  },

  // Delete leave balance
  deleteLeaveBalance: async (id: number): Promise<void> => {
    await apiClient.delete(`/leave-balances/${id}`);
  },

  // Adjust leave balance
  adjustLeaveBalance: async (id: number, days: number, reason: string): Promise<LeaveBalance> => {
    const { data } = await apiClient.put<LeaveBalance>(`/leave-balances/${id}/adjust`, {
      days,
      reason
    });
    return data;
  },

  // Reset all leave balances for a specific year
  resetAllLeaveBalances: async (year: number): Promise<void> => {
    await apiClient.post('/leave-balances/reset-all', { year });
  }
};

export default LeaveBalanceService; 