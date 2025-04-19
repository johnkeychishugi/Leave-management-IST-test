import apiClient from './apiClient';
import { User, UpdateProfileRequest, UpdateSettingsRequest, UpdatePasswordRequest } from './types';

export const UserService = {
  // Get all users
  getAllUsers: async (): Promise<User[]> => {
    const { data } = await apiClient.get<User[]>('/users');
    return data;
  },

  // Get all active users
  getAllActiveUsers: async (): Promise<User[]> => {
    const { data } = await apiClient.get<User[]>('/users/active');
    return data;
  },

  // Get all managers
  getAllManagers: async (): Promise<User[]> => {
    const { data } = await apiClient.get<User[]>('/users/managers');
    return data;
  },

  // Get users by department
  getUsersByDepartment: async (departmentId: number): Promise<User[]> => {
    const { data } = await apiClient.get<User[]>(`/users/department/${departmentId}`);
    return data;
  },

  // Get subordinates by manager
  getSubordinates: async (managerId: number): Promise<User[]> => {
    const { data } = await apiClient.get<User[]>(`/users/subordinates/${managerId}`);
    return data;
  },

  // Get user by ID
  getUserById: async (id: number): Promise<User> => {
    const { data } = await apiClient.get<User>(`/users/${id}`);
    return data;
  },

  // Get user by email
  getUserByEmail: async (email: string): Promise<User> => {
    const { data } = await apiClient.get<User>(`/users/email/${email}`);
    return data;
  },

  // Create user
  createUser: async (user: Partial<User>): Promise<User> => {
    const { data } = await apiClient.post<User>('/users', user);
    return data;
  },

  // Update user
  updateUser: async (id: number, user: Partial<User>): Promise<User> => {
    const { data } = await apiClient.put<User>(`/users/${id}`, user);
    return data;
  },

  // Delete user
  deleteUser: async (id: number): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  // Deactivate user
  deactivateUser: async (id: number): Promise<void> => {
    await apiClient.put(`/users/${id}/deactivate`);
  },

  // Activate user
  activateUser: async (id: number): Promise<void> => {
    await apiClient.put(`/users/${id}/activate`);
  },

  // Assign manager to user
  assignManager: async (userId: number, managerId: number): Promise<void> => {
    await apiClient.put(`/users/${userId}/manager/${managerId}`);
  },

  // Assign department to user
  assignDepartment: async (userId: number, departmentId: number): Promise<void> => {
    await apiClient.put(`/users/${userId}/department/${departmentId}`);
  },
  
  // Get current user profile
  getCurrentUserProfile: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/users/me/profile');
    return data;
  },
  
  // Update user profile
  updateUserProfile: async (userId: number, data: UpdateProfileRequest): Promise<User> => {
    const response = await apiClient.put<User>(`/users/${userId}/profile`, data);
    return response.data;
  },
  
  // Update user settings
  updateUserSettings: async (userId: number, data: UpdateSettingsRequest): Promise<User> => {
    const response = await apiClient.put<User>(`/users/${userId}/settings`, data);
    return response.data;
  },
  
  // Update user password
  updateUserPassword: async (userId: number, data: UpdatePasswordRequest): Promise<void> => {
    await apiClient.put(`/users/${userId}/password`, data);
  }
};

export default UserService; 