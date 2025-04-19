package com.ist.lms.controller;

import com.ist.lms.model.Notification;
import com.ist.lms.security.SecurityService;
import com.ist.lms.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private static final Logger logger = LoggerFactory.getLogger(NotificationController.class);
    
    private final NotificationService notificationService;
    private final SecurityService securityService;
    
    @Autowired
    public NotificationController(NotificationService notificationService, SecurityService securityService) {
        this.notificationService = notificationService;
        this.securityService = securityService;
    }
    
    /**
     * Get all notifications for the current user
     * @return ResponseEntity with the list of notifications
     */
    @GetMapping
    public ResponseEntity<List<Notification>> getUserNotifications() {
        logger.debug("REST request to get notifications for current user");
        
        return securityService.getCurrentUser()
                .map(user -> {
                    List<Notification> notifications = notificationService.getUserNotifications(user.getId());
                    return ResponseEntity.ok(notifications);
                })
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }
    
    /**
     * Get unread notifications for the current user
     * @return ResponseEntity with the list of unread notifications
     */
    @GetMapping("/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications() {
        logger.debug("REST request to get unread notifications for current user");
        
        return securityService.getCurrentUser()
                .map(user -> {
                    List<Notification> notifications = notificationService.getUnreadNotifications(user.getId());
                    return ResponseEntity.ok(notifications);
                })
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }
    
    /**
     * Get the count of unread notifications for the current user
     * @return ResponseEntity with the count
     */
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        logger.debug("REST request to get unread notification count for current user");
        
        return securityService.getCurrentUser()
                .map(user -> {
                    long count = notificationService.countUnreadNotifications(user.getId());
                    Map<String, Long> response = new HashMap<>();
                    response.put("count", count);
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }
    
    /**
     * Mark a notification as read
     * @param id notification ID
     * @return ResponseEntity with success status
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<Map<String, Boolean>> markAsRead(@PathVariable Long id) {
        logger.debug("REST request to mark notification {} as read", id);
        
        return securityService.getCurrentUser()
                .map(user -> {
                    boolean success = notificationService.markAsRead(id, user.getId());
                    Map<String, Boolean> response = new HashMap<>();
                    response.put("success", success);
                    
                    if (success) {
                        return ResponseEntity.ok(response);
                    } else {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
                    }
                })
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }
    
    /**
     * Mark all notifications as read for the current user
     * @return ResponseEntity with success status
     */
    @PutMapping("/read-all")
    public ResponseEntity<Map<String, Boolean>> markAllAsRead() {
        logger.debug("REST request to mark all notifications as read for current user");
        
        return securityService.getCurrentUser()
                .map(user -> {
                    boolean success = notificationService.markAllAsRead(user.getId());
                    Map<String, Boolean> response = new HashMap<>();
                    response.put("success", success);
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }
    
    /**
     * Delete a notification
     * @param id notification ID
     * @return ResponseEntity with success status
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Boolean>> deleteNotification(@PathVariable Long id) {
        logger.debug("REST request to delete notification {}", id);
        
        return securityService.getCurrentUser()
                .map(user -> {
                    boolean success = notificationService.deleteNotification(id, user.getId());
                    Map<String, Boolean> response = new HashMap<>();
                    response.put("success", success);
                    
                    if (success) {
                        return ResponseEntity.ok(response);
                    } else {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
                    }
                })
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }
} 