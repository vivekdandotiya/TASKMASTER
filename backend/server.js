require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/userRoutes");
const startReminderCron = require("./cron/reminderCron");
const noteRoutes = require("./routes/noteRoutes");

const app = express();

/* ==============================
   MIDDLEWARE
============================== */
app.use(cors());
app.use(express.json());


app.use("/api/notes", require("./routes/noteRoutes"));
app.use("/api/expenses", require("./routes/expenseRoutes"));


/* ==============================
   ROUTES
============================== */
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);

/* ==============================
   MONGODB CONNECTION
============================== */
mongoose.connect(process.env.MONGO_URI)
.then(() => {
   console.log("🟢 MongoDB Connected Successfully");
   startReminderCron();
})
.catch((err) => {
   console.log("🔴 Mongo Error:", err);
});

/* ==============================
   SERVER START
============================== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
