const mongoose = require("mongoose");

const loginAttemptSchema = new mongoose.Schema({
  ip: { type: String, required: true, unique: true }, // ติดตามตาม IP
  count: { type: Number, default: 0 }, // จำนวนการพยายามเข้าสู่ระบบที่ผิดพลาด
  lastAttempt: { type: Date, default: Date.now }, // เวลาของการพยายามเข้าสู่ระบบครั้งล่าสุด
});

module.exports = mongoose.models.LoginAttempt || mongoose.model("LoginAttempt", loginAttemptSchema);
