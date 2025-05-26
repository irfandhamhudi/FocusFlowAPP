import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../utils/apiAuth";

// Impor gambar dari folder assets (sesuaikan path dengan lokasi gambar Anda)
import loginBackground from "../assets/register.png";
import logo from "../assets/logo4.png";
import { LoaderIcon } from "react-hot-toast";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(""); // State untuk kekuatan password
  const [passwordMessage, setPasswordMessage] = useState(""); // State untuk pesan validasi
  const [, setUserId] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Validasi password secara real-time
    if (name === "password") {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumber = /\d/.test(value);
      const isLongEnough = value.length >= 8;

      if (!value) {
        setPasswordStrength("");
        setPasswordMessage("");
      } else if (passwordRegex.test(value)) {
        setPasswordStrength("good");
        setPasswordMessage("Password strength: Good");
      } else if (hasUpperCase && hasLowerCase && hasNumber && isLongEnough) {
        setPasswordStrength("strong");
        setPasswordMessage(
          "Password strength: Strong (meets basic requirements but can be improved)"
        );
      } else {
        setPasswordStrength("weak");
        let message = "Password strength: Weak (";
        if (!isLongEnough) message += "must be at least 8 characters, ";
        if (!hasUpperCase) message += "needs uppercase letter, ";
        if (!hasLowerCase) message += "needs lowercase letter, ";
        if (!hasNumber) message += "needs a number, ";
        message = message.slice(0, -2) + ")";
        setPasswordMessage(message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    // Validasi password sebelum submit
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError(
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number."
      );
      setIsLoading(false);
      return;
    }

    setTimeout(async () => {
      try {
        const response = await registerUser(formData);
        if (!response.success) {
          throw new Error(response.message);
        }
        setSuccess(response.message);
        setUserId(response.userId);
        setTimeout(() => navigate("/verify-otp"), 2000);
      } catch (err) {
        setError(err.message || "Registration failed");
      } finally {
        setIsLoading(false);
      }
    }, 2000);
  };

  return (
    <div className="flex flex-col md:flex-row p-4 sm:p-6 md:p-10 min-h-screen overflow-y-auto">
      <div className="flex flex-col md:flex-row w-full max-w-7xl mx-auto bg-gray-100 rounded-md border border-borderPrimary overflow-hidden">
        {/* Left Panel - Task Preview with Background Image */}
        <div className="w-full md:w-1/2 flex items-center justify-center">
          <div className="relative flex items-center justify-center w-full h-full">
            <img
              src={loginBackground}
              alt=""
              className="w-full h-auto max-w-[300px] md:max-w-[500px] md:h-[500px] object-cover"
            />
            <div className="absolute top-5 left-5 md:left-10 flex items-center">
              <img
                src={logo}
                alt="Logo"
                className="h-6 w-6 md:h-8 md:w-8 object-contain mr-2"
              />
              <p className="text-font1 uppercase text-sm md:text-md font-bold">
                focus flow
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel - Register Form */}
        <div className="w-full md:w-1/2 bg-white flex items-center justify-center">
          <div className="p-4 sm:p-6 md:p-8 w-full max-w-md">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 text-center">
              Register
            </h2>
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
                {success}
              </div>
            )}
            <form onSubmit={handleSubmit} autoComplete="off">
              <div className="mb-4">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="text-sm w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your username"
                  required
                  autoComplete="off"
                  disabled={isLoading}
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="text-sm w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                  required
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="text-sm w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                  required
                  autoComplete="new-password"
                  disabled={isLoading}
                />
                {passwordStrength && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength === "weak"
                            ? "w-1/3 bg-red-500"
                            : passwordStrength === "strong"
                            ? "w-2/3 bg-orange-500"
                            : "w-full bg-green-500"
                        }`}
                      ></div>
                    </div>
                    <p
                      className={`text-xs mt-1 ${
                        passwordStrength === "weak"
                          ? "text-red-500"
                          : passwordStrength === "strong"
                          ? "text-orange-500"
                          : "text-green-500"
                      }`}
                    >
                      {passwordMessage}
                    </p>
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="w-full text-sm mt-2 bg-font1 text-white p-3 rounded-md hover:border hover:border-font1 hover:bg-white hover:text-font1 transition duration-200 flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoaderIcon className="animate-spin mr-2" />
                    Loading ....
                  </>
                ) : (
                  "Register"
                )}
              </button>
              <div className="mt-4 text-center">
                <div className="relative flex items-center justify-center">
                  <div className="w-full border-t border-gray-300"></div>
                  <span className="px-4 bg-white text-gray-500">or</span>
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <button
                  className="text-sm w-full mt-4 bg-white border border-gray-300 text-gray-700 p-3 rounded flex items-center justify-center hover:bg-gray-50"
                  disabled={isLoading}
                >
                  <img
                    src="https://www.google.com/favicon.ico"
                    alt="Google"
                    className="w-5 h-5 mr-2"
                  />
                  Register with Google
                </button>
                <p className="mt-4 text-xs text-gray-600">
                  Already have an account?{" "}
                  <Link to="/login" className="text-blue-600 hover:underline">
                    Log In
                  </Link>
                </p>
                <p className="uppercase mt-4 text-xs text-font1 font-bold">
                  ( register with google is still in development stage )
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
