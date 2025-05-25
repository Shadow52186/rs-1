const rateLimit = require("express-rate-limit");
const LoginAttempt = require('../Models/LoginAttempt');
const BannedIP = require("../Models/BannedIP");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 นาที
  max: 5, // จำกัดการพยายามเข้าสู่ระบบสูงสุด 5 ครั้งใน 15 นาที
  message: "พยายามเข้าสู่ระบบมากเกินไป กรุณาลองใหม่ในอีก 15 นาที",
  skipFailedRequests: false, // ไม่ข้ามคำขอที่ล้มเหลว
  handler: async (req, res, next) => {
    const ip = req.ip;

    // ตรวจสอบว่า IP นี้ถูกแบนถาวรหรือไม่
    const bannedIP = await BannedIP.findOne({ ip });
    if (bannedIP) {
      return res.status(429).json({
        message: "คุณถูกแบนถาวรเนื่องจากพยายามเข้าสู่ระบบผิดพลาดหลายครั้ง กรุณาติดต่อผู้ดูแลระบบ",
      });
    }

    // เพิ่มการตรวจสอบว่า IP นี้ได้พยายามเข้าสู่ระบบล้มเหลวเกินจำนวนที่กำหนดหรือไม่
    const attempt = await LoginAttempt.findOne({ ip });
    
    if (attempt && attempt.count >= 20) {
      // ถ้าการพยายามเกิน 20 ครั้ง ให้แบน IP นี้ถาวร
      const newBannedIP = new BannedIP({ ip });
      await newBannedIP.save();
      return res.status(429).json({
        message: "คุณถูกแบนถาวรเนื่องจากพยายามเข้าสู่ระบบผิดพลาดหลายครั้ง กรุณาติดต่อผู้ดูแลระบบ",
      });
    }

    // หากไม่เกิน 20 ครั้ง ก็ให้ดำเนินการตามปกติ
    next();
  },
});

module.exports = loginLimiter;
