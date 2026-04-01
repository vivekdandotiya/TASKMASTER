const Note = require("../models/Note");

// GET all notes for user
exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
};

// CREATE note
exports.createNote = async (req, res) => {
  try {
    const note = await Note.create({
      ...req.body,
      userId: req.user,
    });
    res.status(201).json(note);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE note
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.user,
    });
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
};
