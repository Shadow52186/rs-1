const mongoose = require("mongoose");
const SlipTopup = require("../Models/SlipTopup");
const TopupHistory = require("../Models/TopupHistory");


exports.getTopupHistory = async (req, res) => {
  try {
    const history = await TopupHistory.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    // 🛠️ แปลง sender/receiver เป็นข้อความ หากเป็น object
    const cleanedHistory = history.map((entry) => ({
      ...entry._doc,
      sender: typeof entry.sender === 'object' ? JSON.stringify(entry.sender) : entry.sender,
      receiver: typeof entry.receiver === 'object' ? JSON.stringify(entry.receiver) : entry.receiver,
    }));

    res.json({ history: cleanedHistory });
  } catch (err) {
    console.error("❌ ดึงประวัติการเติมเงินล้มเหลว", err);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
  }
};
