import { useState, useEffect } from "react";
import { fetchUserNotifications } from "../utils/apiNotif";
import { toast } from "react-hot-toast";

function NotificationPanel() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await fetchUserNotifications();
        setNotifications(data);

        // Tampilkan notifikasi baru menggunakan react-hot-toast
        data.forEach((notif) => {
          if (!notif.read) {
            toast.success(notif.message, {
              duration: 5000,
              position: "top-right",
            });
          }
        });
      } catch (err) {
        toast.error("Failed to load notifications.");
        console.error("Error fetching notifications:", err);
      }
    };

    // Polling setiap 30 detik untuk memeriksa notifikasi baru
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="notification-panel" style={{ margin: "20px 0" }}>
      <h3>Notifications</h3>
      {notifications.length === 0 ? (
        <p>No notifications available.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {notifications.map((notif) => (
            <li
              key={notif._id}
              style={{
                padding: "10px",
                borderBottom: "1px solid #ccc",
                backgroundColor: notif.read ? "#fff" : "#e6f7ff",
              }}
            >
              <p>{notif.message}</p>
              <small>{new Date(notif.createdAt).toLocaleString()}</small>
              {!notif.read && (
                <span style={{ color: "red", marginLeft: "10px" }}>(New)</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default NotificationPanel;
