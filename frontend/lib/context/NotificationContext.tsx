'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Notification } from '../api/types';
import { NotificationService } from '../api/notifications';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: number) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const { isAuthenticated, user } = useAuth();

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    
    try {
      console.log('Fetching notifications for user...');
      setLoading(true);
      const [allNotifications, count] = await Promise.all([
        NotificationService.getAllNotifications(),
        NotificationService.getUnreadCount()
      ]);
      
      console.log(`Received ${allNotifications.length} notifications, ${count} unread`);
      setNotifications(allNotifications);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const success = await NotificationService.markAsRead(notificationId);
      
      if (success) {
        setNotifications(notifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      const success = await NotificationService.markAllAsRead();
      
      if (success) {
        setNotifications(notifications.map(notification => ({ ...notification, read: true })));
        setUnreadCount(0);
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      const success = await NotificationService.deleteNotification(notificationId);
      
      if (success) {
        const deleted = notifications.find(n => n.id === notificationId);
        setNotifications(notifications.filter(n => n.id !== notificationId));
        
        if (deleted && !deleted.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        
        toast.success('Notification deleted');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  // Fetch notifications when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    } else {
      // Clear notifications when logged out
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, user?.id]);

  // Poll for new notifications every minute only when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    
    console.log('Setting up notification polling interval');
    const interval = setInterval(() => {
      fetchNotifications();
    }, 60000); // 1 minute
    
    return () => {
      console.log('Clearing notification polling interval');
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 