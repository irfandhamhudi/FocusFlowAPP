import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../utils/apiAuth";
import AuthContext from "../context/AuthContext";
import toast, { LoaderIcon } from "react-hot-toast";

// Impor gambar dari folder assets
import loginBackground from "../assets/login.png";
import logo from "../assets/logo4.png";

const Login = () => {
  const { refreshAuth } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail, rememberMe: true }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await loginUser(formData);
      if (!response.success) {
        throw new Error(response.message);
      }
      toast.success("Login successful!");
      await refreshAuth();
      if (formData.rememberMe) {
        localStorage.setItem("rememberedEmail", formData.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
      navigate("/");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
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

        {/* Right Panel - Login Form */}
        <div className="w-full md:w-1/2 bg-white flex items-center justify-center">
          <div className="p-4 sm:p-6 md:p-8 w-full max-w-md">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 text-center">
              Log In
            </h2>
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} action="/login" method="post">
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
                  autoComplete="username"
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
                  autoComplete="current-password"
                  disabled={isLoading}
                />
              </div>
              <div className="flex items-center justify-between mb-6">
                <label className="flex items-center text-xs text-gray-700">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    className="mr-2"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  Remember me
                </label>
                <a href="#" className="text-xs text-blue-600 hover:underline">
                  Forgot password?
                </a>
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
                  "Log In"
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
                  Log in with Google
                </button>
                <p className="mt-4 text-xs text-gray-600">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="text-blue-600 hover:underline"
                  >
                    Create Account
                  </Link>
                </p>
                <p className="uppercase mt-4 text-xs text-font1 font-bold">
                  ( login with google is still in development stage )
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
