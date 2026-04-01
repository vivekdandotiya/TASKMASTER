const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    desc: String,
    amount: Number,
    category: String,
    date: String,
  },
  { timestamps: true } // 👈 THIS MUST BE HERE
);

module.exports = mongoose.model("Expense", expenseSchema);