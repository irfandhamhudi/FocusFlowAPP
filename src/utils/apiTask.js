import axios from "axios";

const api = axios.create({
  // baseURL: "https://api-focusflow-production.up.railway.app/api/v1/tasks",
  // baseURL: "http://localhost:5000/api/v1/tasks", // Adjust as needed
  baseURL: "https://glowing-twilight-ac2653.netlify.app/api/v1/tasks",
  withCredentials: true, // Allow sending cookies for authentication
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

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const createTask = async (taskData) => {
  try {
    const formData = new FormData();
    for (const key in taskData) {
      if (key === "assignedTo" && Array.isArray(taskData[key])) {
        const validEmails = taskData[key].filter(
          (email) => typeof email === "string" && isValidEmail(email)
        );
        if (validEmails.length === 0 && taskData[key].length > 0) {
          throw new Error("Invalid email addresses in assignedTo");
        }
        formData.append(key, JSON.stringify(validEmails));
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

    // Validate and add fields to FormData
    for (const key in taskData) {
      if (key === "assignedTo" && Array.isArray(taskData[key])) {
        // Ensure assignedTo is an array of email addresses
        const validEmails = taskData[key].filter(
          (email) => typeof email === "string" && email.trim() !== ""
        );
        if (validEmails.length === 0 && taskData[key].length > 0) {
          throw new Error("Invalid email addresses in assignedTo");
        }
        console.log("AssignedTo before sending:", validEmails); // Debugging
        formData.append(key, JSON.stringify(validEmails));
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

export const editComment = async (taskId, commentId, comment) => {
  try {
    const response = await api.patch(`/${taskId}/comments/${commentId}`, {
      comment,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Edit comment error:",
      error.response?.status,
      error.response?.data || error.message
    );
    throw new Error(error.response?.data?.message || "Gagal mengedit komentar");
  }
};

export const deleteComment = async (taskId, commentId) => {
  try {
    const response = await api.delete(`/${taskId}/comments/${commentId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Delete comment error:",
      error.response?.status,
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Gagal menghapus komentar"
    );
  }
};

export const editCommentReply = async (taskId, commentId, replyId, comment) => {
  try {
    const response = await api.patch(
      `/${taskId}/comments/${commentId}/replies/${replyId}`,
      { comment }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Edit comment reply error:",
      error.response?.status,
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Gagal mengedit balasan komentar"
    );
  }
};

export const deleteCommentReply = async (taskId, commentId, replyId) => {
  try {
    const response = await api.delete(
      `/${taskId}/comments/${commentId}/replies/${replyId}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Delete comment reply error:",
      error.response?.status,
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Gagal menghapus balasan komentar"
    );
  }
};

export const addCommentReply = async (taskId, commentId, comment) => {
  try {
    const response = await api.post(
      `/${taskId}/comments/${commentId}/replies`,
      { comment }
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

// Accept an invitation
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

// Decline an invitation
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

// Join a task
export const joinTask = async (token) => {
  try {
    const response = await api.get(`/join/${token}`);
    return response.data;
  } catch (error) {
    console.error(
      "Join task error:",
      error.response?.status,
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Gagal bergabung dengan tugas"
    );
  }
};
