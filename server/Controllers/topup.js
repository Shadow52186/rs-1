const axios = require("axios");
const qs = require("qs");
const { validationResult } = require("express-validator");

const User = require("../Models/User");
const TopupHistory = require("../Models/TopupHistory");
const UsedTrueMoney = require("../Models/UsedTrueMoney");

exports.redeemTrueMoney = async (req, res) => {
  // ✅ ตรวจ validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userId = req.user.id;
  const { link } = req.body;

  const keyapi = process.env.BYSHOP_API_KEY;
  const phone = process.env.BYSHOP_PHONE;

  const existing = await UsedTrueMoney.findOne({ link });
  if (existing) {
    return res.status(400).json({ error: "ลิงก์นี้ถูกใช้งานไปแล้ว" });
  }

  try {
    const form = qs.stringify({ keyapi, phone, gift_link: link });

    const response = await axios.post("https://byshop.me/api/truewallet", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const { amount, status, message } = response.data;

    if (!amount || isNaN(amount)) {
      await UsedTrueMoney.create({ link, usedBy: userId, status: "fail" });
      return res.status(400).json({ error: message || "ไม่สามารถเติมเงินได้" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { point: amount } },
      { new: true }
    );

    await UsedTrueMoney.create({ link, usedBy: userId, amount, status: "success" });

    await new TopupHistory({
      userId,
      amount,
      note: "เติมผ่านซองอั่งเปา",
    }).save();

    res.json({ message: `เติมเงินสำเร็จ ${amount} บาท`, newPoint: user.point });
  } catch (err) {
    console.error("❌ ByShop Error:", err.response?.data || err.message);
    await UsedTrueMoney.create({ link, usedBy: userId, status: "fail" });
    return res.status(400).json({ error: "ลิงก์ไม่ถูกต้อง หรือซองนี้หมดอายุแล้ว" });
  }
};
