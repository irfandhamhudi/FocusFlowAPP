import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { fetchTasks } from "../utils/apiTask";
import { getInitialsAndColor } from "../utils/helpers";
import {
  Activity,
  CalendarCheck2,
  CalendarClock,
  CircleCheck,
  Clock,
  CloudDownload,
  FileText,
  ListTodo,
  Loader,
  Paperclip,
  SquarePen,
  Tags,
  TrashIcon,
  UserRoundPen,
  UsersRound,
  X,
} from "lucide-react";

const formatDateOnly = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("in-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
};

const CalendarPage = () => {
  const [tasks, setTasks] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchTasks();
        setTasks(data);
      } catch (error) {
        console.error("Error fetching tasks:", error.message);
        setTasks([]);
      }
    };
    fetchData();
  }, []);

  const events = tasks
    .map((task) => {
      const cleanedTitle = task.title.replace(/^\d+[a-zA-Z]?\s*/, "");
      const startDate = task.startDate ? new Date(task.startDate) : null;
      const dueDate = task.dueDate ? new Date(task.dueDate) : null;

      const isSameDay =
        startDate &&
        dueDate &&
        startDate.toLocaleDateString() === dueDate.toLocaleDateString();

      let endDate = null;
      if (dueDate) {
        endDate = new Date(dueDate);
        if (!isSameDay && startDate) {
          const startDay = startDate.toLocaleDateString();
          const dueDay = dueDate.toLocaleDateString();
          if (startDay !== dueDay) {
            endDate.setDate(dueDate.getDate() + 1);
          }
        }
      }

      return {
        id: task._id,
        title: cleanedTitle,
        start: startDate,
        end: endDate,
        extendedProps: {
          originalTitle: task.title,
          status: task.status || "Not specified",
          priority: task.priority || "Not specified",
          description: task.description || "No description",
          startDate: startDate ? formatDateOnly(startDate) : "Not specified",
          dueDate: dueDate ? formatDateOnly(dueDate) : "Not specified",
          owner: task.owner || {
            username: "Unknown",
            avatar: null,
          },
          assignedTo: task.assignedTo || [],
          tags: task.tags || [],
          subtask: task.subtask || [],
          attachment: task.attachment || [],
          createdAt: task.createdAt,
        },
      };
    })
    .filter((event) => event.start);

  const handleEventClick = (info) => {
    setSelectedTask({
      title: info.event.title,
      status: info.event.extendedProps.status,
      priority: info.event.extendedProps.priority,
      startDate: info.event.extendedProps.startDate,
      dueDate: info.event.extendedProps.dueDate,
      description: info.event.extendedProps.description,
      owner: info.event.extendedProps.owner,
      assignedTo: info.event.extendedProps.assignedTo,
      tags: info.event.extendedProps.tags,
      subtask: info.event.extendedProps.subtask,
      attachment: info.event.extendedProps.attachment,
      createdAt: info.event.extendedProps.createdAt,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedTask(null);
  };

  // Ubah kunci menjadi huruf kecil semua untuk konsistensi
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    inprogress: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
  };

  const priorityColors = {
    low: "bg-gray-100 text-gray-800",
    medium: "bg-orange-200 text-orange-800 border-orange-300",
    high: "bg-red-100 text-red-800",
  };

  const statusBackgroundColors = {
    pending: "#FDE68A",
    inprogress: "#BFDBFE",
    completed: "#34D399",
  };

  const statusTextColors = {
    pending: "#975A16",
    inprogress: "#1E40AF",
    completed: "#065F46",
  };

  const getStatusIcon = (status) => {
    const normalizedStatus = status.toLowerCase(); // Normalisasi status
    switch (normalizedStatus) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "inprogress":
        return <Loader className="w-5 h-5 text-blue-500" />;
      case "completed":
        return <CircleCheck className="w-5 h-5 text-green-600" />;
      default:
        return null;
    }
  };

  // const formatRelativeTime = (date) => {
  //   if (!date) return "-";
  //   const now = new Date();
  //   const commentTime = new Date(date);
  //   const diffInSeconds = Math.floor((now - commentTime) / 1000);

  //   if (diffInSeconds < 60) {
  //     return `${diffInSeconds} seconds ago`;
  //   }
  //   const diffInMinutes = Math.floor(diffInSeconds / 60);
  //   if (diffInMinutes < 60) {
  //     return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
  //   }
  //   const diffInHours = Math.floor(diffInMinutes / 60);
  //   if (diffInHours < 24) {
  //     return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
  //   }
  //   const diffInDays = Math.floor(diffInHours / 24);
  //   if (diffInDays < 30) {
  //     return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
  //   }
  //   const diffInMonths = Math.floor(diffInDays / 30);
  //   if (diffInMonths < 12) {
  //     return `${diffInMonths} month${diffInMonths !== 1 ? "s" : ""} ago`;
  //   }
  //   const diffInYears = Math.floor(diffInMonths / 12);
  //   return `${diffInYears} year${diffInYears !== 1 ? "s" : ""} ago`;
  // };

  const getFileType = (filename) => {
    if (!filename) return "Unknown";
    const extension = filename.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif"].includes(extension)) return "Image";
    if (extension === "pdf") return "PDF";
    return "File";
  };

  return (
    <div className="min-h-screen flex items-center justify-center rounded-md mx-6 p-6 text-sm bg-white border border-borderPrimary">
      <style>
        {`
          .fc-day-today {
            background-color: transparent !important;
          }
          .fc-daygrid-day {
            background-color: transparent;
          }
          .fc-button, .fc-button-primary {
            background-color: #0E1422 !important;
            color: #FFFFFF !important;
            border-color: #0E1422 !important;
          }
          .fc-button:hover, .fc-button-primary:hover {
            background-color: #1A253F !important;
            border-color: #1A253F !important;
          }
          .fc-button:active, .fc-button-primary:active,
          .fc-button.fc-button-active, .fc-button-primary.fc-button-active {
            background-color: #08101A !important;
            border-color: #08101A !important;
          }
        `}
      </style>

      <div className="max-w-6xl mx-auto">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin]}
          initialView="dayGridMonth"
          events={events}
          eventClick={handleEventClick}
          eventContent={(info) => {
            const status = info.event.extendedProps.status
              .toLowerCase()
              .replace(/\s+/g, "");
            return {
              html: `
                <div style="background-color: ${
                  statusBackgroundColors[status] || "#D1D5DB"
                }; color: ${
                statusTextColors[status] || "#374151"
              }; border-radius: 4px; padding: 10px; width: 100%; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
                  <span style="font-weight: 500; font-size: 14px;">${
                    info.event.title
                  }</span>
                </div>
              `,
            };
          }}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "",
          }}
          buttonText={{ today: "Today" }}
          height="auto"
          className="bg-white rounded-md shadow-md p-4"
        />

        {/* Status Legend */}
        <div className="mt-10 flex flex-wrap gap-4 justify-center text-sm">
          <div className="flex items-center gap-2">
            <span
              className="w-5 h-5 rounded"
              style={{ backgroundColor: statusBackgroundColors.pending }}
            ></span>
            <span className="text-gray-700">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="w-5 h-5 rounded"
              style={{ backgroundColor: statusBackgroundColors.inprogress }}
            ></span>
            <span className="text-gray-700">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="w-5 h-5 rounded"
              style={{ backgroundColor: statusBackgroundColors.completed }}
            ></span>
            <span className="text-gray-700">Completed</span>
          </div>
        </div>
      </div>

      {/* Task Detail Modal */}
      {modalOpen && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="relative p-6">
              <div className="mb-4 pb-4 border-b border-borderPrimary w-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={closeModal}
                      className="border-r border-black-200 pr-2"
                      title="Close"
                    >
                      <X className="h-5 w-5 text-gray-600 hover:text-gray-800" />
                    </button>
                    <span className="text-gray-500 text-md">
                      Created on {formatDateOnly(selectedTask.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusIcon(selectedTask.status)}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-md p-2 mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    {selectedTask.title || "Tanpa judul"}
                  </h2>
                </div>

                <div className="mt-4 flex gap-2 flex-wrap">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                      statusColors[
                        selectedTask.status.toLowerCase().replace(/\s+/g, "")
                      ] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {selectedTask.status || "Unknown"}
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                      priorityColors[selectedTask.priority.toLowerCase()] ||
                      "bg-gray-100 text-gray-800 border-gray-200"
                    }`}
                  >
                    {selectedTask.priority
                      ? `${selectedTask.priority} Priority`
                      : "Unknown Priority"}
                  </span>
                </div>

                <div className="space-y-4 mt-5">
                  <div className="flex items-center gap-2">
                    <UserRoundPen className="h-5 w-5 text-gray-700" />
                    {selectedTask.owner ? (
                      <div className="flex items-center gap-2">
                        <span
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm"
                          style={{
                            backgroundColor: getInitialsAndColor(
                              selectedTask.owner.username
                            ).color,
                          }}
                        >
                          {selectedTask.owner.avatar ? (
                            <img
                              src={selectedTask.owner.avatar}
                              alt={selectedTask.owner.username}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            getInitialsAndColor(selectedTask.owner.username)
                              .initials
                          )}
                        </span>
                        <p className="capitalize bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                          {selectedTask.owner.username} (owner)
                        </p>
                      </div>
                    ) : (
                      "Unknown"
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <UsersRound className="h-5 w-5 text-gray-700" />
                    {Array.isArray(selectedTask.assignedTo) &&
                    selectedTask.assignedTo.length > 0 ? (
                      <div className="flex">
                        {selectedTask.assignedTo
                          .slice(0, 4)
                          .map((user, index) => {
                            const { initials, color } = getInitialsAndColor(
                              user.username
                            );
                            return (
                              <div
                                key={index}
                                className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-medium text-sm border-2 border-white ${
                                  index > 0 ? "ml-[-8px]" : ""
                                }`}
                                style={{
                                  backgroundColor: color,
                                  zIndex:
                                    selectedTask.assignedTo.length - index,
                                }}
                                title={user.username}
                              >
                                {user.avatar ? (
                                  <img
                                    src={user.avatar}
                                    alt={user.username}
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  <span className="w-full h-full flex items-center justify-center">
                                    {initials}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        {selectedTask.assignedTo.length > 4 && (
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-200 text-gray-600 font-medium text-xs border-2 border-white ml-[-8px]"
                            title={`${selectedTask.assignedTo.length - 4} more`}
                          >
                            +{selectedTask.assignedTo.length - 4}
                          </div>
                        )}
                      </div>
                    ) : (
                      "-"
                    )}
                  </div>
                  <div className="flex gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CalendarClock className="h-5 w-5 text-gray-700" />
                      <p className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                        {selectedTask.startDate}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarCheck2 className="h-5 w-5 text-gray-700" />
                      <p className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                        {selectedTask.dueDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 text-sm">
                    <Tags className="h-5 w-5 text-gray-700" />
                    <p className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                      {Array.isArray(selectedTask.tags) &&
                      selectedTask.tags.length > 0
                        ? selectedTask.tags.join(", ")
                        : "-"}
                    </p>
                  </div>
                </div>

                {Array.isArray(selectedTask.attachment) &&
                  selectedTask.attachment.length > 0 && (
                    <div className="mt-6">
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-5 w-5 text-gray-700" />
                        <h1 className="text-md font-semibold text-font1">
                          Attachment ({selectedTask.attachment.length})
                        </h1>
                      </div>
                      <div className="mt-2 border border-borderPrimary p-4 rounded-md bg-white">
                        <div className="space-y-4">
                          {selectedTask.attachment.map((attachment, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-3 w-full"
                            >
                              <div className="mr-2">
                                {getFileType(attachment.originalName) ===
                                "PDF" ? (
                                  <svg
                                    className="w-6 h-6 text-red-500"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h7v5h5v11H6z" />
                                  </svg>
                                ) : getFileType(attachment.originalName) ===
                                  "Image" ? (
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
                                  {attachment.originalName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {getFileType(attachment.originalName)} ·{" "}
                                  {attachment.size || "N/A"}mb
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                <div className="mt-6">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gray-700" />
                    <h1 className="text-md font-semibold text-font1">
                      Task Description
                    </h1>
                  </div>
                  <p className="p-4 text-justify text-gray-600 mt-2 border border-borderPrimary text-sm rounded-md">
                    {selectedTask.description || "Tanpa deskripsi"}
                  </p>
                </div>

                <div className="mt-6">
                  <div className="flex items-center gap-2">
                    <ListTodo className="h-5 w-5 text-gray-700" />
                    <h1 className="text-md font-semibold text-font1">
                      Subtasks
                    </h1>
                  </div>
                  {Array.isArray(selectedTask.subtask) &&
                  selectedTask.subtask.length > 0 ? (
                    <div className="mt-2 border border-borderPrimary p-4 rounded-md bg-white">
                      <ul className="space-y-2 text-[14px]">
                        {selectedTask.subtask.map((sub, index) => (
                          <li
                            key={index}
                            className="flex items-center gap-2 text-gray-600"
                          >
                            <input
                              type="checkbox"
                              checked={sub.completed}
                              readOnly
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                            />
                            <span
                              className={
                                sub.completed
                                  ? "line-through text-gray-400"
                                  : ""
                              }
                            >
                              {sub.title}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-gray-500 mt-2">No subtasks.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
