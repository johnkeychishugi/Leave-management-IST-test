package com.ist.lms.repository;

import com.ist.lms.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    /**
     * Find all notifications for a user
     * @param userId the user ID
     * @return list of notifications
     */
    List<Notification> findByUser_IdOrderByCreatedAtDesc(Long userId);
    
    /**
     * Find all unread notifications for a user
     * @param userId the user ID
     * @return list of unread notifications
     */
    List<Notification> findByUser_IdAndReadFalseOrderByCreatedAtDesc(Long userId);
    
    /**
     * Count unread notifications for a user
     * @param userId the user ID
     * @return count of unread notifications
     */
    long countByUser_IdAndReadFalse(Long userId);
    
    /**
     * Mark a notification as read
     * @param id notification ID
     */
    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.id = :id")
    void markAsRead(@Param("id") Long id);
    
    /**
     * Mark all notifications as read for a user
     * @param userId the user ID
     */
    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.user.id = :userId")
    void markAllAsRead(@Param("userId") Long userId);
} 