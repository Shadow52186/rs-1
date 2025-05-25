const mongoose = require("mongoose");

const usedTrueMoneySchema = new mongoose.Schema({
  link: { type: String, required: true, unique: true },
  usedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  amount: Number,
  status: { type: String, enum: ["success", "fail"], default: "fail" },
}, { timestamps: true });

module.exports = mongoose.model("UsedTrueMoney", usedTrueMoneySchema);
