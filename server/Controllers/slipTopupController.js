const axios = require("axios");
const User = require("../Models/User");
const TopupHistory = require("../Models/TopupHistory");

exports.verifySlip = async (req, res) => {
  const { qrcode_text } = req.body;
  const qrcode = qrcode_text;
  const userId = req.user.id;

  if (!qrcode) {
    return res.status(400).json({ error: "ไม่พบ QR Code" });
  }

  try {
    const form = new URLSearchParams({
      qrcode_text: qrcode,
      keyapi: process.env.BYSHOP_API_KEY,
    });

    const response = await axios.post(
      "https://byshop.me/api/check_slip",
      form.toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const data = response.data;

    // ❌ ถ้า QR ถูกใช้ไปแล้ว
    if (data.check_slip === 1) {
      return res.status(409).json({ error: "สลิปนี้ถูกใช้งานแล้ว" });
    }

    // ✅ ตรวจสอบเวลาสลิป
    const slipTimestamp = new Date(data.slip_time).getTime();
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    if (now - slipTimestamp > fiveMinutes) {
      return res
        .status(400)
        .json({ error: "❌ สลิปหมดอายุ กรุณาโอนใหม่ภายใน 5 นาที" });
    }

    // ✅ ถ้าสลิปถูกต้องและไม่เคยใช้
    if (data.status === 1 && data.check_slip === 0) {
      const amount = parseFloat(data.amount);

      // เพิ่มยอดเงินให้ผู้ใช้
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: "ไม่พบผู้ใช้" });

      user.point += amount;
      await user.save();

      // บันทึกประวัติ
      await TopupHistory.create({
        userId: userId, // ✅ ตรงกับ field ใน Schema
        amount,
        transaction_id: data.slip_ref,
        slip_time: data.slip_time,
        sender: data.sender,
        receiver: data.receiver,
        method: "bank", // ✅ เพิ่ม
      });

      return res.json({
        status: "success",
        message: "เติมเงินสำเร็จ",
        amount,
        balance: user.point, // ✅ เปลี่ยนจาก user.balance → user.point
        transaction_id: data.slip_ref, // ✅ แก้ตรงนี้!
      });
    } else {
      return res.status(400).json({ error: "ข้อมูลไม่ถูกต้อง" });
    }
  } catch (err) {
    console.error("❌ ตรวจสอบสลิปล้มเหลว", err);
    console.log("📦 req.body:", req.body);

    return res.status(500).json({ error: "เซิร์ฟเวอร์ไม่สามารถตรวจสอบได้" });
  }
};
