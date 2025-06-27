import axios from "axios";

const api = axios.create({
  // baseURL: "https://api-focusflow-production.up.railway.app/api/v1/auth",
  baseURL: "https://glowing-twilight-ac2653.netlify.app/api/v1/auth",
  // baseURL: "http://localhost:5000/api/v1/auth",
  withCredentials: true,
});

// Register User
export const registerUser = async (userData) => {
  try {
    const response = await api.post("/register", userData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

// Verify OTP
export const verifyOtp = async (otpData) => {
  try {
    const response = await api.post("/verify-otp", otpData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

// Resend OTP
export const resendOtp = async (emailData) => {
  try {
    const response = await api.post("/resend-otp", emailData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

// Login User
export const loginUser = async (loginData) => {
  try {
    const response = await api.post("/login", loginData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

// Get Me (User Info)
export const getMe = async () => {
  try {
    const response = await api.get("/me");
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

// Update User
export const updateUser = async (userData, avatarFile = null) => {
  try {
    // Buat FormData untuk mengirimkan data teks dan file
    const formData = new FormData();

    // Tambahkan data teks ke FormData
    if (userData.username) formData.append("username", userData.username);
    if (userData.firstname) formData.append("firstname", userData.firstname);
    if (userData.lastname) formData.append("lastname", userData.lastname);

    // Tambahkan file avatar jika ada
    if (avatarFile) {
      formData.append("images", avatarFile);
    }

    // Kirim permintaan dengan FormData
    const response = await api.put("/update", formData, {
      headers: {
        "Content-Type": "multipart/form-data", // FormData akan menangani header ini secara otomatis, tetapi kita tetapkan untuk kejelasan
      },
    });

    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

// Logout User
export const logoutUser = async () => {
  try {
    const response = await api.post("/logout");
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

// Get All Users
export const getAllUsers = async () => {
  try {
    const response = await api.get("/users");
    return response.data.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

// Get assigned users
export const getAssignedUsers = async () => {
  try {
    const response = await api.get("/assigned-users");
    return response.data.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error");
  }
};

export default {
  registerUser,
  verifyOtp,
  resendOtp,
  loginUser,
  getMe,
  getAllUsers,
  logoutUser,
};
