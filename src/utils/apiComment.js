import axios from "axios";

const api = axios.create({
  baseURL: "https://api-focusflow-production.up.railway.app/api/v1/comments",
  // baseURL: "http://localhost:5000/api/v1/comments", // Adjust as needed
  withCredentials: true, // Allow sending cookies for authentication
});

export const addComment = async (taskId, comment) => {
  try {
    const response = await api.post(`/tasks/${taskId}`, { comment });
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
    const response = await api.post(`/tasks/${taskId}/${commentId}/replies`, {
      comment,
    });
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

export const getCommentsByTask = async (taskId) => {
  try {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Get comments by task error:",
      error.response?.status,
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Gagal mendapatkan komentar"
    );
  }
};

export const editComment = async (taskId, commentId, comment) => {
  try {
    const response = await api.patch(`/tasks/${taskId}/${commentId}`, {
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

export const editCommentReply = async (taskId, commentId, replyId, comment) => {
  try {
    const response = await api.patch(
      `/tasks/${taskId}/${commentId}/replies/${replyId}`,
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

export const deleteComment = async (taskId, commentId) => {
  try {
    const response = await api.delete(`/tasks/${taskId}/${commentId}`);
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

export const deleteCommentReply = async (taskId, commentId, replyId) => {
  try {
    const response = await api.delete(
      `/tasks/${taskId}/${commentId}/replies/${replyId}`
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
