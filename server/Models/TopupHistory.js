const mongoose = require("mongoose");

const topupHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  note: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("TopupHistory", topupHistorySchema);
