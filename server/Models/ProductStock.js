const mongoose = require("mongoose");

const productStockSchema = new mongoose.Schema({
  username: String,
  password: String,
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  isSold: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

module.exports = mongoose.models.ProductStock || mongoose.model("ProductStock", productStockSchema);
