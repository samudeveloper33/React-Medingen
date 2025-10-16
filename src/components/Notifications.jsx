import React, { useState } from 'react';
import './Notifications.css';

const Notifications = ({ onClose }) => {
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New Medicines Added",
      message: "5 new medicines have been added to your comparison list. Check them out now!",
      type: "info",
      time: "2 minutes ago",
      read: false,
      icon: "🆕",
      action: "View List"
    },
    {
      id: 2,
      title: "Price Drop Alert",
      message: "Great news! Paracetamol 650mg price dropped by 15%. Now available at ₹30.",
      type: "success",
      time: "1 hour ago",
      read: false,
      icon: "📉",
      action: "Buy Now"
    },
    {
      id: 3,
      title: "Prescription Ready",
      message: "Your prescription for Diabetes medicines is ready for pickup at our Koramangala store.",
      type: "info",
      time: "3 hours ago",
      read: true,
      icon: "📋",
      action: "Track Order"
    },
    {
      id: 4,
      title: "Medicine Reminder",
      message: "Time to take your evening vitamins! Don't forget your Vitamin D3 supplement.",
      type: "reminder",
      time: "5 hours ago",
      read: false,
      icon: "⏰",
      action: "Mark Done"
    },
    {
      id: 5,
      title: "Order Delivered",
      message: "Your order #MD12345 has been delivered successfully. Thank you for choosing Medingen!",
      type: "success",
      time: "1 day ago",
      read: true,
      icon: "✅",
      action: "Rate Order"
    },
    {
      id: 6,
      title: "Exclusive Offer",
      message: "Limited time: Get 25% off on all health supplements. Use code HEALTH25.",
      type: "offer",
      time: "2 days ago",
      read: false,
      icon: "🎁",
      action: "Use Offer"
    },
    {
      id: 7,
      title: "Low Stock Alert",
      message: "Your regular medicine Metformin 500mg is running low. Reorder now to avoid running out.",
      type: "warning",
      time: "3 days ago",
      read: true,
      icon: "⚠️",
      action: "Reorder"
    },
    {
      id: 8,
      title: "Health Tip",
      message: "Stay hydrated! Drink at least 8 glasses of water daily for better health.",
      type: "tip",
      time: "1 week ago",
      read: true,
      icon: "💡",
      action: "Learn More"
    }
  ]);

  const filters = [
    { id: 'all', name: 'All', icon: '📋', count: notifications.length },
    { id: 'unread', name: 'Unread', icon: '🔴', count: notifications.filter(n => !n.read).length },
    { id: 'info', name: 'Updates', icon: 'ℹ️', count: notifications.filter(n => n.type === 'info').length },
    { id: 'success', name: 'Success', icon: '✅', count: notifications.filter(n => n.type === 'success').length },
    { id: 'offer', name: 'Offers', icon: '🎁', count: notifications.filter(n => n.type === 'offer').length },
    { id: 'reminder', name: 'Reminders', icon: '⏰', count: notifications.filter(n => n.type === 'reminder').length }
  ];

  const getFilteredNotifications = () => {
    switch(filter) {
      case 'unread':
        return notifications.filter(n => !n.read);
      case 'info':
      case 'success':
      case 'offer':
      case 'reminder':
      case 'warning':
      case 'tip':
        return notifications.filter(n => n.type === filter);
      default:
        return notifications;
    }
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getNotificationTypeClass = (type) => {
    const typeClasses = {
      info: 'notification-item--info',
      success: 'notification-item--success',
      warning: 'notification-item--warning',
      offer: 'notification-item--offer',
      reminder: 'notification-item--reminder',
      tip: 'notification-item--tip'
    };
    return typeClasses[type] || 'notification-item--info';
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="notifications-modal">
      <div className="notifications-modal__overlay" onClick={onClose}></div>
      <div className="notifications-modal__content">
        {/* Header */}
        <div className="notifications-header">
          <div className="notifications-header__title">
            <h2>🔔 Notifications</h2>
            <p>{unreadCount} unread notifications</p>
          </div>
          <div className="notifications-header__actions">
            {unreadCount > 0 && (
              <button 
                className="notifications-header__mark-all"
                onClick={markAllAsRead}
              >
                Mark all as read
              </button>
            )}
            <button className="notifications-header__close" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="notifications-filters">
          {filters.map(filterItem => (
            <button
              key={filterItem.id}
              className={`notifications-filter ${filter === filterItem.id ? 'notifications-filter--active' : ''}`}
              onClick={() => setFilter(filterItem.id)}
            >
              <span className="notifications-filter__icon">{filterItem.icon}</span>
              <span className="notifications-filter__name">{filterItem.name}</span>
              {filterItem.count > 0 && (
                <span className="notifications-filter__count">{filterItem.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="notifications-list">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map(notification => (
              <div 
                key={notification.id} 
                className={`notification-item ${getNotificationTypeClass(notification.type)} ${!notification.read ? 'notification-item--unread' : ''}`}
              >
                <div className="notification-item__icon">
                  {notification.icon}
                </div>
                
                <div className="notification-item__content">
                  <div className="notification-item__header">
                    <h3 className="notification-item__title">{notification.title}</h3>
                    <span className="notification-item__time">{notification.time}</span>
                  </div>
                  
                  <p className="notification-item__message">{notification.message}</p>
                  
                  <div className="notification-item__actions">
                    <button className="notification-item__action-btn">
                      {notification.action}
                    </button>
                    {!notification.read && (
                      <button 
                        className="notification-item__mark-read"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>

                <div className="notification-item__menu">
                  <button 
                    className="notification-item__delete"
                    onClick={() => deleteNotification(notification.id)}
                    title="Delete notification"
                  >
                    🗑️
                  </button>
                </div>

                {!notification.read && (
                  <div className="notification-item__unread-indicator"></div>
                )}
              </div>
            ))
          ) : (
            <div className="notifications-empty">
              <div className="notifications-empty__icon">📭</div>
              <h3>No notifications</h3>
              <p>No notifications found for the selected filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
