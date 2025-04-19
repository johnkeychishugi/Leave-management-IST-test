package com.ist.lms.service;

import com.ist.lms.model.Notification;
import com.ist.lms.model.User;
import com.ist.lms.model.enums.NotificationType;

import java.util.List;

public interface NotificationService {
    
    /**
     * Create a notification for a user
     * 
     * @param user the recipient user
     * @param title the notification title
     * @param message the notification message
     * @param type the notification type
     * @param actionUrl optional URL for the notification action
     * @param actionText optional text for the action button
     * @return the created notification
     */
    Notification createNotification(User user, String title, String message, NotificationType type,
                                  String actionUrl, String actionText);
    
    /**
     * Get all notifications for a user
     * 
     * @param userId the user ID
     * @return list of notifications
     */
    List<Notification> getUserNotifications(Long userId);
    
    /**
     * Get unread notifications for a user
     * 
     * @param userId the user ID
     * @return list of unread notifications
     */
    List<Notification> getUnreadNotifications(Long userId);
    
    /**
     * Count unread notifications for a user
     * 
     * @param userId the user ID
     * @return count of unread notifications
     */
    long countUnreadNotifications(Long userId);
    
    /**
     * Mark a notification as read
     * 
     * @param notificationId the notification ID
     * @param userId the user ID (for security check)
     * @return true if successful
     */
    boolean markAsRead(Long notificationId, Long userId);
    
    /**
     * Mark all notifications as read for a user
     * 
     * @param userId the user ID
     * @return true if successful
     */
    boolean markAllAsRead(Long userId);
    
    /**
     * Delete a notification
     * 
     * @param notificationId the notification ID
     * @param userId the user ID (for security check)
     * @return true if successful
     */
    boolean deleteNotification(Long notificationId, Long userId);
} 