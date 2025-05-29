const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: String,
    detail: String,
    price: String,
    image: {
      type: String,
      default: "noimage.jpg",
    },
    imagePublicId: {
      type: String,
      default: "",
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    isFeatured: {
      type: Boolean,
      default: false, // ✅ เพิ่มตรงนี้
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Product || mongoose.model("Product", productSchema);
