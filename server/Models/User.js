// models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-zA-Z0-9_]+$/, // ✅ ป้องกัน injection เช่นใส่ JSON
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    point: {
      type: Number,
      default: 0,
      min: 0,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  { timestamps: true }
);

// ✅ Index เพื่อความเร็วในการค้นหา username และป้องกันซ้ำ
userSchema.index({ username: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);
