import React, { createContext, useState, useEffect } from "react";
import { getMe } from "../utils/apiAuth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Aktifkan loading state

  const checkAuth = async () => {
    try {
      setLoading(true);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Request timed out")), 5000);
      });

      const response = await Promise.race([getMe(), timeoutPromise]);
      setIsAuthenticated(!!response.success);
    } catch (err) {
      console.error("Authentication check failed:", err.message);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const refreshAuth = async () => {
    try {
      // setLoading(true);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Request timed out")), 5000);
      });

      const response = await Promise.race([getMe(), timeoutPromise]);
      setIsAuthenticated(!!response.success);
    } catch (err) {
      console.error("Refresh auth failed:", err.message);
      setIsAuthenticated(false);
    } finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, refreshAuth, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
