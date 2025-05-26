import React, { useState, useRef, useEffect } from "react";
import {
  UserRound,
  Mail,
  KeyRound,
  Lock,
  Bell,
  X,
  Phone,
  BellOff,
  Trash,
} from "lucide-react";
import { getMe, updateUser } from "../utils/apiAuth";
import {
  fetchUserNotifications,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../utils/apiNotif";
import { getInitialsAndColor } from "../utils/helpers";
import { acceptInvitation, declineInvitation } from "../utils/apiTask";
import { toast } from "react-hot-toast";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [profilePicture, setProfilePicture] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    avatar: "",
    firstname: "",
    lastname: "",
  });
  const [avatarInitials, setAvatarInitials] = useState({
    initials: "",
    color: "",
  });
  const [processingInvitations, setProcessingInvitations] = useState(new Set());
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await getMe();
        const data = response.data;

        setUserData({
          username: data.username || "",
          email: data.email || "",
          avatar: data.avatar || "",
          firstname: data.firstname || "",
          lastname: data.lastname || "",
        });

        if (data.avatar) {
          setProfilePicture(data.avatar);
        } else if (data.username) {
          const { initials, color } = getInitialsAndColor(data.username);
          setAvatarInitials({ initials, color });
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        toast.error(`Failed to fetch user data: ${error.message}`);
      }
    };

    const fetchNotificationsData = async () => {
      try {
        const data = await fetchUserNotifications();
        if (Array.isArray(data)) {
          setNotifications((prevNotifications) => {
            if (JSON.stringify(prevNotifications) !== JSON.stringify(data)) {
              return data;
            }
            return prevNotifications;
          });
        } else {
          setNotifications([]);
          console.warn("Notifications data is not an array:", data);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchUserData();
    fetchNotificationsData();
    const interval = setInterval(() => {
      if (activeTab === "notification") {
        fetchNotificationsData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [activeTab]);

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(URL.createObjectURL(file));
      setUserData((prev) => ({ ...prev, avatar: file }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    try {
      const updatedData = {
        username: userData.username,
        firstname: userData.firstname,
        lastname: userData.lastname,
      };

      const response = await updateUser(updatedData, userData.avatar);
      setUserData({
        ...userData,
        username: response.data.username,
        firstname: response.data.firstname,
        lastname: response.data.lastname,
        avatar: response.data.avatar,
      });
      setProfilePicture(response.data.avatar);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error(`Failed to update profile: ${error.message}`);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) => ({ ...notif, read: true }))
      );
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      toast.error(`Failed to mark all as read: ${error.message}`);
    }
  };

  const deleteNotif = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notif) => notif._id !== notificationId)
      );
    } catch (error) {
      console.error("Failed to delete notification:", error);
      toast.error(`Failed to delete notification: ${error.message}`);
    }
  };

  const handleAcceptInvitation = async (taskId, notificationId) => {
    if (processingInvitations.has(taskId)) return;

    setProcessingInvitations((prev) => new Set(prev).add(taskId));
    try {
      await acceptInvitation(taskId, notificationId);
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notif) => notif._id !== notificationId)
      );
      toast.success("Invitation accepted successfully!");
    } catch (err) {
      console.error("Error accepting invitation:", err);
      toast.error(`Failed to accept invitation: ${err.message}`);
    } finally {
      setProcessingInvitations((prev) => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };

  const handleDeclineInvitation = async (taskId, notificationId) => {
    if (processingInvitations.has(taskId)) return;

    if (window.confirm("Are you sure you want to decline this invitation?")) {
      setProcessingInvitations((prev) => new Set(prev).add(taskId));
      try {
        await declineInvitation(taskId, notificationId);
        setNotifications((prevNotifications) =>
          prevNotifications.filter((notif) => notif._id !== notificationId)
        );
        toast.success("Invitation declined successfully!");
      } catch (err) {
        console.error("Error declining invitation:", err);
        toast.error(`Failed to decline invitation: ${err.message}`);
      } finally {
        setProcessingInvitations((prev) => {
          const newSet = new Set(prev);
          newSet.delete(taskId);
          return newSet;
        });
      }
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>
      <div className="bg-white border border-borderPrimary rounded-md p-6">
        <div className="flex overflow-x-auto mb-6 border-b border-gray-200 text-sm">
          {[
            { id: "profile", icon: UserRound, label: "Profile" },
            { id: "notification", icon: Bell, label: "Notification" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap px-4 py-2 border-b-2 flex items-center gap-2 ${
                activeTab === tab.id
                  ? "border-font1 text-font1"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "profile" && (
          <div className="space-y-6">
            <div className="mb-6 flex justify-center">
              <div className="flex flex-col items-center space-y-2">
                <div
                  className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer"
                  onClick={handleAvatarClick}
                >
                  {profilePicture ? (
                    <img
                      src={profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : avatarInitials.initials ? (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: avatarInitials.color }}
                    >
                      <span className="text-white text-2xl font-bold">
                        {avatarInitials.initials}
                      </span>
                    </div>
                  ) : (
                    <UserRound className="h-10 w-10 text-gray-400" />
                  )}
                </div>
                <p className="text-[11px] font-semibold uppercase text-gray-500">
                  ( click on avatar to upload image )
                </p>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {[
                  {
                    label: "First Name",
                    name: "firstname",
                    value: userData.firstname,
                    icon: UserRound,
                  },
                  {
                    label: "Last Name",
                    name: "lastname",
                    value: userData.lastname,
                    icon: UserRound,
                  },
                  {
                    label: "Username",
                    name: "username",
                    value: userData.username,
                    icon: UserRound,
                  },
                  {
                    label: "Email Address",
                    name: "email",
                    value: userData.email,
                    icon: Mail,
                    disabled: true,
                  },
                ].map((field, index) => (
                  <div key={index}>
                    <label className="text-sm font-medium text-gray-700 mb-2">
                      {field.label}
                    </label>
                    <div
                      className={`text-sm p-3 rounded-md border border-gray-200 flex items-center gap-2 ${
                        field.disabled
                          ? "bg-gray-50 text-gray-500"
                          : "bg-white text-gray-900 shadow-sm border-gray-300"
                      }`}
                    >
                      {field.icon && (
                        <field.icon
                          className={`h-4 w-4 ${
                            field.disabled ? "text-gray-400" : "text-gray-600"
                          }`}
                        />
                      )}
                      <input
                        type="text"
                        name={field.name}
                        value={field.value || ""}
                        onChange={handleInputChange}
                        disabled={field.disabled || false}
                        className={`w-full bg-transparent outline-none ${
                          field.disabled
                            ? "text-gray-500 cursor-not-allowed"
                            : "text-gray-900"
                        }`}
                        placeholder={
                          field.disabled ? "Not editable" : "Enter value"
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="capitalize text-sm mt-2 bg-font1 text-white px-4 py-2 rounded-md hover:border hover:border-font1 hover:bg-white hover:text-font1 transition duration-200"
                >
                  Update Profile
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === "notification" && (
          <div className="space-y-6">
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
                    const taskTitle = notif.task?.title || "No title available";

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
                                  className={`bg-red-100 hover:bg-red-500 hover:text-white text-red-500 text-xs px-2 py-1 rounded ${
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
                                  className={`bg-green-100 hover:bg-green-500 hover:text-white text-green-500 text-xs px-2 py-1 rounded ${
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

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Change Password</h3>
              <button onClick={() => setShowPasswordModal(false)}>
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              {["Current Password", "New Password", "Confirm New Password"].map(
                (label, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {label}
                    </label>
                    <input
                      type="password"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder={`Enter ${label.toLowerCase()}`}
                    />
                  </div>
                )
              )}
              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {show2FAModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Two-Factor Authentication
              </h3>
              <button onClick={() => setShow2FAModal(false)}>
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Two-factor authentication adds an additional layer of security
                to your account by requiring more than just a password to log
                in.
              </p>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setShow2FAModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                  Enable 2FA
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
