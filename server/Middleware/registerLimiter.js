const rateLimit = require("express-rate-limit");
const BannedIP = require("../Models/BannedIP");

const registerAttempts = {}; // เก็บความพยายามสมัครใน memory

const registerLimiter = async (req, res, next) => {
  const ip = req.ip;

  // ✅ เช็คว่า IP ถูกแบนถาวรหรือยัง
  const banned = await BannedIP.findOne({ ip });
  if (banned) {
    return res.status(403).json({
      error: "IP ของคุณถูกแบนจากระบบถาวร กรุณาติดต่อผู้ดูแลระบบ",
    });
  }

  // ✅ นับจำนวนการสมัคร
  if (!registerAttempts[ip]) registerAttempts[ip] = 1;
  else registerAttempts[ip]++;

  // ✅ ถ้าเกิน 25 ครั้ง → แบนถาวรและ reset
  if (registerAttempts[ip] > 25) {
    await BannedIP.create({ ip });
    delete registerAttempts[ip];
    return res.status(403).json({
      error: "IP ของคุณถูกแบนจากระบบถาวร",
    });
  }

  // ✅ Limit แบบช่วงเวลา (15 นาที 5 ครั้ง)
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
      error: "คุณสมัครมากเกินไป โปรดลองใหม่ในอีก 15 นาที",
    },
    standardHeaders: true,
    legacyHeaders: false,
  })(req, res, next);
};

module.exports = registerLimiter;
