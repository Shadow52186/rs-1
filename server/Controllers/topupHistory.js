const mongoose = require("mongoose");
const TopupHistory = require("../Models/TopupHistory");

exports.getTopupHistory = async (req, res) => {
  try {
    console.log("✅ USER IN TOKEN =", req.user); // 🟢 เพิ่มตรงนี้

    const history = await TopupHistory.find({
      userId: new mongoose.Types.ObjectId(req.user.id)
    }).sort({ createdAt: -1 });

    res.json(history);
  } catch (err) {
    console.error("❌ โหลดประวัติการเติมเงินล้มเหลว", err);
    res.status(500).send("Server Error");
  }
};
