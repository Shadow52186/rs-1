const mongoose = require("mongoose");

const bannedIPSchema = new mongoose.Schema({
  ip: { type: String, required: true, unique: true },
  reason: { type: String, default: "Too many login attempts" },
  bannedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.BannedIP || mongoose.model("BannedIP", bannedIPSchema);