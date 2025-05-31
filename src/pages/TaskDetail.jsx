import { useState, useEffect, useRef, useCallback } from "react";
import {
  fetchTaskById,
  addComment,
  updateTask,
  addCommentReply,
  fetchRecentActivity,
  downloadFile,
} from "../utils/apiTask";
// import { formatDistanceToNow } from "date-fns";
// import { id } from "date-fns/locale";
import { toast } from "react-hot-toast";
import CreatableSelect from "react-select/creatable";
import Select from "react-select";
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
  Upload,
} from "lucide-react";
import { getInitialsAndColor, getFileType } from "../utils/helpers";

function TaskDetail({ taskId, onClose, onTaskUpdated }) {
  const [task, setTask] = useState(null);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState("");
  const [replyInputs, setReplyInputs] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [activities, setActivities] = useState([]);
  const [activeTab, setActiveTab] = useState("subtasks");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [currentTextarea, setCurrentTextarea] = useState(null);

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

  const fileInputRef = useRef(null);

  const loadTask = useCallback(async () => {
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
          ? data.assignedTo.map((user) => user.email)
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
      toast.error("Error fetching task.");
      setError(err.message);
    }
  }, [taskId]);

  const loadRecentActivity = useCallback(async () => {
    try {
      const data = await fetchRecentActivity(10);
      setActivities(data.filter((activity) => activity.taskId === taskId));
    } catch (err) {
      toast.error("Error fetching recent activity.");
      setError(err.message);
    }
  }, [taskId]);

  useEffect(() => {
    loadTask();
    loadRecentActivity();
  }, [loadTask, loadRecentActivity]);

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Title is required.");
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
              .filter(Boolean)
          : [],
        startDate: formData.startDate || undefined,
        dueDate: formData.dueDate || undefined,
        assignedTo: formData.assignedTo.filter(Boolean),
        subtask: formData.subtask.filter((sub) => sub.title.trim()),
        attachment: formData.attachment.length
          ? formData.attachment
          : undefined,
      };
      await updateTask(taskId, taskData);
      setIsEditing(false);
      toast.success("Task updated!");
      loadTask();
      loadRecentActivity();
      onTaskUpdated();
    } catch (err) {
      toast.error("Failed to update task.");
      setError(err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (files) => {
    const newFiles = Array.from(files).filter((file) =>
      ["image/jpeg", "image/png", "application/pdf"].includes(file.type)
    );
    if (newFiles.length !== files.length) {
      toast.error("Only JPEG, PNG, and PDF files are allowed.");
    }
    if (newFiles.length) {
      setFormData((prev) => ({
        ...prev,
        attachment: [...prev.attachment, ...newFiles],
      }));
      toast.success(`${newFiles.length} file(s) added.`);
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
    handleFileChange(e.dataTransfer.files);
  };

  const handleUploadClick = () => fileInputRef.current.click();

  const handleRemoveFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      attachment: prev.attachment.filter((_, i) => i !== index),
    }));
  };

  const handleSubtaskChange = (index, value) => {
    const updatedSubtasks = [...formData.subtask];
    updatedSubtasks[index] = { ...updatedSubtasks[index], title: value };
    setFormData((prev) => ({ ...prev, subtask: updatedSubtasks }));
  };

  const handleSubtaskToggle = async (index) => {
    const updatedSubtasks = [...formData.subtask];
    updatedSubtasks[index].completed = !updatedSubtasks[index].completed;
    setFormData((prev) => ({ ...prev, subtask: updatedSubtasks }));
    try {
      await updateTask(taskId, { subtask: updatedSubtasks });
      toast.success("Subtask updated.");
      loadTask();
      loadRecentActivity();
      onTaskUpdated();
    } catch (err) {
      console.error("Error updating subtask:", err);
      toast.error("Error updating subtask.");
    }
  };

  const addSubtask = () => {
    setFormData((prev) => ({
      ...prev,
      subtask: [...prev.subtask, { title: "", completed: false }],
    }));
  };

  const removeSubtask = (index) => {
    setFormData((prev) => ({
      ...prev,
      subtask: prev.subtask.filter((_, i) => i !== index),
    }));
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
      toast.success("Comment added.");
      loadTask();
      loadRecentActivity();
    } catch (err) {
      console.error("Error adding comment:", err);
      toast.error("Error adding comment.");
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
      toast.success("Reply added.");
      loadTask();
      loadRecentActivity();
    } catch (err) {
      console.error("Error adding reply:", err);
      toast.error("Error adding reply.");
    }
  };

  const handleDownload = async (fileName) => {
    try {
      await downloadFile(taskId, fileName);
    } catch (err) {
      toast.error(`Error downloading file: ${err.message}`);
    }
  };

  const handleMentionInput = (value) => {
    setComment(value);
    const lastWord = value.trim().split(/\s+/).pop();
    if (lastWord.startsWith("@")) {
      const searchTerm = lastWord.slice(1).toLowerCase();
      const assignedUsers = task?.assignedTo
        ?.filter((user) => user?.username?.toLowerCase().includes(searchTerm))
        .map((user) => ({
          _id: user._id,
          username: user.username,
          email: user.email,
        }));
      const ownerUser = task?.owner?.username
        ?.toLowerCase()
        .includes(searchTerm)
        ? [
            {
              _id: task.owner._id,
              username: task.owner.username,
              email: task.owner.email,
            },
          ]
        : [];
      const uniqueUsers = [
        ...new Map(
          [...assignedUsers, ...ownerUser].map((user) => [user._id, user])
        ).values(),
      ];
      setSuggestions(uniqueUsers);
      setShowSuggestions(true);
      setCurrentTextarea("comment");
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
      setCurrentTextarea(null);
    }
  };

  const handleReplyInputChange = (id, value) => {
    setReplyInputs((prev) => ({ ...prev, [id]: value }));
    const lastWord = value.split(" ").pop();
    if (lastWord.startsWith("@")) {
      const searchTerm = lastWord.slice(1).toLowerCase();
      const assignedUsers = task?.assignedTo
        ? task.assignedTo
            .filter((user) => user.username?.toLowerCase().includes(searchTerm))
            .map((user) => ({
              _id: user._id,
              username: user.username,
              email: user.email,
            }))
        : [];
      const ownerUser = task?.owner?.username
        ?.toLowerCase()
        .includes(searchTerm)
        ? [
            {
              _id: task.owner._id,
              username: task.owner.username,
              email: task.owner.email,
            },
          ]
        : [];
      const uniqueUsers = [
        ...new Map(
          [...assignedUsers, ...ownerUser].map((user) => [user._id, user])
        ).values(),
      ];
      setSuggestions(uniqueUsers);
      setShowSuggestions(true);
      setCurrentTextarea(id);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
      setCurrentTextarea(null);
    }
  };

  const handleSelectMention = (user) => {
    const textareaValue =
      currentTextarea === "comment"
        ? comment
        : replyInputs[currentTextarea] || "";
    const lastAtIndex = textareaValue.lastIndexOf("@");
    const newValue =
      textareaValue.substring(0, lastAtIndex) + `@${user.username} `;
    if (currentTextarea === "comment") {
      setComment(newValue);
    } else {
      setReplyInputs((prev) => ({ ...prev, [currentTextarea]: newValue }));
    }
    setShowSuggestions(false);
    setSuggestions([]);
    setCurrentTextarea(null);
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

  const handleStatusChange = (option) => {
    setFormData((prev) => ({ ...prev, status: option?.value || "pending" }));
  };

  const handlePriorityChange = (option) => {
    setFormData((prev) => ({ ...prev, priority: option?.value || "low" }));
  };

  const handleAssignedToChange = (options) => {
    setFormData((prev) => ({
      ...prev,
      assignedTo: options ? options.map((opt) => opt.value) : [],
    }));
  };

  const formatDateOnly = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    });
  };

  const formatRelativeTime = (date) => {
    if (!date) return "-";
    try {
      const time = new Date(date);
      if (isNaN(time.getTime())) return "-"; // Tangani tanggal tidak valid
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);
      if (diffInSeconds < 0) return "Just now"; // Tangani waktu di masa depan
      if (diffInSeconds < 60)
        return `${diffInSeconds} second${diffInSeconds !== 1 ? "s" : ""} ago`;
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60)
        return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24)
        return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 30)
        return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
      const diffInMonths = Math.floor(diffInDays / 30);
      if (diffInMonths < 12)
        return `${diffInMonths} month${diffInMonths !== 1 ? "s" : ""} ago`;
      const diffInYears = Math.floor(diffInMonths / 12);
      return `${diffInYears} year${diffInYears !== 1 ? "s" : ""} ago`;
    } catch (err) {
      console.error("Error parsing date:", err);
      return "-";
    }
  };

  const parseTextWithMentions = (text) => {
    const userMap = {};
    task?.assignedTo?.forEach((user) => {
      if (user.email && user.username) {
        userMap[user.email.toLowerCase()] = user.username;
        userMap[user.username.toLowerCase()] = user.username;
      }
    });
    if (task?.owner?.email && task?.owner?.username) {
      userMap[task.owner.email.toLowerCase()] = task.owner.username;
      userMap[task.owner.username.toLowerCase()] = task.owner.username;
    }

    // Updated regex to allow spaces in usernames, stop at next @ or end
    const parts = text.split(/(@[^@]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith("@")) {
        const key = part.slice(1).toLowerCase();
        const username = userMap[key] || part.slice(1);
        return (
          <span key={index} className="text-blue-500 hover:underline">
            @{username}
          </span>
        );
      }
      return (
        <span key={index} className="text-gray-800">
          {part}
        </span>
      );
    });
  };

  const formatAction = (action) => {
    const userMap = {};
    task?.assignedTo?.forEach((user) => {
      if (user.email && user.username) {
        userMap[user.email.toLowerCase()] = user.username;
        userMap[user.username.toLowerCase()] = user.username;
      }
    });
    if (task?.owner?.email && task?.owner?.username) {
      userMap[task.owner.email.toLowerCase()] = task.owner.username;
      userMap[task.owner.username.toLowerCase()] = task.owner.username;
    }

    if (action.includes("uploaded file(s):")) {
      const [userPart, filePart] = action.split(" uploaded file(s): ");
      return (
        <>
          {parseTextWithMentions(userPart)} uploaded file(s):{" "}
          <span className="font-semibold text-gray-800">{filePart}</span>
        </>
      );
    }
    if (action.includes("created task")) {
      const [prefix, title] = action.split("created task ");
      return (
        <>
          {parseTextWithMentions(prefix)} created task{" "}
          <span className="font-semibold text-gray-800">{title}</span>
        </>
      );
    }
    if (action.includes("added comment :")) {
      const [userPart, commentPart] = action.split(" added comment : ");
      return (
        <>
          {parseTextWithMentions(userPart)} added comment:{" "}
          <span className="font-semibold">
            {parseTextWithMentions(commentPart)}
          </span>
        </>
      );
    }
    if (action.includes("replied to comment :")) {
      const [prefix, replyPart] = action.split(" replied to comment : ");
      return (
        <>
          {parseTextWithMentions(prefix)}:{" "}
          <span className="font-semibold">
            {parseTextWithMentions(replyPart)}
          </span>
        </>
      );
    }
    return parseTextWithMentions(action);
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

  const completedCount = formData.subtask.filter((sub) => sub.completed).length;
  const totalCount = formData.subtask.length;
  const progressRatio = `${completedCount}/${totalCount || 1}`;

  if (!task) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader className="h-8 w-8 text-font1 animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative p-6 bg-white min-h-screen">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded"
            aria-label="Close task details"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
          <span className="text-gray-500 text-sm">
            Created on {formatDateOnly(task.createdAt)}
          </span>
        </div>
        {!isEditing && (
          <div className="flex items-center gap-4">
            {getStatusIcon(task.status)}
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 hover:bg-gray-200 rounded"
              aria-label="Edit task"
            >
              <SquarePen className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        )}
      </div>

      <div className="lg:p-3">
        {isEditing ? (
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Edit Task</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Task title"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Task description"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                rows="4"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <Select
                  options={statusOptions}
                  value={statusOptions.find(
                    (opt) => opt.value === formData.status
                  )}
                  onChange={handleStatusChange}
                  placeholder="Select status..."
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <Select
                  options={priorityOptions}
                  value={priorityOptions.find(
                    (opt) => opt.value === formData.priority
                  )}
                  onChange={handlePriorityChange}
                  placeholder="Select priority..."
                  className="text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="Tags, separated by commas"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned To
              </label>
              <CreatableSelect
                isMulti
                value={formData.assignedTo.map((email) => ({
                  value: email,
                  label: email,
                }))}
                onChange={handleAssignedToChange}
                placeholder="Enter email addresses..."
                className="text-sm"
                formatCreateLabel={(input) => `Add "${input}"`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subtasks
              </label>
              {formData.subtask.map((sub, index) => (
                <div key={index} className="flex gap-2 mb-2 items-center">
                  <input
                    type="text"
                    value={sub.title}
                    onChange={(e) => handleSubtaskChange(index, e.target.value)}
                    placeholder="Subtask title"
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attachments
              </label>
              <div
                className={`border-2 border-dashed rounded-md p-6 text-center ${
                  isDragging
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 bg-gray-50"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload
                  className={`mx-auto h-8 w-8 ${
                    isDragging ? "text-blue-500" : "text-gray-400"
                  }`}
                />
                <p className="mt-2 text-sm text-gray-600">
                  Drag & drop files, or{" "}
                  <button
                    type="button"
                    onClick={handleUploadClick}
                    className="text-blue-600 hover:underline"
                  >
                    browse
                  </button>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supports JPEG, PNG, PDF
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
                      className="flex items-center justify-between border border-gray-200 p-2 rounded-md text-sm"
                    >
                      <div className="flex items-start gap-2">
                        {file.type === "application/pdf" ? (
                          <svg
                            className="w-5 h-5 text-red-500"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h7v5h5v11H6z" />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5 text-blue-500"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                          </svg>
                        )}
                        <div>
                          <p className="text-sm">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {getFileType(file.name)} -{" "}
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
                className="text-xs bg-font1 text-white px-4 py-2 rounded-md hover:bg-white hover:text-font1 hover:border hover:border-font1"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-xs border border-font1 text-black px-4 py-2 rounded-md hover:bg-font1 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {task.title || "Untitled"}
            </h2>
            <div className="flex gap-2 mb-4">
              <span
                className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                  statusColors[task.status] || "bg-gray-100 text-gray-800"
                }`}
              >
                {task.status || "Unknown"}
              </span>
              <span
                className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                  priorityColors[task.priority] || "bg-gray-100 text-gray-800"
                }`}
              >
                {task.priority ? `${task.priority} Priority` : "No Priority"}
              </span>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <UserRoundPen className="h-5 w-5 text-gray-700" />
                {task.owner ? (
                  <div className="flex items-center gap-2">
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
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
                {task.assignedTo?.length ? (
                  <div className="flex">
                    {task.assignedTo.map((user, index) => (
                      <div
                        key={user._id}
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm border-2 border-white ${
                          index > 0 ? "ml-[-8px]" : ""
                        }`}
                        style={{
                          backgroundColor: getInitialsAndColor(user.username)
                            .color,
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
                          getInitialsAndColor(user.username).initials
                        )}
                      </div>
                    ))}
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
              <div className="flex items-center gap-2 text-sm">
                <Tags className="h-5 w-5 text-gray-700" />
                <p className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                  {task.tags?.length ? task.tags.join(", ") : "-"}
                </p>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-gray-600" />
                <h3 className="text-sm font-semibold">Description</h3>
              </div>
              <p className="p-4 border border-gray-200 bg-white rounded-md text-sm text-gray-600">
                {task.description || "No description provided."}
              </p>
            </div>
            {task.attachment?.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Paperclip className="h-5 w-5 text-gray-600" />
                  <h3 className="text-sm font-semibold">
                    Attachments ({task.attachment.length})
                  </h3>
                </div>
                <div className="space-y-2">
                  {(isPreviewOpen
                    ? task.attachment
                    : task.attachment.slice(0, 2)
                  ).map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between border border-gray-200 p-3 rounded-md text-sm"
                    >
                      <div className="flex items-start gap-2">
                        {getFileType(attachment.originalName) === "PDF" ? (
                          <svg
                            className="w-5 h-5 text-red-500"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h7v5h5v11H6z" />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5 text-blue-500"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                          </svg>
                        )}
                        <div>
                          <p className="text-sm">{attachment.originalName}</p>
                          <p className="text-xs text-gray-500">
                            {getFileType(attachment.originalName)} -{" "}
                            {attachment.size} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownload(attachment.originalName)}
                        className="text-blue-600 hover:underline"
                      >
                        <CloudDownload className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                  {task.attachment.length > 2 && (
                    <button
                      onClick={() => setIsPreviewOpen(!isPreviewOpen)}
                      className="mt-2 text-blue-600 hover:underline text-sm"
                    >
                      {isPreviewOpen ? "Show less" : "Show all attachments"}
                    </button>
                  )}
                </div>
              </div>
            )}
            <div className="mt-6">
              <div className="flex border-b border-gray-200 mb-4 text-sm">
                {["subtasks", "comments", "recentActivity"].map((tab) => (
                  <button
                    key={tab}
                    className={`px-4 py-2 ${
                      activeTab === tab
                        ? "border-b-2 border-font1 text-font1"
                        : "text-gray-600 hover:text-gray-800"
                    } capitalize`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              {activeTab === "subtasks" && (
                <div>
                  {task.subtask?.length ? (
                    <div className="border border-gray-200 p-4 rounded-md">
                      <div className="flex items-center gap-2 mb-2">
                        <ListTodo className="h-5 w-5 text-gray-600" />
                        <span className="text-sm font-semibold">Subtasks</span>
                        <div className="flex-1 ml-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${
                                  (completedCount / totalCount) * 100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                        <span className="text-xs text-gray-600">
                          {progressRatio}
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {formData.subtask.map((sub, index) => (
                          <li
                            key={index}
                            className="flex items-center gap-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={sub.completed}
                              onChange={() => handleSubtaskToggle(index)}
                              className="h-4 w-4 text-blue-600 rounded"
                              disabled={isEditing}
                            />
                            <span
                              className={
                                sub.completed
                                  ? "line-through text-gray-500"
                                  : ""
                              }
                            >
                              {sub.title || "Untitled subtask"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No subtasks.</p>
                  )}
                </div>
              )}
              {activeTab === "comments" && (
                <div>
                  {task.comments?.length ? (
                    <div className="space-y-4">
                      {task.comments.map((c) => (
                        <div key={c._id} className="border-t pt-4">
                          <div className="flex items-start gap-2">
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm"
                              style={{
                                backgroundColor: getInitialsAndColor(
                                  c.user?.username || "Unknown"
                                ).color,
                              }}
                            >
                              {c.user?.avatar ? (
                                <img
                                  src={c.user.avatar}
                                  alt={c.user.username}
                                  className="w-9 h-9 rounded-full object-cover"
                                />
                              ) : (
                                getInitialsAndColor(
                                  c.user?.username || "Unknown"
                                ).initials
                              )}
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <div className="flex justify-between gap-1 flex-col lg:flex-row lg:items-center lg:gap-2">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold">
                                    {c.user?.username || "Unknown"}
                                  </p>
                                  <p className="text-gray-500 text-xs">
                                    ({c.user?.email})
                                  </p>
                                </div>
                                <div className="flex items-center ">
                                  <p className="text-gray-500 text-xs">
                                    {formatRelativeTime(c.createdAt)}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-2 break-words lg:w-full w-[280px] border border-gray-200 bg-gray-50 p-2 rounded-md">
                                <div className="text-sm">
                                  {parseTextWithMentions(c.comment)}
                                </div>
                                <button
                                  onClick={() =>
                                    setReplyInputs((prev) => ({
                                      ...prev,
                                      [c._id]: prev[c._id] || "",
                                    }))
                                  }
                                  className="text-blue-600 hover:underline text-sm mt-1"
                                >
                                  Reply
                                </button>
                              </div>
                              {replyInputs[c._id] !== undefined && (
                                <form
                                  onSubmit={(e) =>
                                    handleReplySubmit(c._id, c._id, e)
                                  }
                                  className="mt-2 ml-4 relative"
                                >
                                  <textarea
                                    value={replyInputs[c._id] || ""}
                                    onChange={(e) =>
                                      handleReplyInputChange(
                                        c._id,
                                        e.target.value
                                      )
                                    }
                                    placeholder="Type @username to mention..."
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                                    rows="3"
                                  />
                                  {showSuggestions &&
                                    currentTextarea === c._id && (
                                      <ul className="absolute z-10 bg-white border border-gray-200 rounded-md shadow-lg w-full mt-1 max-h-40 overflow-y-auto">
                                        {suggestions.length ? (
                                          suggestions.map((user) => (
                                            <li
                                              key={user._id}
                                              onClick={() =>
                                                handleSelectMention(user)
                                              }
                                              className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer"
                                            >
                                              {user.username}
                                            </li>
                                          ))
                                        ) : (
                                          <li className="px-3 py-2 text-sm text-gray-500">
                                            No matches found
                                          </li>
                                        )}
                                      </ul>
                                    )}
                                  <div className="flex gap-2 mt-2">
                                    <button
                                      type="submit"
                                      className="text-xs bg-font1 text-white px-4 py-2 rounded-md hover:bg-white hover:text-font1 hover:border hover:border-font1"
                                    >
                                      Send
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setReplyInputs((prev) => {
                                          const { [c._id]: _, ...rest } = prev;
                                          return rest;
                                        })
                                      }
                                      className="text-xs border border-font1 text-black px-4 py-2 rounded-md hover:bg-font1 hover:text-white"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </form>
                              )}
                              {c.replies?.length > 0 && (
                                <div className=" mt-2 space-y-4">
                                  {c.replies.map((reply) => (
                                    <div
                                      key={reply._id}
                                      className="border-t pt-4"
                                    >
                                      <div className="flex items-start gap-2">
                                        <div
                                          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm"
                                          style={{
                                            backgroundColor:
                                              getInitialsAndColor(
                                                reply.user?.username ||
                                                  "Unknown"
                                              ).color,
                                          }}
                                        >
                                          {reply.user?.avatar ? (
                                            <img
                                              src={reply.user.avatar}
                                              alt={reply.user.username}
                                              className="w-9 h-9 rounded-full object-cover"
                                            />
                                          ) : (
                                            getInitialsAndColor(
                                              reply.user?.username || "Unknown"
                                            ).initials
                                          )}
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex justify-between gap-1 flex-col lg:flex-row lg:items-center lg:gap-2">
                                            <div className="flex items-center gap-2">
                                              <p className="font-semibold">
                                                {reply.user?.username ||
                                                  "Unknown"}
                                              </p>
                                              <p className="text-gray-500 text-xs">
                                                ({reply.user?.email})
                                              </p>
                                            </div>
                                            <div className="flex items-center ">
                                              <p className="text-gray-500 text-xs">
                                                {formatRelativeTime(
                                                  reply.createdAt
                                                )}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="mt-2  break-words lg:w-[380px]  w-[240px] border border-gray-200 bg-gray-50 p-2 rounded-md">
                                            <div className="text-sm">
                                              {parseTextWithMentions(
                                                reply.comment
                                              )}
                                            </div>
                                            <button
                                              onClick={() =>
                                                setReplyInputs((prev) => ({
                                                  ...prev,
                                                  [reply._id]:
                                                    prev[reply._id] || "",
                                                }))
                                              }
                                              className="text-blue-600 hover:underline text-sm mt-1"
                                            >
                                              Reply
                                            </button>
                                          </div>
                                          {replyInputs[reply._id] !==
                                            undefined && (
                                            <form
                                              onSubmit={(e) =>
                                                handleReplySubmit(
                                                  c._id,
                                                  reply._id,
                                                  e
                                                )
                                              }
                                              className="mt-2 relative"
                                            >
                                              <textarea
                                                value={
                                                  replyInputs[reply._id] || ""
                                                }
                                                onChange={(e) =>
                                                  handleReplyInputChange(
                                                    reply._id,
                                                    e.target.value
                                                  )
                                                }
                                                placeholder="Type @username to mention..."
                                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                                                rows="3"
                                              />
                                              {showSuggestions &&
                                                currentTextarea ===
                                                  reply._id && (
                                                  <ul className="absolute z-10 bg-white border border-gray-200 rounded-md shadow-lg w-full mt-1 max-h-40 overflow-y-auto">
                                                    {suggestions.length ? (
                                                      suggestions.map(
                                                        (user) => (
                                                          <li
                                                            key={user._id}
                                                            onClick={() =>
                                                              handleSelectMention(
                                                                user
                                                              )
                                                            }
                                                            className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer"
                                                          >
                                                            {user.username}
                                                          </li>
                                                        )
                                                      )
                                                    ) : (
                                                      <li className="px-3 py-2 text-sm text-gray-500">
                                                        No matches found
                                                      </li>
                                                    )}
                                                  </ul>
                                                )}
                                              <div className="flex gap-2 mt-2">
                                                <button
                                                  type="submit"
                                                  className="text-xs bg-font1 text-white px-4 py-2 rounded-md hover:bg-white hover:text-font1 hover:border hover:border-font1"
                                                >
                                                  Send
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
                                                  className="text-xs border border-font1 text-black px-4 py-2 rounded-md hover:bg-font1 hover:text-white"
                                                >
                                                  Cancel
                                                </button>
                                              </div>
                                            </form>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No comments yet.</p>
                  )}
                  <form
                    onSubmit={handleCommentSubmit}
                    className="mt-4 relative"
                  >
                    <textarea
                      value={comment}
                      onChange={(e) => handleMentionInput(e.target.value)}
                      placeholder="Type @username to mention..."
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                      rows="4"
                    />
                    {showSuggestions && currentTextarea === "comment" && (
                      <ul className="absolute z-10 bg-white border border-gray-200 rounded-md shadow-lg w-full mt-1 max-h-40 overflow-y-auto">
                        {suggestions.length ? (
                          suggestions.map((user) => (
                            <li
                              key={user._id}
                              onClick={() => handleSelectMention(user)}
                              className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer"
                            >
                              {user.username}
                            </li>
                          ))
                        ) : (
                          <li className="px-3 py-2 text-sm text-gray-500">
                            No matches found
                          </li>
                        )}
                      </ul>
                    )}
                    <button
                      type="submit"
                      className="text-xs mt-2 bg-font1 text-white px-4 py-2 rounded-md hover:bg-white hover:text-font1 hover:border hover:border-font1"
                    >
                      Send
                    </button>
                  </form>
                </div>
              )}
              {activeTab === "recentActivity" && (
                <div>
                  {activities.length ? (
                    <div className="border border-gray-200 p-4 rounded-md max-h-96 overflow-y-auto">
                      {activities.map((activity) => (
                        <div
                          key={activity._id}
                          className="flex gap-3 py-2 border-b last:border-b-0"
                        >
                          <span
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                            style={{
                              backgroundColor: getInitialsAndColor(
                                activity.user || "Unknown"
                              ).color,
                            }}
                          >
                            {activity.avatar ? (
                              <img
                                src={activity.avatar}
                                alt={activity.user}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              getInitialsAndColor(activity.user || "Unknown")
                                .initials
                            )}
                          </span>
                          <div className="flex-1">
                            <div className="border border-gray-200 bg-gray-50 p-2 rounded-md">
                              <p className="text-sm text-gray-600">
                                {formatAction(activity.action)}
                              </p>
                            </div>
                            {activity.files?.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {activity.files.map((file, index) => (
                                  <div
                                    key={index}
                                    className="flex items-start gap-2 border border-gray-200 bg-gray-50 p-2 rounded-md"
                                  >
                                    {getFileType(file.name) === "PDF" ? (
                                      <svg
                                        className="w-5 h-5 text-red-500"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h7v5h5v11H6z" />
                                      </svg>
                                    ) : (
                                      <svg
                                        className="w-5 h-5 text-blue-500"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                                      </svg>
                                    )}
                                    <div>
                                      <p className="text-sm">{file.name}</p>
                                      <p className="text-xs text-gray-500">
                                        {getFileType(file.name)} - {file.size}{" "}
                                        MB
                                      </p>
                                    </div>
                                    <button
                                      onClick={() => handleDownload(file.name)}
                                      className="ml-auto text-blue-600 hover:underline"
                                    >
                                      <CloudDownload className="h-5 w-5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {activity.createdAt
                                ? `${new Date(
                                    activity.createdAt
                                  ).toLocaleDateString("en-ID", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                    timeZone: "Asia/Jakarta",
                                  })} - ${new Date(
                                    activity.createdAt
                                  ).toLocaleTimeString("en-ID", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                    timeZone: "Asia/Jakarta",
                                  })}`
                                : "-"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Activity className="h-5 w-5" />
                      No recent activity
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default TaskDetail;
