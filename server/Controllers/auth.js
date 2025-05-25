const { validationResult } = require("express-validator");
const User = require("../Models/User");
const jwt = require("jsonwebtoken");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const LoginAttempt = require("../Models/LoginAttempt");
const BannedIP = require("../Models/BannedIP");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose"); // ✅ ตรวจสอบ ObjectId

// ✅ REGISTER
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const rawUsername = req.body.username || "";
    const rawPassword = req.body.password || "";

    const username = String(rawUsername).trim();
    const password = String(rawPassword).trim();

    if (password.length < 6) {
      return res.status(400).send("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send("User Already Exists!!");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, role: "user" });
    await user.save();

    return res.status(201).send("Register Successfully!!");
  } catch (err) {
    console.error("❌ Register Error:", err);
    return res.status(500).send("Server Error");
  }
};

// ✅ LOGIN
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const rawUsername = req.body.username || "";
    const rawPassword = req.body.password || "";
    const recaptchaToken = req.body.recaptchaToken;

    if (!recaptchaToken) {
      return res.status(400).send("reCAPTCHA token is missing");
    }

    // ✅ Verify reCAPTCHA
    const verifyRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: process.env.RECAPTCHA_SECRET,
        response: recaptchaToken,
      }),
    });

    const verifyData = await verifyRes.json();
    if (!verifyData.success) {
      return res.status(403).json({
        error: "Failed reCAPTCHA verification",
        detail: verifyData,
      });
    }

    const username = String(rawUsername).trim();
    const password = String(rawPassword).trim();

    const user = await User.findOne({ username });
    const isMatch = await bcrypt.compare(password, user?.password || "");

    if (!user || !isMatch) {
      // เพิ่มการพยายามเข้าสู่ระบบ
      const ip = req.ip; // ใช้ IP เพื่อจำกัดการพยายาม
      const attempt = await LoginAttempt.findOne({ ip });

      if (attempt) {
        attempt.count += 1;
        attempt.lastAttempt = Date.now();

        // หากการพยายามเกิน 20 ครั้ง ให้แบน IP นี้
        if (attempt.count >= 20) {
          const newBannedIP = new BannedIP({ ip });
          await newBannedIP.save();
          return res.status(429).json({
            message: "คุณถูกแบนถาวรเนื่องจากพยายามเข้าสู่ระบบผิดพลาดหลายครั้ง กรุณาติดต่อผู้ดูแลระบบ",
          });
        }

        await attempt.save();
      } else {
        // หากไม่เคยมีการบันทึกการพยายามเข้าสู่ระบบจาก IP นี้
        const newAttempt = new LoginAttempt({ ip, count: 1 });
        await newAttempt.save();
      }

      return res.status(401).send("Invalid username or password");
    }

    const payload = {
      id: user._id,
      username: user.username,
      role: user.role || "user",
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    await LoginAttempt.findOneAndDelete({ username });

    return res.status(200).json({
      message: "Login success",
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role || "user",
      },
    });
  } catch (err) {
    console.error("❌ Server Error:", err);
    return res.status(500).send("Server Error");
  }
};
