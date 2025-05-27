import { useState, useEffect, useRef } from "react";
import { fetchTasks, updateTask, deleteTask } from "../utils/apiTask";
import Swal from "sweetalert2";
import TaskForm from "../components/TaskForm";
import TaskDetail from "./TaskDetail";
import {
  EllipsisVertical,
  MessageSquareText,
  Clock,
  Loader,
  CircleCheck,
  CalendarClock,
  CalendarCheck2,
  PencilLine,
  FileText,
  X,
  Trash,
  UserRoundX,
} from "lucide-react";
import { getInitialsAndColor } from "../utils/helpers";

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);
  const [isListboxOpen, setIsListboxOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showTaskDetailModal, setShowTaskDetailModal] = useState(false);
  const [modalTaskId, setModalTaskId] = useState(null);
  const [showTaskFormModal, setShowTaskFormModal] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const listboxRefs = useRef({});
  const columnRefs = useRef({
    pending: null,
    inProgress: null,
    completed: null,
  });

  useEffect(() => {
    loadTasks();

    const handleClickOutside = (event) => {
      const isOutside = Object.values(listboxRefs.current).every((ref) => {
        return ref && !ref.contains(event.target);
      });

      if (isOutside) {
        setIsListboxOpen(false);
        setSelectedTaskId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadTasks = async () => {
    try {
      const data = await fetchTasks();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch tasks.");
      console.error("Error fetching tasks:", err);
    }
  };

  const handleTaskCreated = () => {
    setShowTaskFormModal(false);
    loadTasks();
  };

  const handleTaskUpdated = () => {
    loadTasks();
  };

  const handleDeleteTask = async (taskId, e) => {
    e.stopPropagation();

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    });

    if (result.isConfirmed) {
      try {
        await deleteTask(taskId);
        setIsListboxOpen(false);
        setSelectedTaskId(null);
        loadTasks();
        Swal.fire({
          title: "Deleted successfully!",
          text: "Task has been deleted.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (err) {
        setError("Error deleting task.");
        console.error("Error deleting task:", err);
        Swal.fire({
          title: "Error!",
          text: err.message || "Failed to delete task.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  };

  const handleDragStart = (taskId, e) => {
    setDraggedTaskId(taskId);
    e.target.classList.add("cursor-move");
    e.dataTransfer.setData("text/plain", taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (newStatus, e) => {
    e.preventDefault();
    if (!draggedTaskId) return;

    try {
      await updateTask(draggedTaskId, { status: newStatus });
      setDraggedTaskId(null);
      loadTasks();
    } catch (err) {
      setError("Error updating task status.");
      console.error("Error updating task status:", err);
    }
  };

  const handleDragEnd = (e) => {
    setDraggedTaskId(null);
    e.target.classList.remove("cursor-move");
  };

  const handleTouchStart = (taskId, e) => {
    setDraggedTaskId(taskId);
    e.target.classList.add("opacity-50", "cursor-move");
    e.target.style.touchAction = "none";
  };

  const handleTouchMove = (e) => {
    if (!draggedTaskId) return;

    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);

    Object.keys(columnRefs.current).forEach((status) => {
      const column = columnRefs.current[status];
      if (column && column.contains(element)) {
        column.classList.add(
          "bg-gray-100",
          "border-2",
          "border-dashed",
          "border-gray-300"
        );
      } else if (column) {
        column.classList.remove(
          "bg-gray-100",
          "border-2",
          "border-dashed",
          "border-gray-300"
        );
      }
    });
  };

  const handleTouchEnd = async (e) => {
    if (!draggedTaskId) return;

    const touch = e.changedTouches[0];
    const targetElement = e.target;
    const element = document.elementFromPoint(touch.clientX, touch.clientY);

    let newStatus = null;
    Object.keys(columnRefs.current).forEach((status) => {
      const column = columnRefs.current[status];
      if (column && column.contains(element)) {
        newStatus = status;
      }
      column?.classList.remove(
        "bg-gray-100",
        "border-2",
        "border-dashed",
        "border-gray-300"
      );
    });

    if (newStatus) {
      try {
        await updateTask(draggedTaskId, { status: newStatus });
        loadTasks();
      } catch (err) {
        setError("Error updating task status.");
        console.error("Error updating task status:", err);
      }
    }

    setDraggedTaskId(null);
    targetElement.classList.remove("opacity-50", "cursor-move");
    targetElement.style.touchAction = "auto";
  };

  const getTotalComments = (task) => {
    if (!task.comments || task.comments.length === 0) return 0;
    const commentCount = task.comments.length;
    const replyCount = task.comments.reduce((total, comment) => {
      return total + (comment.replies ? comment.replies.length : 0);
    }, 0);
    return commentCount + replyCount;
  };

  const getTotalAttachments = (task) => {
    return task.attachment && Array.isArray(task.attachment)
      ? task.attachment.length
      : 0;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No Date";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const statusColors = {
    pending: "bg-yellow-200 text-yellow-800",
    inProgress: "bg-blue-200 text-blue-800",
    completed: "bg-green-200 text-green-800",
  };

  const priorityColors = {
    low: "bg-gray-200 text-gray-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-200 text-red-800",
  };

  const pendingTasks = tasks.filter((task) => task.status === "pending");
  const inProgressTasks = tasks.filter((task) => task.status === "inProgress");
  const completedTasks = tasks.filter((task) => task.status === "completed");

  const toggleListbox = (taskId, e) => {
    e.stopPropagation();
    if (isListboxOpen && selectedTaskId === taskId) {
      setIsListboxOpen(false);
      setSelectedTaskId(null);
    } else {
      setSelectedTaskId(taskId);
      setIsListboxOpen(true);
    }
  };

  const openTaskDetailModal = (taskId, e) => {
    e.stopPropagation();
    setModalTaskId(taskId);
    setShowTaskDetailModal(true);
    setIsListboxOpen(false);
    setSelectedTaskId(null);
  };

  const closeTaskDetailModal = () => {
    setShowTaskDetailModal(false);
    setModalTaskId(null);
  };

  const openTaskFormModal = () => {
    setShowTaskFormModal(true);
  };

  const closeTaskFormModal = () => {
    setShowTaskFormModal(false);
  };

  const renderTaskItem = (task) => (
    <div
      key={task._id}
      className={`block bg-white border border-gray-200 rounded-md p-4 hover:bg-gray-50 transition duration-200 cursor-pointer ${
        draggedTaskId === task._id ? "opacity-50" : ""
      }`}
      draggable
      onDragStart={(e) => handleDragStart(task._id, e)}
      onDragEnd={handleDragEnd}
      onTouchStart={(e) => handleTouchStart(task._id, e)}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex justify-between items-center mb-1">
        <span
          className={`px-4 mb-3 py-1 text-[11px] font-medium capitalize rounded ${
            priorityColors[task.priority] || "bg-gray-100 text-gray-800"
          }`}
        >
          {task.priority ? `${task.priority} Priority` : "Unknown Priority"}
        </span>
        <div
          className="relative"
          ref={(el) => (listboxRefs.current[task._id] = el)}
          onClick={(e) => e.stopPropagation()}
        >
          <EllipsisVertical
            className="h-6 w-6 text-gray-500 cursor-pointer"
            onClick={(e) => toggleListbox(task._id, e)}
          />
          {isListboxOpen && selectedTaskId === task._id && (
            <div className="absolute right-0 mt-2 w-36 p-1 bg-white border border-gray-200 rounded-md shadow z-10">
              <button
                onClick={(e) => openTaskDetailModal(task._id, e)}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <PencilLine className="h-4 w-4" />
                Detail Task
              </button>
              <div className="border-t border-borderPrimary"></div>
              <button
                onClick={(e) => handleDeleteTask(task._id, e)}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md"
              >
                <Trash className="h-4 w-4" />
                Delete Task
              </button>
            </div>
          )}
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-900 truncate">
        {task.title || "Tanpa Judul"}
      </h3>
      <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
        <p className="flex items-center gap-1">
          <CalendarClock className="h-4 w-4 text-font3" />
          {formatDate(task.startDate)}
        </p>
        -
        <p className="flex items-center gap-1">
          <CalendarCheck2 className="h-4 w-4 text-font3" />
          {formatDate(task.dueDate)}
        </p>
      </div>
      <div className="mt-5 flex items-center">
        <div className="flex">
          {Array.isArray(task.assignedTo) && task.assignedTo.length > 0 ? (
            <div className="flex">
              {task.assignedTo.slice(0, 3).map((user, index) => {
                const { initials, color } = getInitialsAndColor(user.username);
                return (
                  <div
                    key={index}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-medium text-sm border-2 border-white ${
                      index > 0 ? "ml-[-8px]" : ""
                    }`}
                    style={{ backgroundColor: color, zIndex: 3 - index }}
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
              {task.assignedTo.length > 3 && (
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-200 text-gray-600 font-medium text-xs border-2 border-white ml-[-8px]"
                  title={`${task.assignedTo.length - 3} more`}
                >
                  +{task.assignedTo.length - 3}
                </div>
              )}
            </div>
          ) : (
            <UserRoundX className="h-4 w-4 text-gray-500" />
          )}
        </div>
        <div className="flex items-center gap-2 ml-2">
          <MessageSquareText className="h-4 w-4 text-font3" />
          <p className="text-xs text-gray-500">{getTotalComments(task)}</p>
          <FileText className="h-4 w-4 text-font3" />
          <p className="text-xs text-gray-500">{getTotalAttachments(task)}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:p-6 p-3">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 p-2">
        <div>
          <h1 className="text-[25px] lg:text-3xl font-bold text-gray-900 flex items-center gap-2">
            Task List
          </h1>
          <p className="lg:text-base text-[25px] text-gray-600">
            Manage your tasks efficiently and effectively.
          </p>
        </div>
        <button
          onClick={openTaskFormModal}
          className="mt-5 lg:mt-0 bg-font1 text-white text-sm px-4 py-2 rounded-md hover:border hover:border-font1 hover:bg-white hover:text-font1 transition duration-200"
        >
          Add new Task
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
        <div
          ref={(el) => (columnRefs.current.pending = el)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop("pending", e)}
          className={`min-h-[200px] p-2 rounded-md ${
            draggedTaskId
              ? "bg-gray-100 border-2 border-dashed border-gray-300"
              : ""
          }`}
        >
          <div className="border border-borderPrimary bg-white p-4 rounded-md flex items-center gap-2 mb-5 justify-between">
            <div className="flex items-center gap-2">
              <p
                className={`text-yellow-500 w-7 h-7 rounded-md flex items-center justify-center ${statusColors.pending}`}
              >
                {pendingTasks.length || 0}
              </p>
              <p className="text-font1">Pending</p>
            </div>
            <Clock className="h-5 w-5 text-yellow-500" />
          </div>
          {pendingTasks.length === 0 ? (
            <p className="text-gray-500 text-center py-2">No Assignments.</p>
          ) : (
            <div className="grid gap-2">{pendingTasks.map(renderTaskItem)}</div>
          )}
        </div>
        <div
          ref={(el) => (columnRefs.current.inProgress = el)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop("inProgress", e)}
          className={`min-h-[200px] p-2 rounded-md ${
            draggedTaskId
              ? "bg-gray-100 border-2 border-dashed border-gray-300"
              : ""
          }`}
        >
          <div className="border border-borderPrimary bg-white p-4 rounded-md flex items-center gap-2 mb-5 justify-between">
            <div className="flex items-center gap-2">
              <p
                className={`text-blue-500 w-7 h-7 rounded-md flex items-center justify-center ${statusColors.inProgress}`}
              >
                {inProgressTasks.length || 0}
              </p>
              <p className="text-font1">In Progress</p>
            </div>
            <Loader className="h-5 w-5 text-blue-500" />
          </div>
          {inProgressTasks.length === 0 ? (
            <p className="text-gray-500 text-center py-2">No Assignments.</p>
          ) : (
            <div className="grid gap-2">
              {inProgressTasks.map(renderTaskItem)}
            </div>
          )}
        </div>
        <div
          ref={(el) => (columnRefs.current.completed = el)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop("completed", e)}
          className={`min-h-[200px] p-2 rounded-md ${
            draggedTaskId
              ? "bg-gray-100 border-2 border-dashed border-gray-300"
              : ""
          }`}
        >
          <div className="border border-borderPrimary bg-white p-4 rounded-md flex items-center gap-2 mb-5 justify-between">
            <div className="flex items-center gap-2">
              <p
                className={`text-green-500 w-7 h-7 rounded-md flex items-center justify-center ${statusColors.completed}`}
              >
                {completedTasks.length || 0}
              </p>
              <p className="text-font1">Completed</p>
            </div>
            <CircleCheck className="h-5 w-5 text-green-500" />
          </div>
          {completedTasks.length === 0 ? (
            <p className="text-gray-500 text-center py-2">No Assignments.</p>
          ) : (
            <div className="grid gap-2">
              {completedTasks.map(renderTaskItem)}
            </div>
          )}
        </div>
      </div>
      {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
      {showTaskDetailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div
            className={`bg-white w-full md:w-[560px] h-full shadow-lg transform transition-transform duration-300 ${
              showTaskDetailModal ? "translate-x-0" : "translate-x-full"
            } overflow-y-auto`}
          >
            <TaskDetail
              taskId={modalTaskId}
              onClose={closeTaskDetailModal}
              onTaskUpdated={handleTaskUpdated}
            />
          </div>
        </div>
      )}
      {showTaskFormModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div
            className={`bg-white w-full md:w-[560px] h-full shadow-lg transform transition-transform duration-300 ${
              showTaskFormModal ? "translate-x-0" : "translate-x-full"
            } overflow-y-auto`}
          >
            <button
              onClick={closeTaskFormModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="p-6">
              <h3 className="border-b border-borderPrimary pb-4 text-2xl font-semibold text-gray-800 mb-4">
                Add New Task
              </h3>
              <TaskForm onTaskCreated={handleTaskCreated} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskList;
