import { useState, useRef } from "react";
import { createTask } from "../utils/apiTask";
import Select from "react-select";
import { Trash, Upload } from "lucide-react";
import { toast } from "react-hot-toast";
import CreatableSelect from "react-select/creatable"; // Untuk input email bebas

function TaskForm({ onTaskCreated }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "pending",
    priority: "low",
    tags: "",
    startDate: "",
    dueDate: "",
    assignedTo: [], // Sekarang array email
    attachment: [],
    subtask: [{ title: "", completed: false }],
  });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Validasi format email
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Title is required.");
      return;
    }

    // Validasi email di assignedTo
    const invalidEmails = formData.assignedTo.filter(
      (email) => !isValidEmail(email)
    );
    if (invalidEmails.length > 0) {
      toast.error("Invalid email addresses: " + invalidEmails.join(", "));
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
        subtask: formData.subtask.filter((sub) => sub.title.trim() !== ""),
        attachment:
          formData.attachment.length > 0 ? formData.attachment : undefined,
      };
      await createTask(taskData);
      setFormData({
        title: "",
        description: "",
        status: "pending",
        priority: "low",
        tags: "",
        startDate: "",
        dueDate: "",
        assignedTo: [],
        attachment: [],
        subtask: [{ title: "", completed: false }],
      });
      toast.success("Task created successfully! Invitations sent.");
      onTaskCreated();
    } catch (err) {
      toast.error(
        err.message || "Failed to create task. Please check your input."
      );
      console.error("Error creating task:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
    const selectedEmails = selectedOptions
      ? selectedOptions.map((option) => option.value)
      : [];
    setFormData({ ...formData, assignedTo: selectedEmails });
  };

  const handleSubtaskChange = (index, value) => {
    const updatedSubtasks = [...formData.subtask];
    updatedSubtasks[index] = { ...updatedSubtasks[index], title: value };
    setFormData({ ...formData, subtask: updatedSubtasks });
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

  const handleRemoveFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      attachment: prev.attachment.filter((_, i) => i !== index),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="grid gap-4">
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Task title"
          className="p-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500"
          required
        />
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description (optional)"
          className="p-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500"
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
              placeholder="Select status..."
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
              placeholder="Select priority..."
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
          placeholder="Tags, separated by commas (optional)"
          className="p-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500"
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className="p-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="p-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Subtasks</h4>
          {formData.subtask.map((sub, index) => (
            <div key={index} className="flex gap-2 mb-2 items-center">
              <input
                type="text"
                value={sub.title}
                onChange={(e) => handleSubtaskChange(index, e.target.value)}
                placeholder="Subtask title"
                className="p-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 flex-1"
              />
              <button
                type="button"
                onClick={() => removeSubtask(index)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                <Trash className="w-4 h-4" />
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
            Assigned To (Enter emails)
          </label>
          <CreatableSelect
            isMulti
            value={formData.assignedTo.map((email) => ({
              value: email,
              label: email,
            }))}
            onChange={handleAssignedToChange}
            placeholder="Type email addresses..."
            className="text-sm"
            classNamePrefix="react-select"
            formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
            noOptionsMessage={() => "Type an email address to add"}
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter valid email addresses to invite users
          </p>
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
                    <Trash className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="text-sm mt-2 bg-font1 text-white px-4 py-2 rounded-md hover:border hover:border-font1 hover:bg-white hover:text-font1 transition duration-200"
        >
          Save Task
        </button>
      </div>
    </form>
  );
}

export default TaskForm;
