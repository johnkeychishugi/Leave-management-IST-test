import apiClient from './apiClient';
import { LeaveApplication, LeaveStatus } from './types';

export const LeaveApplicationService = {
  // Get all leave applications
  getAllLeaveApplications: async (status?: LeaveStatus): Promise<LeaveApplication[]> => {
    const { data } = await apiClient.get<LeaveApplication[]>('/leave-applications', {
      params: status ? { status } : undefined
    });
    return data;
  },

  // Get leave applications by user ID
  getLeaveApplicationsByUserId: async (userId: number): Promise<LeaveApplication[]> => {
    const { data } = await apiClient.get<LeaveApplication[]>(`/leave-applications/user/${userId}`);
    return data;
  },

  // Get leave applications by user ID and status
  getLeaveApplicationsByUserIdAndStatus: async (userId: number, status: LeaveStatus): Promise<LeaveApplication[]> => {
    const { data } = await apiClient.get<LeaveApplication[]>(`/leave-applications/user/${userId}/status/${status}`);
    return data;
  },

  // Get overlapping leaves
  getOverlappingLeaves: async (userId: number, startDate: string, endDate: string): Promise<LeaveApplication[]> => {
    const { data } = await apiClient.get<LeaveApplication[]>('/leave-applications/overlapping', {
      params: {
        userId,
        startDate,
        endDate
      }
    });
    return data;
  },

  // Get all leaves in date range
  getAllLeavesInDateRange: async (startDate: string, endDate: string): Promise<LeaveApplication[]> => {
    const { data } = await apiClient.get<LeaveApplication[]>('/leave-applications/date-range', {
      params: {
        startDate,
        endDate
      }
    });
    return data;
  },

  // Get department leaves in date range
  getDepartmentLeavesInDateRange: async (departmentId: number, startDate: string, endDate: string): Promise<LeaveApplication[]> => {
    const { data } = await apiClient.get<LeaveApplication[]>(`/leave-applications/department/${departmentId}/date-range`, {
      params: {
        startDate,
        endDate
      }
    });
    return data;
  },

  // Get pending approvals by approver ID
  getPendingApprovalsByApproverId: async (approverId: number): Promise<LeaveApplication[]> => {
    const { data } = await apiClient.get<LeaveApplication[]>(`/leave-applications/pending-approvals/${approverId}`);
    return data;
  },

  // Get leave application by ID
  getLeaveApplicationById: async (id: number): Promise<LeaveApplication> => {
    const { data } = await apiClient.get<LeaveApplication>(`/leave-applications/${id}`);
    return data;
  },

  // Create leave application
  createLeaveApplication: async (leaveApplication: Partial<LeaveApplication>): Promise<LeaveApplication> => {
    const { data } = await apiClient.post<LeaveApplication>('/leave-applications', leaveApplication);
    return data;
  },

  // Update leave application
  updateLeaveApplication: async (id: number, leaveApplication: Partial<LeaveApplication>): Promise<LeaveApplication> => {
    const { data } = await apiClient.put<LeaveApplication>(`/leave-applications/${id}`, leaveApplication);
    return data;
  },

  // Update leave status
  updateLeaveStatus: async (id: number, status: LeaveStatus, reason?: string): Promise<LeaveApplication> => {
    const { data } = await apiClient.put<LeaveApplication>(`/leave-applications/${id}/status`, {
      status,
      reason
    });
    return data;
  },

  // Approve leave application
  approveLeaveApplication: async (id: number, comments?: string): Promise<LeaveApplication> => {
    const { data } = await apiClient.put<LeaveApplication>(`/leave-applications/${id}/status`, {
      status: LeaveStatus.APPROVED,
      reason: comments || 'Approved'
    });
    return data;
  },

  // Reject leave application
  rejectLeaveApplication: async (id: number, comments: string): Promise<LeaveApplication> => {
    const { data } = await apiClient.put<LeaveApplication>(`/leave-applications/${id}/status`, {
      status: LeaveStatus.REJECTED,
      reason: comments || 'Rejected'
    });
    return data;
  },

  // Cancel leave application
  cancelLeaveApplication: async (id: number, reason: string): Promise<LeaveApplication> => {
    const { data } = await apiClient.put<LeaveApplication>(`/leave-applications/${id}/cancel`, {
      reason
    });
    return data;
  },

  // Delete leave application
  deleteLeaveApplication: async (id: number): Promise<void> => {
    await apiClient.delete(`/leave-applications/${id}`);
  },

  // Calculate business days
  calculateBusinessDays: async (startDate: string, endDate: string): Promise<number> => {
    const { data } = await apiClient.get<number>('/leave-applications/calculate-days', {
      params: {
        startDate,
        endDate
      }
    });
    return data;
  },

  // Check leave balance availability
  checkLeaveBalanceAvailability: async (
    userId: number,
    leaveTypeId: number,
    startDate: string,
    endDate: string
  ): Promise<boolean> => {
    const { data } = await apiClient.get<boolean>('/leave-applications/check-balance', {
      params: {
        userId,
        leaveTypeId,
        startDate,
        endDate
      }
    });
    return data;
  }
};

export default LeaveApplicationService; 