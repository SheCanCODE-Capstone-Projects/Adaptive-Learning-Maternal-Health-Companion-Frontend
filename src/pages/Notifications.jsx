
import { useEffect, useState } from "react";

const initialNotifications = [
  {
    id: 1,
    title: "Welcome to MaternalCare",
    message: "Welcome! Start by exploring your appointments and diary.",
    time: "Just now",
    type: "Welcome",
    read: false
  },
  {
    id: 2,
    title: "Health learning reminder",
    message: "Remember to explore your approved maternal health lessons.",
    time: "Today",
    type: "Learning",
    read: false
  },
  {
    id: 3,
    title: "Keep your diary updated",
    message: "You can write questions to discuss with your healthcare professional.",
    time: "Today",
    type: "Reminder",
    read: true
  }
];

function Notifications() {
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("notifications");
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  useEffect(() => {
    localStorage.setItem(
      "notifications",
      JSON.stringify(notifications)
    );
  }, [notifications]);

  const unreadCount = notifications.filter(
    item => !item.read
  ).length;

  function markAsRead(id) {
    setNotifications(notifications.map(item =>
      item.id === id ? { ...item, read: true } : item
    ));
  }

  function markAllRead() {
    setNotifications(notifications.map(item => ({
      ...item,
      read: true
    })));
  }

  function deleteNotification(id) {
    setNotifications(notifications.filter(item => item.id !== id));
  }

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">STAY INFORMED</span>
          <h1>Notifications</h1>
          <p>Important reminders and updates in one place.</p>
        </div>
        <div className="heading-icon">🔔</div>
      </div>

      <div className="notification-summary">
        <div>
          <span>All Notifications</span>
          <h2>{notifications.length}</h2>
        </div>
        <div>
          <span>Unread Notifications</span>
          <h2>{unreadCount}</h2>
        </div>
        <button className="secondary-btn" onClick={markAllRead}>
          Mark all as read
        </button>
      </div>

      <div className="content-card">
        <h2>Recent Notifications</h2>

        {notifications.length === 0 ? (
          <div className="empty-state">
            <span>🔔</span>
            <p>You have no notifications.</p>
          </div>
        ) : (
          <div className="notification-list">
            {notifications.map(item => (
              <article
                className={`notification-item ${
                  item.read ? "read" : "unread"
                }`}
                key={item.id}
              >
                <div className="notification-icon">
                  {item.type === "Learning" ? "📚" :
                   item.type === "Reminder" ? "📅" : "💗"}
                </div>

                <div className="notification-details">
                  <div className="notification-title">
                    <h3>{item.title}</h3>
                    {!item.read && <span className="unread-dot" />}
                  </div>

                  <p>{item.message}</p>
                  <small>{item.time}</small>

                  <div className="notification-actions">
                    {!item.read && (
                      <button onClick={() => markAsRead(item.id)}>
                        Mark as read
                      </button>
                    )}

                    <button
                      className="delete-btn"
                      onClick={() => deleteNotification(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Notifications;
