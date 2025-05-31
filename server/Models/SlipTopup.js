const mongoose = require("mongoose");

const slipTopupSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    from: {
      type: String,
      required: true,
    },
    bank: {
      type: String,
      required: true, 
    },
    datetime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("SlipTopup", slipTopupSchema);