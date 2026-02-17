import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaTrash, FaCheck, FaPlus, FaSun, FaMoon } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
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
  const [collapsed, setCollapsed] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  const location = useLocation();

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // 🔥 FIX FOR TIMEZONE ISSUE
  const convertToUTC = (localDateTime) => {
    const date = new Date(localDateTime);
    return date.toISOString();
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/tasks`);
      setTasks(res.data);
    } catch (err) {
      console.log("Fetch Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (!title || !dueDate) return;

    try {
      await axios.post(`${API_URL}/api/tasks`, {
        title,
        dueDate: convertToUTC(dueDate),
        reminderTime: reminderTime
          ? convertToUTC(reminderTime)
          : null,
        priority,
      });

      setTitle("");
      setDueDate("");
      setReminderTime("");
      setPriority("medium");
      fetchTasks();
    } catch (err) {
      console.log("Add Error:", err.message);
    }
  };

  const completeTask = async (id) => {
    try {
      await axios.put(`${API_URL}/api/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      console.log(err.message);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      console.log(err.message);
    }
  };

  const isOverdue = (date) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  const filteredTasks = tasks
    .filter((task) =>
      task.title.toLowerCase().includes(search.toLowerCase())
    )
    .filter((task) => {
      if (filter === "completed") return task.completed;
      if (filter === "pending") return !task.completed;
      return true;
    });

  const displayedTasks = showAll
    ? filteredTasks
    : filteredTasks.slice(0, 3);

  return (
    <div className={`dashboard ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar">
        <div className="logo">
          <span>🔥</span>
          <span>TaskMaster</span>
        </div>

        <nav>
          <Link
            to="/"
            className={`nav-item ${
              location.pathname === "/" ? "active" : ""
            }`}
          >
            <span>Task Manager</span>
          </Link>

          <Link
            to="/notes"
            className={`nav-item ${
              location.pathname === "/notes" ? "active" : ""
            }`}
          >
            <span>Notes</span>
          </Link>

          <Link
            to="/calendar"
            className={`nav-item ${
              location.pathname === "/calendar" ? "active" : ""
            }`}
          >
            <span>Calendar</span>
          </Link>
        </nav>
      </div>

      <div className="main">
        <div className="navbar">
          <h1>Dashboard</h1>

          <input
            className="search"
            placeholder="Search task..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            className="theme-toggle"
            onClick={toggleTheme}
          >
            {theme === "light" ? <FaMoon /> : <FaSun />}
          </button>

          <button
            className="toggle-btn"
            onClick={() => setCollapsed(!collapsed)}
          >
            ☰
          </button>
        </div>

        <div className="add-box">
          <input
            placeholder="Enter task..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <input
            type="datetime-local"
            value={reminderTime}
            onChange={(e) =>
              setReminderTime(e.target.value)
            }
          />

          <select
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value)
            }
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <button onClick={addTask}>
            <FaPlus /> Add
          </button>
        </div>

        <div className="task-list">
          {loading ? (
            <p className="empty">Loading...</p>
          ) : filteredTasks.length === 0 ? (
            <p className="empty">No tasks found</p>
          ) : (
            <>
              {displayedTasks.map((task) => (
                <div
                  key={task._id}
                  className={`task-card ${
                    isOverdue(task.dueDate) &&
                    !task.completed
                      ? "overdue"
                      : ""
                  }`}
                >
                  <div className="task-info">
                    <h3>{task.title}</h3>

                    <p>
                      Due:{" "}
                      {new Date(
                        task.dueDate
                      ).toLocaleString()}
                    </p>

                    {task.reminderTime && (
                      <p>
                        Reminder:{" "}
                        {new Date(
                          task.reminderTime
                        ).toLocaleString()}
                      </p>
                    )}

                    <span
                      className={`priority ${task.priority}`}
                    >
                      {task.priority}
                    </span>
                  </div>

                  <div className="actions">
                    {!task.completed && (
                      <button
                        onClick={() =>
                          completeTask(task._id)
                        }
                      >
                        <FaCheck />
                      </button>
                    )}

                    <button
                      onClick={() =>
                        deleteTask(task._id)
                      }
                    >
                      <FaTrash />
                    </button>
                  </div>

                  <div
                    className={
                      task.completed
                        ? "status done"
                        : "status pending"
                    }
                  >
                    {task.completed
                      ? "Completed"
                      : "Pending"}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default TaskPage;
