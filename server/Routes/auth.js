const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const {
  register,
  login,
} = require('../Controllers/auth');
const loginLimiter = require('../Middleware/loginLimiter');

// ✅ Register Route
router.post("/register", [
  check("username")
    .trim()
    .notEmpty().withMessage("กรุณากรอกชื่อผู้ใช้")
    .isAlphanumeric().withMessage("ชื่อผู้ใช้ต้องเป็นตัวอักษรหรือตัวเลขเท่านั้น")
    .escape(),
  check("password")
    .trim()
    .notEmpty().withMessage("กรุณากรอกรหัสผ่าน")
    .isLength({ min: 6 }).withMessage("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร")
    .escape(),
], register);

// ✅ Login Route
router.post("/login", [
  loginLimiter, // Middleware ที่ใช้ลิมิตการพยายามเข้าสู่ระบบ
  check("username")
    .trim()
    .notEmpty().withMessage("กรุณากรอกชื่อผู้ใช้")
    .escape(),
  check("password")
    .trim()
    .notEmpty().withMessage("กรุณากรอกรหัสผ่าน")
    .escape(),
  check("recaptchaToken")
    .notEmpty().withMessage("ไม่พบ token ของ reCAPTCHA"),
], login);


module.exports = router;
