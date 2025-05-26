import { useState, useEffect, useRef } from "react";
import {
  fetchTaskById,
  addComment,
  updateTask,
  addCommentReply,
  fetchRecentActivity,
  downloadFile,
} from "../utils/apiTask";
import { getAllUsers } from "../utils/apiAuth";
import { getInitialsAndColor, getFileType } from "../utils/helpers";
import Select from "react-select";
import { toast } from "react-hot-toast";
import {
  Activity,
  CalendarCheck2,
  CalendarClock,
  CircleCheck,
  Clock,
  CloudDownload,
  FilePenLine,
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
  Upload,
} from "lucide-react";

function TaskDetail({ taskId, onClose, onTaskUpdated }) {
  const [task, setTask] = useState(null);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState("");
  const [replyInputs, setReplyInputs] = useState({});
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "pending",
    priority: "low",
    tags: "",
    startDate: "",
    dueDate: "",
    assignedTo: [],
    subtask: [],
    attachment: [],
  });
  const [users, setUsers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [activities, setActivities] = useState([]);
  const [activeTab, setActiveTab] = useState("subtasks");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    loadTask();
    loadUsers();
    loadRecentActivity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  const loadTask = async () => {
    try {
      const data = await fetchTaskById(taskId);
      setTask(data);
      setFormData({
        title: data.title || "",
        description: data.description || "",
        status: data.status || "pending",
        priority: data.priority || "low",
        tags: data.tags ? data.tags.join(",") : "",
        startDate: data.startDate ? data.startDate.split("T")[0] : "",
        dueDate: data.dueDate ? data.dueDate.split("T")[0] : "",
        assignedTo: data.assignedTo
          ? data.assignedTo.map((user) => user._id)
          : [],
        subtask: data.subtask
          ? data.subtask.map((sub) => ({
              title: sub.title,
              completed: sub.completed || false,
            }))
          : [],
        attachment: [],
      });
    } catch (err) {
      toast.error(err.message || "Error fetching task.");
      console.error("Error fetching task:", err);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Error fetching users.");
      console.error("Error fetching users:", err);
    }
  };

  const loadRecentActivity = async () => {
    try {
      const data = await fetchRecentActivity(10);
      const relevantActivities = data.filter(
        (activity) => activity.taskId === taskId
      );
      setActivities(relevantActivities);
    } catch (err) {
      toast.error("Error fetching recent activity.");
      console.error("Error fetching recent activity:", err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error("Comment cannot be empty.");
      return;
    }
    try {
      await addComment(taskId, comment.trim());
      setComment("");
      toast.success("Comment Added!");
      loadTask();
      loadRecentActivity();
    } catch (err) {
      toast.error(err.message || "Error creating comment.");
      console.error("Error adding comment:", err);
    }
  };

  const handleReplySubmit = async (commentId, inputId, e) => {
    e.preventDefault();
    const replyText = replyInputs[inputId]?.trim();
    if (!replyText) {
      toast.error("Reply cannot be empty.");
      return;
    }
    try {
      await addCommentReply(taskId, commentId, replyText);
      setReplyInputs((prev) => ({ ...prev, [inputId]: "" }));
      toast.success("Reply Added!");
      loadTask();
      loadRecentActivity();
    } catch (err) {
      toast.error(err.message || "Error creating reply.");
      console.error("Error adding reply:", err);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Title cannot be empty.");
      return;
    }
    try {
      const taskData = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        tags: formData.tags
          ? formData.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag)
          : [],
        startDate: formData.startDate || undefined,
        dueDate: formData.dueDate || undefined,
        assignedTo: formData.assignedTo.length > 0 ? formData.assignedTo : [],
        subtask: formData.subtask,
        attachment:
          formData.attachment.length > 0 ? formData.attachment : undefined,
      };
      await updateTask(taskId, taskData);
      setIsEditing(false);
      toast.success("Task Successfully Updated!");
      loadTask();
      loadRecentActivity();
      onTaskUpdated();
    } catch (err) {
      toast.error(err.message || "Error updating task.");
      console.error("Error updating task:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (files) => {
    const newFiles = Array.from(files).filter((file) =>
      ["image/jpeg", "image/png", "application/pdf"].includes(file.type)
    );
    if (newFiles.length !== files.length) {
      toast.error("Only JPEG, PNG, and PDF files are allowed.");
    }
    if (newFiles.length > 0) {
      setFormData((prev) => ({
        ...prev,
        attachment: [...prev.attachment, ...newFiles],
      }));
      toast.success(`${newFiles.length} file(s) uploaded successfully!`);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileChange(files);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
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
  //   return action;
  // };

  const handleRemoveFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      attachment: prev.attachment.filter((_, i) => i !== index),
    }));
  };

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "inProgress", label: "In Progress" },
    { value: "completed", label: "Completed" },
  ];

  const priorityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
  ];

  const userOptions = Array.isArray(users)
    ? users.map((user) => ({
        value: user._id,
        label: user.username,
      }))
    : [];

  const handleStatusChange = (selectedOption) => {
    setFormData({
      ...formData,
      status: selectedOption ? selectedOption.value : "pending",
    });
  };

  const handlePriorityChange = (selectedOption) => {
    setFormData({
      ...formData,
      priority: selectedOption ? selectedOption.value : "low",
    });
  };

  const handleAssignedToChange = (selectedOptions) => {
    const selectedValues = selectedOptions
      ? selectedOptions.map((option) => option.value)
      : [];
    setFormData({ ...formData, assignedTo: selectedValues });
  };

  const handleSubtaskChange = (index, value) => {
    const updatedSubtasks = [...formData.subtask];
    updatedSubtasks[index] = { ...updatedSubtasks[index], title: value };
    setFormData({ ...formData, subtask: updatedSubtasks });
  };

  const handleSubtaskToggle = async (index) => {
    const updatedSubtasks = [...formData.subtask];
    updatedSubtasks[index] = {
      ...updatedSubtasks[index],
      completed: !updatedSubtasks[index].completed,
    };
    setFormData({ ...formData, subtask: updatedSubtasks });

    try {
      const taskData = {
        subtask: updatedSubtasks,
      };
      await updateTask(taskId, taskData);
      toast.success("Subtask updated successfully!");
      loadTask();
      loadRecentActivity();
      onTaskUpdated();
    } catch (err) {
      toast.error(err.message || "Error updating subtask.");
      console.error("Error updating subtask:", err);
    }
  };

  const addSubtask = () => {
    setFormData({
      ...formData,
      subtask: [...formData.subtask, { title: "", completed: false }],
    });
  };

  const removeSubtask = (index) => {
    setFormData({
      ...formData,
      subtask: formData.subtask.filter((_, i) => i !== index),
    });
  };

  const handleReplyInputChange = (id, value) => {
    setReplyInputs((prev) => ({ ...prev, [id]: value }));
  };

  const handleDownload = async (fileName) => {
    try {
      await downloadFile(taskId, fileName);
    } catch (err) {
      setError(`Error downloading file: ${error.message}`);
      console.error("Error downloading file:", err.message);
    }
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    inProgress: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
  };

  const priorityColors = {
    low: "bg-gray-100 text-gray-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "inProgress":
        return <Loader className="w-5 h-5 text-blue-500" />;
      case "completed":
        return <CircleCheck className="w-5 h-5 text-green-600" />;
      default:
        return null;
    }
  };

  const formatDateOnly = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("in-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    });
  };

  const formatRelativeTime = (date) => {
    if (!date) return "-";
    const now = new Date();
    const commentTime = new Date(date);
    const diffInSeconds = Math.floor((now - commentTime) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    }
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
    }
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
    }
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
    }
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths !== 1 ? "s" : ""} ago`;
    }
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} year${diffInYears !== 1 ? "s" : ""} ago`;
  };

  const completedCount = formData.subtask.filter((sub) => sub.completed).length;
  const totalCount = formData.subtask.length;
  const progressRatio = `${completedCount}/${totalCount || 1}`;

  if (!task)
    return (
      <div className="flex justify-center items-center py-10">
        <Loader className="h-8 w-8 text-font1 animate-spin" />
      </div>
    );

  return (
    <div className="relative p-6">
      <div className="mb-4 pb-4 border-b border-borderPrimary w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="border-r border-black-200 pr-2"
              title="Close"
            >
              <X className="h-5 w-5 text-gray-600 hover:text-gray-800" />
            </button>
            {task && (
              <span className="text-gray-500 text-md">
                Created on {formatDateOnly(task.createdAt)}
              </span>
            )}
          </div>
          {!isEditing && task && (
            <div className="flex items-center gap-4">
              {getStatusIcon(task.status)}
              <button onClick={() => setIsEditing(true)}>
                <SquarePen className="w-5 h-5 inline-block mr-1 text-gray-600 hover:text-gray-800" />
              </button>
            </div>
          )}
        </div>
      </div>

      {task && (
        <div className="bg-white rounded-md p-2 mb-4">
          {isEditing ? (
            <form onSubmit={handleUpdateSubmit} className="grid gap-4">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                Edit Tugas
              </h3>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Judul tugas"
                className="p-2 text-sm border border-r-borderPrimary rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Deskripsi (opsional)"
                className="p-2 text-sm border border-r-borderPrimary rounded-md focus:ring-2 focus:ring-blue-500"
                rows="4"
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <Select
                    options={statusOptions}
                    value={statusOptions.find(
                      (option) => option.value === formData.status
                    )}
                    onChange={handleStatusChange}
                    placeholder="Pilih status..."
                    className="text-sm"
                    classNamePrefix="react-select"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <Select
                    options={priorityOptions}
                    value={priorityOptions.find(
                      (option) => option.value === formData.priority
                    )}
                    onChange={handlePriorityChange}
                    placeholder="Pilih prioritas..."
                    className="text-sm"
                    classNamePrefix="react-select"
                  />
                </div>
              </div>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="Tags, pisahkan dengan koma (opsional)"
                className="p-2 text-sm border border-borderPrimary rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="p-2 text-sm border border-borderPrimary rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="p-2 text-sm border border-borderPrimary rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned To
                </label>
                <Select
                  options={userOptions}
                  isMulti
                  value={userOptions.filter((option) =>
                    formData.assignedTo.includes(option.value)
                  )}
                  onChange={handleAssignedToChange}
                  placeholder="Pilih pengguna..."
                  className="text-sm"
                  classNamePrefix="react-select"
                />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Subtasks
                </h4>
                {formData.subtask.map((sub, index) => (
                  <div
                    key={index}
                    className="flex gap-2 mb-2 items-center text-sm"
                  >
                    <input
                      type="text"
                      value={sub.title}
                      onChange={(e) =>
                        handleSubtaskChange(index, e.target.value)
                      }
                      placeholder="Judul subtugas"
                      className="p-2 border border-borderPrimary rounded-md focus:ring-2 focus:ring-blue-500 flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeSubtask(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSubtask}
                  className="text-blue-600 hover:underline text-sm"
                >
                  + Add Subtask
                </button>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Attachments
                </h4>
                <div
                  className={`border-2 border-dashed rounded-md p-6 text-center transition-all duration-200 ${
                    isDragging
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 bg-gray-50"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload
                    className={`mx-auto h-10 w-10 ${
                      isDragging ? "text-blue-500" : "text-gray-400"
                    }`}
                  />
                  <p className="mt-2 text-sm text-gray-600">
                    Drag & drop files here, or{" "}
                    <button
                      type="button"
                      onClick={handleUploadClick}
                      className="text-blue-600 hover:underline"
                    >
                      browse
                    </button>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Supports JPEG, PNG, and PDF files
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handleFileChange(e.target.files)}
                    multiple
                    accept="image/jpeg,image/png,application/pdf"
                    className="hidden"
                  />
                </div>
                {formData.attachment.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {formData.attachment.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-100 p-2 rounded-md"
                      >
                        <div className="flex items-center gap-2">
                          {file.type === "application/pdf" ? (
                            <svg
                              className="w-6 h-6 text-red-500"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h7v5h5v11H6z" />
                            </svg>
                          ) : (
                            <svg
                              className="w-6 h-6 text-blue-500"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                            </svg>
                          )}
                          <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(file.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="text-xs mt-2 bg-font1 text-white px-4 py-2 rounded-md hover:border hover:border-font1 hover:bg-white hover:text-font1 transition duration-200 "
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs mt-2 border border-font1 text-black px-4 py-2 rounded-md  hover:bg-font1 hover:text-white transition duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">
                  {task.title || "Tanpa judul"}
                </h2>
              </div>

              <div className="mt-4 flex gap-2 flex-wrap">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                    statusColors[task.status] || "bg-gray-100 text-gray-800"
                  }`}
                >
                  {task.status || "Unknown"}
                </span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                    priorityColors[task.priority] ||
                    "bg-gray-100 text-gray-800 border-gray-200"
                  }`}
                >
                  {task.priority
                    ? `${task.priority} Priority`
                    : "Unknown Priority"}
                </span>
              </div>

              <div className="space-y-4 mt-5">
                <div className="flex items-center gap-2">
                  <UserRoundPen className="h-5 w-5 text-gray-700" />
                  {task.owner ? (
                    <div className="flex items-center gap-2">
                      <span
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm"
                        style={{
                          backgroundColor: getInitialsAndColor(
                            task.owner.username
                          ).color,
                        }}
                      >
                        {task.owner.avatar ? (
                          <img
                            src={task.owner.avatar}
                            alt={task.owner.username}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          getInitialsAndColor(task.owner.username).initials
                        )}
                      </span>
                      <p className="capitalize bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                        {task.owner.username} (owner)
                      </p>
                    </div>
                  ) : (
                    "Unknown"
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <UsersRound className="h-5 w-5 text-gray-700" />
                  {Array.isArray(task.assignedTo) &&
                  task.assignedTo.length > 0 ? (
                    <div className="flex">
                      {task.assignedTo.map((user, index) => {
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
                              zIndex: task.assignedTo.length - index,
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
                    </div>
                  ) : (
                    "-"
                  )}
                </div>
                <div className="flex gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarClock className="h-5 w-5 text-gray-700" />
                    <p className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                      {formatDateOnly(task.startDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarCheck2 className="h-5 w-5 text-gray-700" />
                    <p className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                      {formatDateOnly(task.dueDate)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 text-sm ">
                  <Tags className="h-5 w-5 text-gray-700" />
                  <p className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                    {Array.isArray(task.tags) && task.tags.length > 0
                      ? task.tags.join(", ")
                      : "-"}
                  </p>
                </div>
              </div>
              {Array.isArray(task.attachment) && task.attachment.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center gap-2">
                    <Paperclip className="h-5 w-5 text-gray-700" />
                    <h1 className="text-md font-semibold text-font1 ">
                      Attachment ({task.attachment.length})
                    </h1>
                  </div>
                  <div className="mt-2 border border-borderPrimary p-4 rounded-md bg-white">
                    <div className="space-y-4 h-auto pr-2">
                      {(isPreviewOpen
                        ? task.attachment
                        : task.attachment.slice(0, 2)
                      ).map((attachment, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 w-full"
                        >
                          <div className="mr-2">
                            {getFileType(attachment.originalName) === "PDF" ? (
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
                          <button
                            onClick={() =>
                              handleDownload(attachment.originalName)
                            }
                            className="text-blue-600 hover:underline text-sm"
                          >
                            <CloudDownload className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {task.attachment.length > 2 && (
                    <button
                      onClick={() => setIsPreviewOpen(!isPreviewOpen)}
                      className="mt-2 text-blue-600 hover:underline text-sm"
                    >
                      {isPreviewOpen
                        ? "Hide attachments"
                        : "Preview all attachments"}
                    </button>
                  )}
                  <div className="mt-6">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-gray-700" />
                      <h1 className="text-md font-semibold text-font1">
                        Task Description
                      </h1>
                    </div>
                    <p className="p-4 text-justify text-gray-600 mt-2 border border-borderPrimary text-sm rounded-md">
                      {task.description || "Tanpa deskripsi"}
                    </p>
                  </div>
                </div>
              )}
              <div className="mt-6">
                <div className="flex border-b border-gray-200 mb-4 text-sm">
                  <button
                    className={`flex items-center px-4 py-2 ${
                      activeTab === "subtasks"
                        ? "border-b-2 border-blue-600 text-blue-600"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                    onClick={() => setActiveTab("subtasks")}
                  >
                    Subtasks
                  </button>
                  <button
                    className={`flex items-center px-4 py-2 ${
                      activeTab === "comments"
                        ? "border-b-2 border-blue-600 text-blue-600"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                    onClick={() => setActiveTab("comments")}
                  >
                    Comments
                  </button>
                  <button
                    className={`flex items-center px-4 py-2 ${
                      activeTab === "recentActivity"
                        ? "border-b-2 border-blue-600 text-blue-600"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                    onClick={() => setActiveTab("recentActivity")}
                  >
                    Recent Activity
                  </button>
                </div>

                {activeTab === "subtasks" && (
                  <div>
                    {Array.isArray(task.subtask) && task.subtask.length > 0 ? (
                      <div className=" border border-borderPrimary p-4 rounded-md bg-white">
                        <div className="mb-2 text-sm flex items-center gap-2 border-b border-borderPrimary pb-2">
                          <ListTodo className="h-5 w-5 text-gray-700" />
                          <span className="mr-2">Subtask</span>
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{
                                  width: `${
                                    (completedCount / totalCount) * 100
                                  }%`,
                                }}
                              ></div>
                            </div>
                          </div>
                          <span className="ml-2 text-sm text-gray-600">
                            {progressRatio}
                          </span>
                        </div>
                        <ul className="mt-2 space-y-2 text-[14px]">
                          {formData.subtask.map((sub, index) => (
                            <li
                              key={index}
                              className="flex items-center gap-2 text-gray-600"
                            >
                              <input
                                type="checkbox"
                                checked={sub.completed}
                                onChange={() => handleSubtaskToggle(index)}
                                className="cursor-pointer w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                disabled={isEditing}
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
                      <p className="text-gray-500">No subtasks.</p>
                    )}
                  </div>
                )}
                {activeTab === "comments" && (
                  <div>
                    <div className="mt-4 text-sm">
                      {Array.isArray(task.comments) &&
                      task.comments.length > 0 ? (
                        task.comments.map((c, index) => (
                          <div key={index} className="border-t pt-2 mt-2">
                            <p className="flex items-center gap-2">
                              <span
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium"
                                style={{
                                  backgroundColor: getInitialsAndColor(
                                    c.user?.username
                                  ).color,
                                }}
                              >
                                {c.user?.avatar ? (
                                  <img
                                    src={c.user.avatar}
                                    alt={c.user.username}
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  getInitialsAndColor(c.user?.username).initials
                                )}
                              </span>
                              <p className="font-semibold">
                                {c.user?.username || "Unknown"}
                              </p>
                              <span className="text-gray-500">
                                {formatRelativeTime(c.createdAt)}
                              </span>
                            </p>
                            <p className="text-gray-600 ml-10">{c.comment}</p>
                            <button
                              onClick={() =>
                                setReplyInputs((prev) => ({
                                  ...prev,
                                  [c._id]: prev[c._id] || "",
                                }))
                              }
                              className="text-blue-600 hover:underline text-sm mt-1 ml-10"
                            >
                              Reply
                            </button>
                            {replyInputs[c._id] !== undefined && (
                              <form
                                onSubmit={(e) =>
                                  handleReplySubmit(c._id, c._id, e)
                                }
                                className="mt-2 ml-14 text-sm"
                              >
                                <textarea
                                  value={replyInputs[c._id] || ""}
                                  onChange={(e) =>
                                    handleReplyInputChange(
                                      c._id,
                                      e.target.value
                                    )
                                  }
                                  placeholder="Tulis balasan..."
                                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                                  rows="3"
                                />
                                <div className="flex gap-2">
                                  <button
                                    type="submit"
                                    className="text-xs mt-2 bg-font1 text-white px-4 py-2 rounded-md hover:border hover:border-font1 hover:bg-white hover:text-font1 transition duration-200 "
                                  >
                                    Send Reply
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setReplyInputs((prev) => {
                                        const { [c._id]: _, ...rest } = prev;
                                        return rest;
                                      })
                                    }
                                    className="text-xs mt-2 border border-font1 text-black px-4 py-2 rounded-md  hover:bg-font1 hover:text-white transition duration-200"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </form>
                            )}
                            {Array.isArray(c.replies) &&
                              c.replies.length > 0 && (
                                <div className="ml-14 mt-2 text-sm">
                                  {c.replies.map((reply, replyIndex) => (
                                    <div
                                      key={replyIndex}
                                      className="border-t pt-2 mt-2"
                                    >
                                      <p className="flex items-center gap-2">
                                        <span
                                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium"
                                          style={{
                                            backgroundColor:
                                              getInitialsAndColor(
                                                reply.user?.username
                                              ).color,
                                          }}
                                        >
                                          {reply.user?.avatar ? (
                                            <img
                                              src={reply.user.avatar}
                                              alt={reply.user.username}
                                              className="w-full h-full rounded-full object-cover"
                                            />
                                          ) : (
                                            getInitialsAndColor(
                                              reply.user?.username
                                            ).initials
                                          )}
                                        </span>
                                        <strong>
                                          {reply.user?.username || "Unknown"}
                                        </strong>
                                        <span className="text-gray-500">
                                          {formatRelativeTime(reply.createdAt)}
                                        </span>
                                      </p>
                                      <p className="text-gray-600 ml-10">
                                        {reply.comment}
                                      </p>
                                      <button
                                        onClick={() =>
                                          setReplyInputs((prev) => ({
                                            ...prev,
                                            [reply._id]: prev[reply._id] || "",
                                          }))
                                        }
                                        className="text-blue-600 hover:underline text-sm mt-1 ml-10"
                                      >
                                        Reply
                                      </button>
                                      {replyInputs[reply._id] !== undefined && (
                                        <form
                                          onSubmit={(e) =>
                                            handleReplySubmit(
                                              c._id,
                                              reply._id,
                                              e
                                            )
                                          }
                                          className="mt-2 ml-14"
                                        >
                                          <textarea
                                            value={replyInputs[reply._id] || ""}
                                            onChange={(e) =>
                                              handleReplyInputChange(
                                                reply._id,
                                                e.target.value
                                              )
                                            }
                                            placeholder="Tulis balasan..."
                                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                                            rows="3"
                                          />
                                          <div className="flex gap-2">
                                            <button
                                              type="submit"
                                              className="text-xs mt-2 bg-font1 text-white px-4 py-2 rounded-md hover:border hover:border-font1 hover:bg-white hover:text-font1 transition duration-200"
                                            >
                                              Send Reply
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                setReplyInputs((prev) => {
                                                  const {
                                                    [reply._id]: _,
                                                    ...rest
                                                  } = prev;
                                                  return rest;
                                                })
                                              }
                                              className="text-xs mt-2 border border-font1 text-black px-4 py-2 rounded-md  hover:bg-font1 hover:text-white transition duration-200"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </form>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">No comments.</p>
                      )}
                    </div>
                    <form
                      onSubmit={handleCommentSubmit}
                      className="mt-4 text-sm"
                    >
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Tambah komentar"
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                        rows="4"
                      />
                      <button
                        type="submit"
                        className="text-xs mt-2 bg-font1 text-white px-4 py-2 rounded-md hover:border hover:border-font1 hover:bg-white hover:text-font1 transition duration-200"
                      >
                        Send
                      </button>
                    </form>
                  </div>
                )}
                {activeTab === "recentActivity" && (
                  <div>
                    <div className="border border-borderPrimary p-5 rounded-md bg-white ">
                      <div
                        className={`space-y-4 ${
                          activities.length === 0
                            ? "h-auto"
                            : activities.length > 3
                            ? "h-[350px]"
                            : ""
                        } overflow-y-auto pr-2`}
                      >
                        {activities.length > 0 ? (
                          activities.map((activity, index) => (
                            <div key={index} className="flex items-start gap-3">
                              {activity.files && activity.files.length > 0 ? (
                                <div className="flex items-start gap-3 w-full">
                                  <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 mt-1"
                                    style={{
                                      backgroundColor: getInitialsAndColor(
                                        activity.user
                                      ).color,
                                    }}
                                  >
                                    {
                                      getInitialsAndColor(activity.user)
                                        .initials
                                    }
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm text-gray-600">
                                      {activity.action}{" "}
                                    </p>
                                    <div className="mt-2 w-[350px]">
                                      {activity.files.map((file, fileIndex) => (
                                        <div
                                          key={fileIndex}
                                          className="flex items-center bg-gray-100 p-2 rounded-md mb-2"
                                        >
                                          <div className="mr-2 ">
                                            {getFileType(file.name) ===
                                            "PDF" ? (
                                              <svg
                                                className="w-6 h-6 text-red-500"
                                                fill="currentColor"
                                                viewBox="0 0 24 24"
                                              >
                                                <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h7v5h5v11H6z" />
                                              </svg>
                                            ) : getFileType(file.name) ===
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
                                              {file.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                              {getFileType(file.name)} ·{" "}
                                              {file.size || "N/A"}mb
                                            </p>
                                          </div>
                                          <button
                                            onClick={() =>
                                              handleDownload(file.name)
                                            }
                                            className="text-blue-600 hover:underline text-sm"
                                          >
                                            <CloudDownload className="w-5 h-5" />
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
                                      backgroundColor: getInitialsAndColor(
                                        activity.user
                                      ).color,
                                    }}
                                  >
                                    {
                                      getInitialsAndColor(activity.user)
                                        .initials
                                    }
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm text-gray-600">
                                      {activity.action}{" "}
                                    </p>
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
                          <div className="flex items-center justify-center gap-2">
                            <Activity className="w-6 h-6 text-gray-500" />
                            <p className="text-gray-500 text-center py-4">
                              No recent activity
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default TaskDetail;
