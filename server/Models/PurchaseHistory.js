const mongoose = require("mongoose");

const purchaseHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    stockId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductStock",
      required: true,
    },
    username: String,
    password: String,
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.PurchaseHistory ||
  mongoose.model("PurchaseHistory", purchaseHistorySchema);
