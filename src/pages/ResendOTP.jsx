import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { resendOtp } from "../utils/apiAuth";

// Impor gambar dari folder assets (sesuaikan path dengan lokasi gambar Anda)
import loginBackground from "../assets/otp.png";
import logo from "../assets/logo4.png";
import { LoaderIcon } from "react-hot-toast";

const ResendOtp = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // State untuk loading

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    setSuccess(null);

    try {
      const response = await resendOtp({ email });
      if (!response.success) {
        throw new Error(response.message);
      }
      setSuccess(response.message);
      setTimeout(() => {
        navigate("/login");
      }, 2000); // Redirect ke login setelah verifikasi
    } catch (err) {
      setError(err.message || "Failed to resend OTP");
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

        {/* Right Panel - Resend OTP Form */}
        <div className="w-full md:w-1/2 bg-white flex items-center justify-center">
          <div className="p-4 sm:p-6 md:p-8 w-full max-w-md">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 text-center">
              Resend OTP
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
            <form onSubmit={handleSubmit}>
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
                  value={email}
                  onChange={handleChange}
                  className="text-sm w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                  required
                  disabled={isLoading} // Nonaktifkan input saat loading
                />
              </div>
              <button
                type="submit"
                className="w-full text-sm mt-2 bg-font1 text-white p-3 rounded-md hover:border hover:border-font1 hover:bg-white hover:text-font1 transition duration-200 flex items-center justify-center"
                disabled={isLoading} // Nonaktifkan tombol saat loading
              >
                {isLoading ? (
                  <>
                    <LoaderIcon className="animate-spin mr-2" />
                    Loading ....
                  </>
                ) : (
                  "Resend OTP"
                )}
              </button>
              {/* <div className="mt-4 text-center">
                <p className="capitalize text-xs text-gray-600">
                  Back to{" "}
                  <Link
                    to="/register"
                    className="text-blue-600 hover:underline"
                  >
                    Register
                  </Link>
                </p>
              </div> */}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResendOtp;
