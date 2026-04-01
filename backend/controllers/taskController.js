const Task = require("../models/Task");

// CREATE
exports.createTask = async (req, res) => {
  try {
    const task = await Task.create({
      userId: req.user,   // 🔥 THIS FIXES EVERYTHING
      title: req.body.title,
      dueDate: req.body.dueDate,
      reminderTime: req.body.reminderTime,
      priority: req.body.priority,
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET USER TASKS ONLY
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      userId: req.user,   // 🔥 FILTER
    });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// COMPLETE
exports.completeTask = async (req, res) => {
  const task = await Task.findOne({
    _id: req.params.id,
    userId: req.user,
  });

  if (!task)
    return res.status(404).json({ message: "Not found" });

  task.completed = true;
  await task.save();

  res.json(task);
};

// DELETE
exports.deleteTask = async (req, res) => {
  await Task.findOneAndDelete({
    _id: req.params.id,
    userId: req.user,
  });

  res.json({ message: "Deleted" });
};