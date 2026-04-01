const Expense = require("../models/expense");

// GET all expenses for user
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user }).sort({ createdAt: -1 });
    res.json(expenses);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
};

// CREATE expense
exports.createExpense = async (req, res) => {
  try {
    const expense = await Expense.create({
      ...req.body,
      userId: req.user,
    });
    res.status(201).json(expense);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE expense
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user,
    });
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
};
