const express = require("express");
const router = express.Router();
const {
  createTask,
  getTasks,
  completeTask,
  deleteTask
} = require("../controllers/taskController");

router.get("/", getTasks);
router.post("/", createTask);
router.put("/:id", completeTask);
router.delete("/:id", deleteTask);

module.exports = router;
