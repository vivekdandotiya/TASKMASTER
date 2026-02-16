const Task = require("../models/Task");
const sendEmail = require("./sendEmail");

module.exports = async (user) => {
   const weekAgo = new Date();
   weekAgo.setDate(weekAgo.getDate() - 7);

   const total = await Task.countDocuments({
      userId: user._id,
      createdAt: { $gte: weekAgo }
   });

   const completed = await Task.countDocuments({
      userId: user._id,
      completed: true,
      createdAt: { $gte: weekAgo }
   });

   await sendEmail(user.email,
      "Weekly Productivity Report",
      `You completed ${completed}/${total} tasks this week 🔥`
   );
};
