import axios from "axios";

const api = axios.create({
  baseURL:
    "https://api-focusflow-production.up.railway.app/api/v1/notifications",
  withCredentials: true,
});

export const fetchUserNotifications = async () => {
  try {
    const response = await api.get("/");
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch notifications";
    console.error(
      "Fetch notifications error:",
      error.response?.status,
      errorMessage
    );
    throw new Error(errorMessage);
  }
};

export const createNotification = async (notificationData) => {
  try {
    const response = await api.post("/", notificationData);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to create notification";
    console.error(
      "Create notification error:",
      error.response?.status,
      errorMessage
    );
    throw new Error(errorMessage);
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await api.patch(`/${notificationId}`);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to mark notification as read";
    console.error(
      "Mark notification as read error:",
      error.response?.status,
      errorMessage
    );
    throw new Error(errorMessage);
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const response = await api.put("/mark-all"); // Ubah ke PUT
    console.log("Server response:", response.data); // Log untuk debugging
    return response.data;
  } catch (error) {
    console.log("Full error response:", error.response?.data); // Log error lengkap
    const errorMessage =
      error.response?.data?.message ||
      "Failed to mark all notifications as read";
    console.error(
      "Mark all notifications as read error:",
      error.response?.status,
      errorMessage
    );
    throw new Error(errorMessage);
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    const response = await api.delete(`/${notificationId}`);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to delete notification";
    console.error(
      "Delete notification error:",
      error.response?.status,
      errorMessage
    );
    throw new Error(errorMessage);
  }
};
