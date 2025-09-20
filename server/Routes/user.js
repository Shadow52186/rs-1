const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const { register, login } = require("../Controllers/auth");
const { auth, isAdmin } = require("../Middleware/auth");
const User = require("../Models/User");
const registerLimiter = require("../Middleware/registerLimiter");
const BannedIP = require("../Models/BannedIP");
const mongoose = require("mongoose");


router.get("/users", auth, isAdmin, async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const pageSize = Math.min(parseInt(req.query.pageSize) || 50, 200);
  const q = (req.query.q || "").trim();

  const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const filter = q ? { username: { $regex: new RegExp(escape(q), "i") } } : {};

  const [items, total] = await Promise.all([
    User.find(filter)
      .select("-password -__v")
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    User.countDocuments(filter),
  ]);

  res.json({ items, total, page, pageSize });
});


router.post(
  "/register",
  registerLimiter,
  [
    check("username", "กรุณากรอกชื่อผู้ใช้").notEmpty().trim().escape(),
    check("password", "กรุณากรอกรหัสผ่าน").isLength({ min: 6 }).withMessage("รหัสผ่านต้องอย่างน้อย 6 ตัวอักษร"),
  ],
  register
);

// ✅ Login
router.post(
  "/login",
  [
    check("username", "กรุณากรอกชื่อผู้ใช้").notEmpty().trim(),
    check("password", "กรุณากรอกรหัสผ่าน").notEmpty(),
    check("recaptchaToken", "ไม่พบ token ของ reCAPTCHA").notEmpty(),
  ],
  login
);

// ✅ แก้ไขผู้ใช้ (admin เท่านั้น)
router.put("/user/:id", auth, isAdmin, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).send("Invalid user ID");
  }

  try {
    const { username, password, role, point } = req.body;
    const updateData = { username, role, point };

    if (password && password.trim() !== "") {
      const bcrypt = require("bcryptjs");
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send("Update failed");
  }
});

// ✅ รายชื่อ IP ที่โดนแบน (admin เท่านั้น)
router.get("/banned-ips", auth, isAdmin, async (req, res) => {
  try {
    const ips = await BannedIP.find().sort({ bannedAt: -1 });
    res.json(ips);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// ✅ ดึงข้อมูลผู้ใช้จาก token
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).send("User not found");
    res.json(user);
  } catch (err) {
    console.error("GET /me error:", err);
    res.status(500).send("Server error");
  }
});

module.exports = router;