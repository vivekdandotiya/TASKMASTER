const cron = require("node-cron");
const Task = require("../models/Task");
const sendWhatsApp = require("../utils/sendWhatsApp");
const sendEmail = require("../utils/sendEmail");

function startReminderCron() {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      console.log("⏰ Checking reminders at:", now);

      const tasks = await Task.find({
  reminderTime: { $lte: now },   // 👈 change here
  completed: false,
  notified: false,
});


      console.log("Found tasks:", tasks.length);

      for (let task of tasks) {

        console.log("📢 Sending reminder for:", task.title);

      
        await sendWhatsApp(
          "917999617228",   // apna number daal 
          `Reminder: "${task.title}" complete nahi kiya tune saale marega 😤`
        );

        await sendEmail(
          "vivekdandotiya772@gmail.com",   // 👈 apna email daal
          "Task Reminder",
          `Your task "${task.title}" is pending.`
        );

        task.notified = true;
        await task.save();

        console.log("✅ Reminder sent successfully");
      }

    } catch (err) {
      console.log("❌ Cron Error:", err.message);
    }
  });
}

module.exports = startReminderCron;
