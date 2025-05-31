const mongoose = require("mongoose");

const topupHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  note: {
    type: String
  },

  // ✅ เพิ่ม field ใหม่จาก ByShop แต่ไม่กระทบของเก่า
  transaction_id: {
    type: String,
    unique: true,
    sparse: true // ป้องกัน unique error หากไม่มีค่าตอนบันทึกของเดิม
  },
  slip_time: {
    type: String
  },
  sender: {
    type: Object
  },
  receiver: {
    type: Object
  }

}, { timestamps: true });

module.exports = mongoose.model("TopupHistory", topupHistorySchema);
