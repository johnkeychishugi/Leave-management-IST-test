package com.ist.lms.service.impl;

import com.ist.lms.model.Notification;
import com.ist.lms.model.User;
import com.ist.lms.model.enums.NotificationType;
import com.ist.lms.repository.NotificationRepository;
import com.ist.lms.repository.UserRepository;
import com.ist.lms.security.SecurityService;
import com.ist.lms.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class NotificationServiceImpl implements NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationServiceImpl.class);
    
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SecurityService securityService;
    
    @Autowired
    public NotificationServiceImpl(
            NotificationRepository notificationRepository,
            UserRepository userRepository,
            SecurityService securityService) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.securityService = securityService;
    }
    
    @Override
    @Transactional
    public Notification createNotification(User user, String title, String message, NotificationType type,
                                         String actionUrl, String actionText) {
        logger.debug("Creating notification for user {}: {}", user.getId(), title);
        
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .read(false)
                .actionUrl(actionUrl)
                .actionText(actionText)
                .build();
        
        return notificationRepository.save(notification);
    }
    
    @Override
    public List<Notification> getUserNotifications(Long userId) {
        logger.debug("Getting all notifications for user {}", userId);
        return notificationRepository.findByUser_IdOrderByCreatedAtDesc(userId);
    }
    
    @Override
    public List<Notification> getUnreadNotifications(Long userId) {
        logger.debug("Getting unread notifications for user {}", userId);
        return notificationRepository.findByUser_IdAndReadFalseOrderByCreatedAtDesc(userId);
    }
    
    @Override
    public long countUnreadNotifications(Long userId) {
        logger.debug("Counting unread notifications for user {}", userId);
        return notificationRepository.countByUser_IdAndReadFalse(userId);
    }
    
    @Override
    @Transactional
    public boolean markAsRead(Long notificationId, Long userId) {
        logger.debug("Marking notification {} as read for user {}", notificationId, userId);
        
        Optional<Notification> notification = notificationRepository.findById(notificationId);
        
        if (notification.isPresent()) {
            // Security check - ensure the notification belongs to the user
            if (!notification.get().getUser().getId().equals(userId)) {
                logger.warn("User {} attempted to mark notification {} as read, but it belongs to user {}",
                        userId, notificationId, notification.get().getUser().getId());
                return false;
            }
            
            notificationRepository.markAsRead(notificationId);
            return true;
        }
        
        return false;
    }
    
    @Override
    @Transactional
    public boolean markAllAsRead(Long userId) {
        logger.debug("Marking all notifications as read for user {}", userId);
        
        // Verify user exists
        if (!userRepository.existsById(userId)) {
            return false;
        }
        
        notificationRepository.markAllAsRead(userId);
        return true;
    }
    
    @Override
    @Transactional
    public boolean deleteNotification(Long notificationId, Long userId) {
        logger.debug("Deleting notification {} for user {}", notificationId, userId);
        
        Optional<Notification> notification = notificationRepository.findById(notificationId);
        
        if (notification.isPresent()) {
            // Security check - ensure the notification belongs to the user
            if (!notification.get().getUser().getId().equals(userId)) {
                logger.warn("User {} attempted to delete notification {} that belongs to user {}",
                        userId, notificationId, notification.get().getUser().getId());
                return false;
            }
            
            notificationRepository.deleteById(notificationId);
            return true;
        }
        
        return false;
    }
} 