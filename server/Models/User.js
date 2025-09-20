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
      match: /^[a-zA-Z0-9_]+$/, 
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


userSchema.index({ username: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);