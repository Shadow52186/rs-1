const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const { redeemTrueMoney } = require("../Controllers/topup");
const { getTopupHistory } = require("../Controllers/topupHistory");
const { auth, requireLogin } = require("../Middleware/auth");

// ✅ POST: เติมเงิน พร้อม validate link
router.post("/topup/redeem", auth, [
  check("link", "กรุณาใส่ลิงก์ซอง").notEmpty(),
  check("link", "ลิงก์ต้องขึ้นต้นด้วย https://gift.truemoney.com").custom((val) =>
    val.startsWith("https://gift.truemoney.com/")
  ),
], redeemTrueMoney);

// ✅ GET: ดูประวัติการเติมเงิน
router.get("/topup/history", requireLogin, getTopupHistory);

module.exports = router;
