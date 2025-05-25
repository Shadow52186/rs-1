const mongoose = require("mongoose");

const loginAttemptSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  lastAttempt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.LoginAttempt || mongoose.model("LoginAttempt", loginAttemptSchema);
