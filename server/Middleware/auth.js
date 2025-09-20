// middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../Models/User"); // ✅ ต้องดึง model
const mongoose = require("mongoose"); // ต้อง import mongoose เพิ่ม

exports.auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).send("Access denied");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ ป้องกัน NoSQL Injection ด้วยการเช็ก ObjectId
    if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
      return res.status(400).send("Invalid token payload");
    }

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).send("User not found");

    req.user = user;
    next();
  } catch (err) {
    res.status(400).send("Invalid token");
  }
};
exports.requireLogin = (req, res, next) => {
  // ใช้ร่วมกับ auth หรือแยกใช้ก็ได้
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).send("Unauthorized");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).send("Token ไม่ถูกต้อง");
  }
};

exports.isAdmin = (req, res, next) => {
  console.log("🔒 user.role =", req.user.role);
  if (req.user.role !== "admin") {
    return res.status(403).send("Admin access only");
  }
  next();
};