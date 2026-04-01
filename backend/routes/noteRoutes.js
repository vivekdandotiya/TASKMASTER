const express = require("express");
const router = express.Router();
const { getNotes, createNote, deleteNote } = require("../controllers/noteController");
const auth = require("../middleware/authMiddleware");

// All note routes require authentication
router.use(auth);

router.get("/", getNotes);
router.post("/", createNote);
router.delete("/:id", deleteNote);

module.exports = router;