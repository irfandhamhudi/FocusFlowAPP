import React, { useState, useEffect } from "react";
import {
  fetchTasks,
  fetchRecentActivity,
  downloadFile,
  acceptInvitation,
  declineInvitation,
} from "../utils/apiTask";
import { getInitialsAndColor } from "../utils/helpers";
import { getAllUsers, getMe } from "../utils/apiAuth";
import {
  fetchUserNotifications,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../utils/apiNotif";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import {
  ListChecks,
  Clock,
  CheckCircle,
  Loader,
  CloudDownload,
  Bell,
  Trash,
  BellOff,
} from "lucide-react";
import { toast } from "react-hot-toast";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const Dashboard = () => {
  const [user, setUser] = useState(null); // State untuk menyimpan data pengguna
  const [_tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [error, setError] = useState(null);
  const [processingInvitations, setProcessingInvitations] = useState(new Set());
  const [taskStats, setTaskStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    low: 0,
    medium: 0,
    high: 0,
  });

  useEffect(() => {
    loadTasks();
    loadUsers();
    loadRecentActivity();
    loadNotifications();
    loadUser(); // Panggil fungsi untuk mengambil data pengguna

    // Polling every 30 seconds for new notifications
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fungsi untuk memuat data pengguna dari getMe
  const loadUser = async () => {
    try {
      const response = await getMe();
      if (response.success && response.data) {
        setUser(response.data); // Simpan data pengguna
      } else {
        setError("Failed to load user data");
      }
    } catch (err) {
      setError("Failed to load user data: " + err.message);
      console.error("Error fetching user:", err);
    }
  };

  const loadTasks = async () => {
    try {
      const data = await fetchTasks();
      setTasks(data);

      const stats = {
        total: data.length,
        pending: data.filter((task) => task.status === "pending").length,
        inProgress: data.filter((task) => task.status === "inProgress").length,
        completed: data.filter((task) => task.status === "completed").length,
        low: data.filter((task) => task.priority === "low").length,
        medium: data.filter((task) => task.priority === "medium").length,
        high: data.filter((task) => task.priority === "high").length,
      };
      setTaskStats(stats);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching tasks:", err);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError("Failed to load users");
      console.error("Error fetching users:", err);
    }
  };

  const loadRecentActivity = async () => {
    try {
      const data = await fetchRecentActivity(10);
      setActivities(data);
    } catch (err) {
      setError("Failed to load recent activity");
      console.error("Error fetching recent activity:", err);
    }
  };

  const loadNotifications = async () => {
    try {
      const data = await fetchUserNotifications();
      if (Array.isArray(data)) {
        setNotifications(data);
      } else {
        setNotifications([]);
        console.warn("Notifications data is not an array:", data);
      }
    } catch (err) {
      setError("Failed to load notifications");
      console.error("Error fetching notifications:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) => ({ ...notif, read: true }))
      );
    } catch (err) {
      setError(`Failed to mark all notifications as read: ${err.message}`);
      console.error("Error marking all notifications as read:", err);
    }
  };

  const deleteNotif = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notif) => notif._id !== notificationId)
      );
    } catch (err) {
      setError(`Failed to delete notification: ${err.message}`);
      console.error("Error deleting notification:", err);
    }
  };

  const handleAcceptInvitation = async (taskId, notificationId) => {
    if (processingInvitations.has(taskId)) return; // Cegah aksi ganda

    setProcessingInvitations((prev) => new Set(prev).add(taskId)); // Tambahkan taskId ke Set
    try {
      await acceptInvitation(taskId, notificationId);
      await loadNotifications(); // Perbarui notifikasi setelah menerima
      toast.success("Invitation accepted successfully!");
    } catch (err) {
      setError(`Failed to accept invitation: ${err.message}`);
      console.error("Error accepting invitation:", err);
    } finally {
      setProcessingInvitations((prev) => {
        const newSet = new Set(prev);
        newSet.delete(taskId); // Hapus taskId dari Set setelah selesai
        return newSet;
      });
    }
  };

  const handleDeclineInvitation = async (taskId, notificationId) => {
    if (processingInvitations.has(taskId)) return; // Cegah aksi ganda

    if (window.confirm("Are you sure you want to decline this invitation?")) {
      setProcessingInvitations((prev) => new Set(prev).add(taskId)); // Tambahkan taskId ke Set
      try {
        await declineInvitation(taskId, notificationId);
        await loadNotifications(); // Perbarui notifikasi setelah menolak
        toast.success("Invitation declined successfully!");
      } catch (err) {
        setError(`Failed to decline invitation: ${err.message}`);
        console.error("Error declining invitation:", err);
      } finally {
        setProcessingInvitations((prev) => {
          const newSet = new Set(prev);
          newSet.delete(taskId); // Hapus taskId dari Set setelah selesai
          return newSet;
        });
      }
    }
  };

  const getFileType = (fileName) => {
    if (fileName.toLowerCase().endsWith(".pdf")) return "PDF";
    if (
      fileName.toLowerCase().endsWith(".jpg") ||
      fileName.toLowerCase().endsWith(".jpeg") ||
      fileName.toLowerCase().endsWith(".png")
    )
      return "Image";
    return "Document";
  };

  // const formatAction = (action) => {
  //   // Menangani "uploaded file(s)"
  //   if (action.includes("uploaded file(s):")) {
  //     const [userPart, filePart] = action.split(" uploaded file(s): ");
  //     return (
  //       <>
  //         {userPart} uploaded file(s){" "}
  //         <span className="font-bold">{filePart}</span>
  //       </>
  //     );
  //   }
  //   // Menangani "created task"
  //   if (action.includes("created task")) {
  //     const prefix = action.split("created task ")[0];
  //     const titleMatch = action.match(/created task ([^ ]+)/);
  //     if (titleMatch) {
  //       const titlePart = titleMatch[1];
  //       return (
  //         <>
  //           {prefix}created task <span className="font-bold">{titlePart}</span>
  //         </>
  //       );
  //     }
  //   }
  //   // Menangani "assigned task with title"
  //   if (action.includes("assigned task with title")) {
  //     const prefix = action.split("assigned task with title ")[0];
  //     const titleMatch = action.match(/assigned task with title "([^"]+)"/);
  //     if (titleMatch) {
  //       const titlePart = titleMatch[1];
  //       return (
  //         <>
  //           {prefix}assigned task with title{" "}
  //           <span className="font-bold">{titlePart}</span>
  //         </>
  //       );
  //     }
  //   }
  //   // Menangani "accepted invitation to join"
  //   if (action.includes("accepted invitation to join")) {
  //     const prefix = action.split(" accepted invitation to join ")[0];
  //     const titlePart = action.split(" accepted invitation to join ")[1];
  //     return (
  //       <>
  //         {prefix} accepted invitation to join{" "}
  //         <span className="font-bold">{titlePart}</span>
  //       </>
  //     );
  //   }
  //   // Menangani "declined invitation to join"
  //   if (action.includes("declined invitation to join")) {
  //     const prefix = action.split(" declined invitation to join ")[0];
  //     const titlePart = action.split(" declined invitation to join ")[1];
  //     return (
  //       <>
  //         {prefix} declined invitation to join{" "}
  //         <span className="font-bold">{titlePart}</span>
  //       </>
  //     );
  //   }
  //   // Menangani komentar

  //   return action;
  // };

  const handleDownload = async (taskId, fileName) => {
    try {
      await downloadFile(taskId, fileName);
    } catch (err) {
      setError(`Error downloading file: ${err.message}`);
      console.error("Error downloading file:", err.message);
    }
  };

  const statusChartData = {
    labels: ["Pending", "In Progress", "Completed"],
    datasets: [
      {
        label: "Task Status Distribution",
        data: [taskStats.pending, taskStats.inProgress, taskStats.completed],
        backgroundColor: ["#f59e0b", "#3b82f6", "#22c55e"],
        borderColor: ["#ffffff", "#ffffff", "#ffffff"],
        borderWidth: 2,
      },
    ],
  };

  const priorityChartData = {
    labels: ["High", "Medium", "Low"],
    datasets: [
      {
        label: "Task Priority Distribution",
        data: [taskStats.high, taskStats.medium, taskStats.low],
        backgroundColor: ["#ef4444", "#f59e0b", "#e5e7eb"],
        borderColor: ["#dc2626", "#f59e0b", "#e5e7eb"],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#374151",
          font: {
            weight: "bold",
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  const priorityChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || "";
            const value = context.raw || 0;
            return `${label}: ${value}`;
          },
        },
      },
    },
  };

  const unreadNotificationsCount = notifications.filter(
    (notif) => !notif.read
  ).length;

  return (
    <div className="min-h-screen text-gray-800 lg:p-6 p-3 ">
      {/* Header */}
      <div className="mb-8 flex justify-between lg:items-center">
        <div>
          <h1 className="text-[22px] lg:text-3xl font-bold text-gray-900 flex items-center gap-2">
            Dashboard Overview
          </h1>
          <p className="lg:text-base text-[18px] text-gray-600">
            Welcome back{" "}
            <span className="font-bold text-font1">
              {user ? user.username : "Username"}{" "}
            </span>
            Here's what's happening with your tasks.
          </p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            <div className="bg-font1 text-white p-3 rounded-full flex items-center justify-center">
              <Bell className="w-4 h-4 lg:w-5 lg:h-5" />
            </div>
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 rounded-full">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-[350px] lg:w-96 bg-white border border-borderPrimary rounded-md shadow z-10">
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-semibold">Notifications</h3>
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Mark All as Read
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => {
                      const isInvitation = notif.message?.includes("invited");
                      const taskId =
                        typeof notif.task === "object" && notif.task?._id
                          ? notif.task._id.toString()
                          : notif.task?.toString();
                      const taskTitle =
                        notif.task?.title || "No title available"; // Ambil judul tugas dari notif.task

                      // Pisahkan pesan untuk menempatkan task.title di dalam tag tebal
                      let formattedMessage =
                        notif.message || "No message available";
                      if (isInvitation && notif.task?.title) {
                        formattedMessage = notif.message.replace(
                          taskTitle,
                          `<strong>${taskTitle}</strong>`
                        );
                      }

                      return (
                        <div
                          key={notif._id}
                          className={`p-3 mb-2 rounded-md ${
                            !notif.read ? "bg-blue-50" : "bg-gray-50"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              {notif.actor?.avatar ? (
                                <img
                                  src={notif.actor.avatar}
                                  alt={notif.actor.username || "User"}
                                  className="w-10 h-10 rounded-full object-cover"
                                  onError={(e) => {
                                    e.target.outerHTML = `
                    <div
                      class="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                      style="background-color: ${
                        getInitialsAndColor(notif.actor?.username || "User")
                          .color
                      }"
                    >
                      ${
                        getInitialsAndColor(notif.actor?.username || "User")
                          .initials
                      }
                    </div>
                  `;
                                  }}
                                />
                              ) : (
                                <div
                                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                                  style={{
                                    backgroundColor: getInitialsAndColor(
                                      notif.actor?.username || "User"
                                    ).color,
                                  }}
                                >
                                  {
                                    getInitialsAndColor(
                                      notif.actor?.username || "User"
                                    ).initials
                                  }
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className="text-sm"
                                dangerouslySetInnerHTML={{
                                  __html: formattedMessage,
                                }}
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                {notif.createdAt
                                  ? `${new Date(
                                      notif.createdAt
                                    ).toLocaleDateString("in-ID", {
                                      day: "2-digit",
                                      month: "long",
                                      year: "numeric",
                                      timeZone: "Asia/Jakarta",
                                    })} - ${new Date(
                                      notif.createdAt
                                    ).toLocaleTimeString("in-ID", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: true,
                                      timeZone: "Asia/Jakarta",
                                    })}`
                                  : "Tanggal tidak tersedia"}
                              </p>
                              {isInvitation && !notif.read && taskId && (
                                <div className="flex gap-2 mt-2">
                                  <button
                                    onClick={() =>
                                      handleDeclineInvitation(taskId, notif._id)
                                    }
                                    className={`bg-red-100 hover:bg-red-500 hover:text-white text-red-500 text-xs px-2 py-1 rounded  ${
                                      processingInvitations.has(taskId)
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                    }`}
                                    disabled={processingInvitations.has(taskId)}
                                  >
                                    Decline
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleAcceptInvitation(taskId, notif._id)
                                    }
                                    className={`bg-green-100 hover:bg-green-500 hover:text-white text-green-500 text-xs px-2 py-1 rounded  ${
                                      processingInvitations.has(taskId)
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                    }`}
                                    disabled={processingInvitations.has(taskId)}
                                  >
                                    Accept
                                  </button>
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => deleteNotif(notif._id)}
                              className="text-red-600 hover:text-red-800 ml-2"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex items-center justify-center gap-2 p-4 text-sm">
                      <BellOff className="w-5 h-5 text-gray-400" />
                      <p className="text-center text-gray-500">
                        No notifications available
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="border border-borderPrimary p-6 rounded-md bg-white flex items-center lg:items-start gap-4">
          <div className="bg-black p-3 rounded-full">
            <ListChecks className="text-white w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-700">Total Tasks</h2>
            <p className="text-3xl font-bold text-gray-900">
              {taskStats.total}
            </p>
            <p className="text-sm text-gray-500">All tasks in the system</p>
          </div>
        </div>

        <div className="border border-borderPrimary p-6 rounded-md bg-white flex items-center lg:items-start gap-4">
          <div className="bg-amber-100 p-3 rounded-full">
            <Clock className="text-amber-500 w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-700">Pending</h2>
            <p className="text-3xl font-bold text-gray-900">
              {taskStats.pending}
            </p>
            <p className="text-sm text-gray-500">Waiting to start</p>
          </div>
        </div>

        <div className="border border-borderPrimary p-6 rounded-md bg-white flex items-center lg:items-start gap-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <Loader className="text-blue-500 w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-700">In Progress</h2>
            <p className="text-3xl font-bold text-gray-900">
              {taskStats.inProgress}
            </p>
            <p className="text-sm text-gray-500">Currently working</p>
          </div>
        </div>

        <div className="border border-borderPrimary p-6 rounded-md bg-white flex items-center lg:items-start gap-4">
          <div className="bg-green-100 p-3 rounded-full">
            <CheckCircle className="text-green-500 w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-700">Completed</h2>
            <p className="text-3xl font-bold text-gray-900">
              {taskStats.completed}
            </p>
            <p className="text-sm text-gray-500">Tasks finished</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div>
          <h1 className="text-lg font-semibold mb-4">Priority Stats</h1>
          <div className="border border-borderPrimary p-6 rounded-md bg-white">
            <div className="h-64">
              <Bar data={priorityChartData} options={priorityChartOptions} />
            </div>
          </div>
        </div>

        <div>
          <h1 className="text-lg font-semibold mb-4">Status Chart</h1>
          <div className="border border-borderPrimary p-6 rounded-md bg-white">
            <div className="h-64">
              <Pie data={statusChartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity and Users Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 ">
          <h1 className="text-lg font-semibold mb-4">Recent Activity</h1>
          <div className="border border-borderPrimary p-5 rounded-md bg-white">
            <div className="space-y-4 h-[350px] overflow-y-auto pr-2">
              {activities.length > 0 ? (
                activities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    {activity.files && activity.files.length > 0 ? (
                      <div className="flex items-start gap-3 w-full">
                        <div
                          className="w-10 h-10 object-cover rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 mt-1"
                          style={{
                            backgroundColor: getInitialsAndColor(activity.user)
                              .color,
                          }}
                        >
                          {activity.avatar ? (
                            <img
                              src={activity.avatar}
                              alt="User Avatar"
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <div
                              className="w-10 h-10 object-cover rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
                              style={{
                                backgroundColor: getInitialsAndColor(
                                  activity.user
                                ).color,
                              }}
                            >
                              {getInitialsAndColor(activity.user).initials}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-1 text-sm">
                            <p className="text-font1">{activity.action}</p>
                          </div>
                          <div className="mt-2 w-[350px]">
                            {activity.files.map((file, fileIndex) => (
                              <div
                                key={fileIndex}
                                className="flex items-center bg-gray-100 p-2 rounded-md mb-2"
                              >
                                <div className="mr-2">
                                  {getFileType(file.name) === "PDF" ? (
                                    <svg
                                      className="w-6 h-6 text-red-500"
                                      fill="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h7v5h5v11H6z" />
                                    </svg>
                                  ) : getFileType(file.name) === "Image" ? (
                                    <svg
                                      className="w-6 h-6 text-blue-500"
                                      fill="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                                    </svg>
                                  ) : (
                                    <svg
                                      className="w-6 h-6 text-gray-500"
                                      fill="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h7v5h5v11H6z" />
                                    </svg>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium">
                                    {file.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {getFileType(file.name)} ·{" "}
                                    {file.size || "N/A"}mb
                                  </p>
                                </div>
                                <button
                                  onClick={() =>
                                    handleDownload(activity.taskId, file.name)
                                  }
                                  className="text-blue-500 hover:text-blue-700 ml-2"
                                >
                                  <CloudDownload className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {activity.createdAt
                              ? `${new Date(
                                  activity.createdAt
                                ).toLocaleDateString("in-ID", {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                  timeZone: "Asia/Jakarta",
                                })} - ${new Date(
                                  activity.createdAt
                                ).toLocaleTimeString("in-ID", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                  timeZone: "Asia/Jakarta",
                                })}`
                              : "Tanggal tidak tersedia"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3 w-full">
                        <div
                          className="w-10 h-10 text-sm rounded-full flex items-center justify-center text-white font-semibold mt-1 flex-shrink-0"
                          style={{
                            backgroundColor: getInitialsAndColor(activity.user)
                              .color,
                          }}
                        >
                          {activity.avatar ? (
                            <img
                              src={activity.avatar}
                              alt="avatar"
                              className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
                            />
                          ) : (
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
                              style={{
                                backgroundColor: getInitialsAndColor(
                                  activity.user
                                ).color,
                              }}
                            >
                              {getInitialsAndColor(activity.user).initials}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-1 text-sm">
                            <p className="text-font1">
                              {activity.action || "No action specified"}
                            </p>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {activity.createdAt
                              ? `${new Date(
                                  activity.createdAt
                                ).toLocaleDateString("in-ID", {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                  timeZone: "Asia/Jakarta",
                                })} - ${new Date(
                                  activity.createdAt
                                ).toLocaleTimeString("in-ID", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                  timeZone: "Asia/Jakarta",
                                })}`
                              : "Tanggal tidak tersedia"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No recent activity
                </p>
              )}
            </div>
          </div>
        </div>

        <div>
          <h1 className="text-lg font-semibold mb-4">User ({users.length})</h1>
          <div className="border border-borderPrimary rounded-md bg-white">
            <div className="max-h-[220px] overflow-y-auto">
              {users.length > 0 ? (
                <>
                  {users.slice(0, 4).map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center gap-3 p-4 hover:bg-gray-50 border-b border-gray-100"
                    >
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.username || "User"}
                            className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
                          />
                        ) : (
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
                            style={{
                              backgroundColor: getInitialsAndColor(
                                user.username || "User"
                              ).color,
                            }}
                          >
                            {
                              getInitialsAndColor(user.username || "User")
                                .initials
                            }
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {user.username || "Unknown User"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email || "No email"}
                        </p>
                      </div>
                    </div>
                  ))}
                  {users.length > 4 && (
                    <div className="max-h-[200px] overflow-y-auto">
                      {users.slice(4).map((user) => (
                        <div
                          key={user._id}
                          className="flex items-center gap-3 p-4 hover:bg-gray-50 border-b border-gray-100"
                        >
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.username || "User"}
                                className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
                              />
                            ) : (
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
                                style={{
                                  backgroundColor: getInitialsAndColor(
                                    user.username || "User"
                                  ).color,
                                }}
                              >
                                {
                                  getInitialsAndColor(user.username || "User")
                                    .initials
                                }
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">
                              {user.username || "Unknown User"}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user.email || "No email"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-500 text-center py-4">No users found</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
