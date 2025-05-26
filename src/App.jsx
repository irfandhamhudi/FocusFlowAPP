import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import TaskList from "./pages/TaskList";
import TaskDetail from "./pages/TaskDetail";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import { Toaster } from "react-hot-toast";
import CalendarPage from "./pages/CalendarPage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import VerifyOtp from "./pages/VerifiyOTP";
import ResendOtp from "./pages/ResendOTP";
import AuthContext, { AuthProvider } from "./context/AuthContext";
import { useMediaQuery } from "react-responsive";
import { Loader } from "lucide-react";

function AppContent() {
  const { isAuthenticated, refreshAuth, loading } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isTablet = useMediaQuery({ minWidth: 769, maxWidth: 1024 });
  const isDesktop = useMediaQuery({ minWidth: 1025 });

  const toggleSidebar = () => setIsOpen(!isOpen);

  useEffect(() => {
    if (isDesktop || isTablet) {
      setIsOpen(true);
    } else if (isMobile) {
      setIsOpen(false);
    }
  }, [isMobile, isTablet, isDesktop]);

  useEffect(() => {
    const initializeAuth = async () => {
      await refreshAuth();
    };
    initializeAuth();
  }, [refreshAuth]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader className="h-8 w-8 text-font1 animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {isAuthenticated ? (
        <div
          className={
            isMobile ? "flex flex-col min-h-screen" : "flex min-h-screen"
          }
        >
          {/* Sidebar */}
          <div
            className={`fixed transition-all duration-300 ease-in-out z-30 bg-white 
              ${
                isMobile
                  ? `left-0 top-0 w-full ${isOpen ? "h-96" : "h-20"}`
                  : `left-0 top-0 h-full ${isOpen ? "w-64" : "w-20"}`
              }`}
          >
            <Sidebar
              isOpen={isOpen}
              toggleSidebar={toggleSidebar}
              isMobile={isMobile}
            />
          </div>

          {/* Overlay for mobile when sidebar is open */}
          {isMobile && isOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-20"
              onClick={toggleSidebar}
            ></div>
          )}

          {/* Main content */}
          <div
            className={`flex-1 transition-all duration-300 ease-in-out min-h-screen bg-gray-50
              ${
                isMobile
                  ? isOpen
                    ? "mt-96"
                    : "mt-20"
                  : isOpen
                  ? "ml-64"
                  : "ml-20"
              }
              ${isMobile ? "p-4" : isTablet ? "p-6" : "p-10"}`}
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tasks" element={<TaskList />} />
              <Route path="/tasks/:id" element={<TaskDetail />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-7xl overflow-hidden">
            <Routes>
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/verify-otp" element={<VerifyOtp />} />
              <Route path="/resend-otp" element={<ResendOtp />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </div>
        </div>
      )}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fff",
            color: "#333",
            borderRadius: "8px",
            padding: "12px",
            fontSize: isMobile ? "14px" : "16px",
            top: isMobile && isOpen ? "104px" : "16px",
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter basename="/subpath">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
