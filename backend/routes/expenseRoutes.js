const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");

// GET all
router.get("/", async (req, res) => {
  const expenses = await Expense.find().sort({ createdAt: -1 });
  res.json(expenses);
});

// CREATE
router.post("/", async (req, res) => {
  const expense = await Expense.create(req.body);
  res.status(201).json(expense);
});

// DELETE
router.delete("/:id", async (req, res) => {
  await Expense.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

module.exports = router;
