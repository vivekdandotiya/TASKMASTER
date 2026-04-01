import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaTrash, FaCheck, FaPlus } from "react-icons/fa";
import "../task.css";

function TaskPage() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [priority, setPriority] = useState("medium");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  // 🔐 AUTH CONFIG
  const getAuthConfig = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const convertToUTC = (localDateTime) =>
    new Date(localDateTime).toISOString();

  // ✅ FETCH TASKS
  const fetchTasks = async () => {
    const config = getAuthConfig();
    if (!config) return;

    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/tasks`, config);
      setTasks(res.data);
    } catch (err) {
      console.log("Fetch Error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ ADD TASK
  const addTask = async () => {
    if (!title || !dueDate) return;

    const config = getAuthConfig();
    if (!config) return;

    try {
      await axios.post(
        `${API_URL}/api/tasks`,
        {
          title,
          dueDate: convertToUTC(dueDate),
          reminderTime: reminderTime ? convertToUTC(reminderTime) : null,
          priority,
        },
        config
      );

      setTitle("");
      setDueDate("");
      setReminderTime("");
      setPriority("medium");

      fetchTasks();
    } catch (err) {
      console.log("Add Error:", err.response?.data || err.message);
    }
  };

  // ✅ COMPLETE TASK
  const completeTask = async (id) => {
    const config = getAuthConfig();
    if (!config) return;

    try {
      await axios.put(`${API_URL}/api/tasks/${id}`, {}, config);
      fetchTasks();
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  };

  // ✅ DELETE TASK
  const deleteTask = async (id) => {
    const config = getAuthConfig();
    if (!config) return;

    try {
      await axios.delete(`${API_URL}/api/tasks/${id}`, config);
      fetchTasks();
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  };

  const isOverdue = (date) => date && new Date(date) < new Date();

  const filteredTasks = tasks
    .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
    .filter((t) => {
      if (filter === "completed") return t.completed;
      if (filter === "pending") return !t.completed;
      return true;
    });

  const displayedTasks = showAll ? filteredTasks : filteredTasks.slice(0, 5);

  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.filter((t) => !t.completed).length;
  const overdueCount = tasks.filter(
    (t) => isOverdue(t.dueDate) && !t.completed
  ).length;

  return (
    <div className="tasks-container">
      {/* Overview Stats */}
      <div className="stats-overview">
        <div className="apple-card stat-card">
          <span className="stat-label">Pending</span>
          <div className="stat-value">{pendingCount}</div>
        </div>
        <div className="apple-card stat-card">
          <span className="stat-label">Completed</span>
          <div className="stat-value">{completedCount}</div>
        </div>
        <div className="apple-card stat-card">
          <span className="stat-label">Overdue</span>
          <div className="stat-value" style={{ color: "#FF3B30" }}>
            {overdueCount}
          </div>
        </div>
      </div>

      {/* Add Task Form */}
      <div className="apple-card add-task-box">
        <h3 className="section-title">New Task</h3>
        <div className="add-task-grid">
          <input
            className="input-field"
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            className="input-field"
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <select
            className="input-field"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          <button className="add-task-btn" onClick={addTask}>
            <FaPlus /> Add
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="task-filters">
        {["all", "pending", "completed"].map((f) => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="tasks-grid">
        {loading ? (
          <p className="empty-state">Fetching tasks...</p>
        ) : filteredTasks.length === 0 ? (
          <p className="empty-state">No tasks found. Time to relax! ☕️</p>
        ) : (
          displayedTasks.map((task) => (
            <div key={task._id} className="apple-card task-item">
              <div className="task-main">
                <div
                  className={`checkbox-wrapper ${
                    task.completed ? "checked" : ""
                  }`}
                  onClick={() => completeTask(task._id)}
                >
                  {task.completed && <FaCheck size={12} />}
                </div>
                <div className="task-content">
                  <span
                    className={`task-name ${task.completed ? "completed" : ""}`}
                  >
                    {task.title}
                  </span>
                  <span className="task-meta">
                    Due {new Date(task.dueDate).toLocaleString()}
                    <span className={`priority-tag priority-${task.priority}`}>
                      {task.priority}
                    </span>
                  </span>
                </div>
              </div>

              <div className="task-actions">
                <button
                  className="action-btn delete"
                  onClick={() => deleteTask(task._id)}
                >
                  <FaTrash size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {filteredTasks.length > 5 && (
        <button
          className="filter-btn"
          style={{ alignSelf: "center" }}
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Show Less" : `View All (${filteredTasks.length})`}
        </button>
      )}
    </div>
  );
}

export default TaskPage;
