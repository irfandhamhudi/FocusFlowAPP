import axios from "axios";

const api = axios.create({
  baseURL: "https://api-focusflow-production.up.railway.app/api/v1/tasks",
  withCredentials: true, // Mengizinkan pengiriman cookies untuk autentikasi
});

export const fetchTasks = async () => {
  try {
    const response = await api.get("/");
    return response.data;
  } catch (error) {
    console.error(
      "Fetch tasks error:",
      error.response?.status,
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Gagal mengambil daftar tugas"
    );
  }
};

export const fetchTaskById = async (id) => {
  try {
    const response = await api.get(`/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      "Fetch task by ID error:",
      error.response?.status,
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Gagal mengambil detail tugas"
    );
  }
};

export const createTask = async (taskData) => {
  try {
    const formData = new FormData();

    // Validasi dan tambahkan field teks ke FormData
    for (const key in taskData) {
      if (key === "assignedTo" && Array.isArray(taskData[key])) {
        formData.append(key, JSON.stringify(taskData[key]));
      } else if (key === "subtask" && Array.isArray(taskData[key])) {
        const validatedSubtasks = taskData[key]
          .map((sub) => ({
            title: sub.title?.trim() || "",
            completed:
              typeof sub.completed === "boolean" ? sub.completed : false,
          }))
          .filter((sub) => sub.title !== "");
        formData.append(key, JSON.stringify(validatedSubtasks));
      } else if (key === "attachment" && taskData[key]) {
        taskData[key].forEach((file) => formData.append("attachment", file));
      } else if (taskData[key] !== undefined && key !== "attachment") {
        formData.append(key, taskData[key]);
      }
    }

    const response = await api.post("/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Create task error:",
      error.response?.status,
      error.response?.data || error.message
    );
    throw new Error(error.response?.data?.message || "Gagal membuat tugas");
  }
};

export const updateTask = async (taskId, taskData) => {
  try {
    const formData = new FormData();

    // Validasi dan tambahkan field teks ke FormData
    for (const key in taskData) {
      if (key === "assignedTo" && Array.isArray(taskData[key])) {
        console.log("AssignedTo sebelum dikirim:", taskData[key]); // Debugging
        formData.append(key, JSON.stringify(taskData[key]));
      } else if (key === "subtask" && Array.isArray(taskData[key])) {
        const validatedSubtasks = taskData[key]
          .map((sub) => ({
            title: sub.title?.trim() || "",
            completed:
              typeof sub.completed === "boolean" ? sub.completed : false,
          }))
          .filter((sub) => sub.title !== "");
        formData.append(key, JSON.stringify(validatedSubtasks));
      } else if (key === "attachment" && taskData[key]) {
        taskData[key].forEach((file) => formData.append("attachment", file));
      } else if (taskData[key] !== undefined && key !== "attachment") {
        formData.append(key, taskData[key]);
      }
    }

    const response = await api.patch(`/${taskId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Update task error:",
      error.response?.status,
      error.response?.data || error.message
    );
    throw new Error(error.response?.data?.message || "Gagal memperbarui tugas");
  }
};

export const deleteTask = async (taskId) => {
  try {
    const response = await api.delete(`/${taskId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Delete task error:",
      error.response?.status,
      error.response?.data || error.message
    );
    throw new Error(error.response?.data?.message || "Gagal menghapus tugas");
  }
};

export const addComment = async (taskId, comment) => {
  try {
    const response = await api.post(`/${taskId}/comments`, { comment });
    return response.data;
  } catch (error) {
    console.error(
      "Add comment error:",
      error.response?.status,
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Gagal menambahkan komentar"
    );
  }
};

export const addCommentReply = async (taskId, commentId, comment) => {
  try {
    const response = await api.post(
      `/${taskId}/comments/${commentId}/replies`,
      {
        comment,
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Add comment reply error:",
      error.response?.status,
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Gagal menambahkan balasan komentar"
    );
  }
};

export const fetchRecentActivity = async (limit = 10) => {
  try {
    const response = await api.get(`/recent-activity?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error(
      "Fetch recent activity error:",
      error.response?.status,
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Gagal mengambil aktivitas terbaru"
    );
  }
};

export const downloadFile = async (taskId, fileName) => {
  try {
    const response = await api.get(`/download/${taskId}/${fileName}`, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download file error:", {
      message: error.message,
      response: error.response,
      request: error.request,
    });
    throw new Error(error.response?.data?.message || "Gagal mengunduh file");
  }
};

// Fungsi untuk mengambil daftar undangan
export const fetchInvitations = async () => {
  try {
    const response = await api.get("/invitations");
    return response.data;
  } catch (error) {
    console.error(
      "Fetch invitations error:",
      error.response?.status,
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Gagal mengambil daftar undangan"
    );
  }
};

// Fungsi untuk menerima undangan
export const acceptInvitation = async (taskId) => {
  try {
    const response = await api.post(`/invitations/accept/${taskId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Accept invitation error:",
      error.response?.status,
      error.response?.data || error.message
    );
    throw new Error(error.response?.data?.message || "Gagal menerima undangan");
  }
};

// Fungsi untuk menolak undangan
export const declineInvitation = async (taskId) => {
  try {
    const response = await api.post(`/invitations/decline/${taskId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Decline invitation error:",
      error.response?.status,
      error.response?.data || error.message
    );
    throw new Error(error.response?.data?.message || "Gagal menolak undangan");
  }
};

// Fungsi untuk mengambil daftar notifikasi
export const fetchNotifications = async () => {
  try {
    const response = await api.get("/notifications");
    return response.data;
  } catch (error) {
    console.error(
      "Fetch notifications error:",
      error.response?.status,
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Gagal mengambil daftar notifikasi"
    );
  }
};
