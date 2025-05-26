import { useState, useEffect, useRef } from "react";
import { fetchTasks, updateTask, deleteTask } from "../utils/apiTask"; // Impor deleteTask
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
  Paperclip,
  FileText,
  X,
  TrashIcon,
  Trash,
  UserRoundX, // Impor ikon Trash untuk tombol hapus
} from "lucide-react";
import { getInitialsAndColor } from "../utils/helpers";

function TaskList() {
  const [tasks, setTasks] = useState([]);
  // const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isListboxOpen, setIsListboxOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showTaskDetailModal, setShowTaskDetailModal] = useState(false);
  const [modalTaskId, setModalTaskId] = useState(null);
  const [showTaskFormModal, setShowTaskFormModal] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const listboxRefs = useRef({});

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
      // setLoading(true);
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

  // Fungsi untuk menangani penghapusan tugas
  const handleDeleteTask = async (taskId, e) => {
    e.stopPropagation();

    // Gunakan SweetAlert2 untuk konfirmasi
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
        await deleteTask(taskId); // Panggil API untuk menghapus tugas
        setIsListboxOpen(false);
        setSelectedTaskId(null);
        loadTasks(); // Refresh daftar tugas setelah penghapusan
        Swal.fire({
          title: "Deleted successfully!",
          text: "Task has been deleted.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (err) {
        error && setError(null);
        setError("Error deleting task.");
        console.error("Error deleting task:", err);
        Swal.fire({
          title: "Error!",
          text: error.message || "Failed to delete task.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  };

  const handleDragStart = (taskId, e) => {
    setDraggedTaskId(taskId);
    e.target.classList.add("cursor-move");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (newStatus) => {
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

  // const getInitial = (username) => {
  //   return username && username.length > 0
  //     ? username[0].toUpperCase() +
  //         (username[1] ? username[1].toUpperCase() : "")
  //     : "?";
  // };

  const formatDate = (dateString) => {
    if (!dateString) return "No Date";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // const avatarColors = [
  //   "bg-blue-500",
  //   "bg-green-500",
  //   "bg-purple-500",
  //   "bg-red-500",
  //   "bg-indigo-500",
  //   "bg-pink-500",
  // ];

  // const getAvatarColor = (index) => {
  //   return avatarColors[index % avatarColors.length];
  // };

  const statusColors = {
    pending: "bg-yellow-200 text-yellow-800 border-yellow-300",
    inProgress: "bg-blue-200 text-blue-800 border-blue-300",
    completed: "bg-green-200 text-green-800 border-green-300",
  };

  const priorityColors = {
    low: "bg-gray-200 text-gray-800 border-gray-300",
    medium: "bg-orange-200 text-orange-800 border-orange-300",
    high: "bg-red-200 text-red-800 border-red-300",
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
    >
      <div className="flex justify-between items-center mb-1">
        <span
          className={`px-4 mb-3 py-1 text-[11px] capitalize rounded-md border ${
            priorityColors[task.priority] ||
            "bg-gray-100 text-gray-800 border-gray-200"
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
              {/* Tampilkan maksimal 4 avatar pertama */}
              {task.assignedTo.slice(0, 3).map((user, index) => {
                const { initials, color } = getInitialsAndColor(user.username);
                return (
                  <div
                    key={index}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-medium text-sm border-2 border-white ${
                      index > 0 ? "ml-[-8px]" : ""
                    }`}
                    style={{
                      backgroundColor: color,
                      zIndex: 3 - index, // Atur z-index untuk overlap yang benar
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

              {/* Tampilkan indikator jumlah user lebih dari 4 */}
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
        {/* Pending Column */}
        <div
          onDragOver={handleDragOver}
          onDrop={() => handleDrop("pending")}
          className={`min-h-[200px] p-2  rounded-md ${
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

        {/* In Progress Column */}
        <div
          onDragOver={handleDragOver}
          onDrop={() => handleDrop("inProgress")}
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

        {/* Completed Column */}
        <div
          onDragOver={handleDragOver}
          onDrop={() => handleDrop("completed")}
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

      {/* {error && <p className="text-red-500 mb-4 text-sm">{error}</p>} */}

      {/* Modal TaskDetail */}
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

      {/* Modal TaskForm */}
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
