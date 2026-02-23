const express = require("express");
const router = express.Router();
const Note = require("../models/Note");

// Create Note
router.post("/", async (req, res) => {
  try {
    const { title, content } = req.body;

    const note = await Note.create({ title, content });

    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get All Notes
router.get("/", async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
