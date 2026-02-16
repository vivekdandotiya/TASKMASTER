const Task = require("../models/Task");

// ================= CREATE TASK =================
const createTask = async (req, res) => {
  try {
    const { title, dueDate, reminderTime, priority } = req.body;

    if (!title || !dueDate) {
      return res.status(400).json({
        message: "Title and due date required",
      });
    }

    const task = await Task.create({
      title,
      dueDate: new Date(dueDate),
      reminderTime: reminderTime ? new Date(reminderTime) : null,
      priority: priority || "medium",
      completed: false,
      notified: false,
    });

    res.status(201).json(task);

  } catch (error) {
    console.log("Create Task Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ================= GET TASKS =================
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= COMPLETE TASK =================
const completeTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.completed = true;
    await task.save();

    res.json(task);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= DELETE TASK =================
const deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  completeTask,
  deleteTask,
};
