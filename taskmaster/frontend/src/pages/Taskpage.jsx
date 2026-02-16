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
    // Get theme from localStorage or default to 'dark'
    return localStorage.getItem('theme') || 'dark';
  });

  const location = useLocation();

  useEffect(() => {
    fetchTasks();
  }, []);

  // Apply theme on mount and when it changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/tasks");
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
      await axios.post("http://localhost:5000/api/tasks", {
        title,
        dueDate,
        reminderTime,
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
      await axios.put(`http://localhost:5000/api/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      console.log(err.message);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${id}`);
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

      {/* Sidebar */}
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

      {/* Main */}
      <div className="main">

        {/* Navbar */}
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
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <FaMoon /> : <FaSun />}
          </button>

          <button
            className="toggle-btn"
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
        </div>

        {/* Stats */}
        <div className="stats">
          <div className="card red">
            <div>{tasks.length}</div>
            <span>Total</span>
          </div>

          <div className="card green">
            <div>{tasks.filter((t) => t.completed).length}</div>
            <span>Completed</span>
          </div>

          <div className="card yellow">
            <div>{tasks.filter((t) => !t.completed).length}</div>
            <span>Pending</span>
          </div>
        </div>

        {/* Filters */}
        <div className="filters">
          {["all", "pending", "completed"].map((f) => (
            <button
              key={f}
              className={filter === f ? "active" : ""}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Add Task */}
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
            onChange={(e) => setReminderTime(e.target.value)}
          />

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <button onClick={addTask}>
            <FaPlus /> Add
          </button>
        </div>

        {/* Task List */}
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
                    isOverdue(task.dueDate) && !task.completed
                      ? "overdue"
                      : ""
                  }`}
                >
                  <div className="task-info">
                    <h3>{task.title}</h3>
                    <p>Due: {new Date(task.dueDate).toLocaleString()}</p>

                    {task.reminderTime && (
                      <p>
                        Reminder:{" "}
                        {new Date(task.reminderTime).toLocaleString()}
                      </p>
                    )}

                    <span className={`priority ${task.priority}`}>
                      {task.priority}
                    </span>
                  </div>

                  <div className="actions">
                    {!task.completed && (
                      <button 
                        onClick={() => completeTask(task._id)}
                        aria-label="Mark as complete"
                      >
                        <FaCheck />
                      </button>
                    )}
                    <button 
                      onClick={() => deleteTask(task._id)}
                      aria-label="Delete task"
                    >
                      <FaTrash />
                    </button>
                  </div>

                  <div
                    className={
                      task.completed ? "status done" : "status pending"
                    }
                  >
                    {task.completed ? "Completed" : "Pending"}
                  </div>
                </div>
              ))}

              {filteredTasks.length > 3 && (
                <div className="see-more-wrapper">
                  <button
                    className="see-more-btn"
                    onClick={() => setShowAll(!showAll)}
                  >
                    {showAll ? "Show Less" : "See More"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default TaskPage;