import apiClient from './apiClient';
import { Notification } from './types';

export const NotificationService = {
  // Get all notifications
  getAllNotifications: async (): Promise<Notification[]> => {
    const { data } = await apiClient.get<Notification[]>('/notifications');
    return data;
  },

  // Get unread notifications
  getUnreadNotifications: async (): Promise<Notification[]> => {
    const { data } = await apiClient.get<Notification[]>('/notifications/unread');
    return data;
  },

  // Get count of unread notifications
  getUnreadCount: async (): Promise<number> => {
    const { data } = await apiClient.get<{ count: number }>('/notifications/count');
    return data.count;
  },

  // Mark a notification as read
  markAsRead: async (notificationId: number): Promise<boolean> => {
    const { data } = await apiClient.put<{ success: boolean }>(`/notifications/${notificationId}/read`);
    return data.success;
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<boolean> => {
    const { data } = await apiClient.put<{ success: boolean }>('/notifications/read-all');
    return data.success;
  },

  // Delete a notification
  deleteNotification: async (notificationId: number): Promise<boolean> => {
    const { data } = await apiClient.delete<{ success: boolean }>(`/notifications/${notificationId}`);
    return data.success;
  }
}; 