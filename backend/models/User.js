const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
   name: String,
   email: String,
   password: String,
   phone: String,
   streak: { type: Number, default: 0 },
   lastCompletedDate: Date
});

module.exports = mongoose.model("User", userSchema);
