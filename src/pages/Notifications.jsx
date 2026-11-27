import { useState, useEffect } from "react";
import "./Notifications.css";

function Notifications({ onBack, onUnreadCountChange }) {
  const [notifications, setNotifications] = useState([]);

  // Calculate unread notifications and update the bell count
  useEffect(() => {
    const count = notifications.filter(
      (notification) => notification.unread
    ).length;

    onUnreadCountChange(count);
  }, [notifications, onUnreadCountChange]);

  // Mark all notifications as read
  function markAllAsRead() {
    setNotifications((previousNotifications) =>
      previousNotifications.map((notification) => ({
        ...notification,
        unread: false,
      }))
    );
  }

  // Mark one notification as read
  function markAsRead(id) {
    setNotifications((previousNotifications) =>
      previousNotifications.map((notification) =>
        notification.id === id
          ? { ...notification, unread: false }
          : notification
      )
    );
  }

  // Delete a notification
  function deleteNotification(id) {
    setNotifications((previousNotifications) =>
      previousNotifications.filter(
        (notification) => notification.id !== id
      )
    );
  }

  return (
    <div className="notifications-page">
      <div className="notifications-container">

        {/* Back Arrow */}
        <div className="notifications-header">
          <button
            className="back-button"
            onClick={onBack}
            aria-label="Back to Dashboard"
            title="Back to Dashboard"
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
        </div>

        {/* Notifications Toolbar */}
        <div className="notifications-toolbar">
          <h2>All notifications</h2>

          {notifications.some((notification) => notification.unread) && (
            <button
              className="mark-all-button"
              onClick={markAllAsRead}
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="notifications-list">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-card ${
                  notification.unread ? "unread" : "read"
                }`}
              >
                <div className="notification-icon">
                  <i className="fa-solid fa-bell"></i>
                </div>

                <div className="notification-content">
                  <span className="notification-category">
                    {notification.category}
                  </span>

                  <h3>{notification.title}</h3>

                  <p>{notification.message}</p>

                  <span className="notification-time">
                    {notification.date}
                  </span>
                </div>

                <div className="notification-actions">
                  {notification.unread && (
                    <button
                      className="mark-read-button"
                      onClick={() => markAsRead(notification.id)}
                    >
                      Mark as read
                    </button>
                  )}

                  <button
                    className="delete-button"
                    onClick={() => deleteNotification(notification.id)}
                    aria-label="Delete notification"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-notifications">
              <i className="fa-solid fa-bell-slash"></i>

              <h3>You're all caught up!</h3>

              <p>You don't have any notifications right now.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Notifications;