
import React, { useState } from "react";
import "./Notifications.css";

const initialNotifications = [
  {
    id: 1,
    category: "Appointment",
    title: "Upcoming prenatal checkup",
    message: "Your prenatal checkup at Kigali Health Center is scheduled for December 5, 2026, at 9:00 AM.",
    time: "Today",
    icon: "fa-calendar-days",
    unread: true,
  },
  {
    id: 2,
    category: "Health",
    title: "Your weekly pregnancy reminder",
    message: "Remember to stay hydrated, eat balanced meals, and get enough rest.",
    time: "Yesterday",
    icon: "fa-heart-pulse",
    unread: true,
  },
  {
    id: 3,
    category: "Learning",
    title: "Continue your learning journey",
    message: "You have lessons remaining on birth preparation and postpartum care.",
    time: "2 days ago",
    icon: "fa-graduation-cap",
    unread: false,
  },
];

function Notifications({ onBack }) {
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length;

  function markAllAsRead() {
    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        unread: false,
      }))
    );
  }

  function markAsRead(id) {
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === id
          ? { ...notification, unread: false }
          : notification
      )
    );
  }

  function deleteNotification(id) {
    setNotifications((previous) =>
      previous.filter((notification) => notification.id !== id)
    );
  }

  return (
    <div className="notifications-page">
      <div className="notifications-container">
        <div className="notifications-header">
          <button className="back-button" onClick={onBack}>
            <i className="fa-solid fa-arrow-left"></i>
            Back to Dashboard
          </button>

          <div className="notifications-heading">
            <div>
              <span className="notifications-label">YOUR UPDATES</span>
              <h1>Notifications</h1>
              <p>Stay updated with reminders and important information.</p>
            </div>

            <div className="notification-total">
              <i className="fa-regular fa-bell"></i>
              <span>{unreadCount} unread</span>
            </div>
          </div>
        </div>

        <div className="notifications-toolbar">
          <h2>All notifications</h2>

          <button
            className="mark-all-button"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <i className="fa-solid fa-check-double"></i>
            Mark all as read
          </button>
        </div>

        <div className="notifications-list">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <article
                className={`notification-card ${
                  notification.unread ? "unread" : ""
                }`}
                key={notification.id}
              >
                <div className={`notification-icon ${notification.category.toLowerCase()}`}>
                  <i className={`fa-solid ${notification.icon}`}></i>
                </div>

                <div className="notification-content">
                  <div className="notification-title-row">
                    <h3>{notification.title}</h3>
                    {notification.unread && (
                      <span className="unread-indicator">New</span>
                    )}
                  </div>

                  <p>{notification.message}</p>

                  <div className="notification-meta">
                    <span>{notification.category}</span>
                    <span>·</span>
                    <span>{notification.time}</span>
                  </div>
                </div>

                <div className="notification-actions">
                  {notification.unread && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      aria-label="Mark as read"
                      title="Mark as read"
                    >
                      <i className="fa-solid fa-check"></i>
                    </button>
                  )}

                  <button
                    onClick={() => deleteNotification(notification.id)}
                    aria-label="Delete notification"
                    title="Delete notification"
                  >
                    <i className="fa-regular fa-trash-can"></i>
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-notifications">
              <i className="fa-regular fa-bell-slash"></i>
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
