'use client';

import React, { useState } from 'react';
import { FiBell, FiCheck, FiTrash2 } from 'react-icons/fi';
import { useNotifications } from '../../lib/context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { NotificationType } from '../../lib/api/types';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead,
    deleteNotification 
  } = useNotifications();

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await markAsRead(id);
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteNotification(id);
  };

  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await markAllAsRead();
  };

  const getNotificationTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'LEAVE_REQUEST':
        return '📝';
      case 'LEAVE_APPROVAL':
        return '✅';
      case 'LEAVE_REJECTION':
        return '❌';
      case 'LEAVE_CANCELLATION':
        return '🚫';
      case 'BALANCE_UPDATE':
        return '💰';
      default:
        return '📣';
    }
  };

  return (
    <div className="relative">
      <button 
        className="relative p-2 text-gray-500 hover:text-indigo-600 transition-colors rounded-full hover:bg-gray-100"
        onClick={toggleNotifications}
        aria-label="Notifications"
      >
        <FiBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100">
            <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
            {notifications.length > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                <FiCheck size={12} className="mr-1" />
                Mark all as read
              </button>
            )}
          </div>

          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No notifications</div>
          ) : (
            <div>
              {notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-2">
                      <div className="text-xl leading-none">
                        {getNotificationTypeIcon(notification.type)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                        {notification.actionUrl && (
                          <a 
                            href={notification.actionUrl} 
                            className="text-xs text-indigo-600 hover:text-indigo-800 mt-1 inline-block"
                          >
                            {notification.actionText || 'View'}
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      {!notification.read && (
                        <button 
                          onClick={(e) => handleMarkAsRead(notification.id, e)} 
                          className="text-gray-400 hover:text-indigo-600 p-1"
                          title="Mark as read"
                        >
                          <FiCheck size={14} />
                        </button>
                      )}
                      <button 
                        onClick={(e) => handleDelete(notification.id, e)} 
                        className="text-gray-400 hover:text-red-600 p-1"
                        title="Delete"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 