const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: String,
    detail: String,
    price: String,
    image: {
      type: String,
      default: "noimage.jpg", // จะถูกแทนที่เมื่ออัปโหลด
    },
    imagePublicId: {
      type: String,
      default: "", // ไว้เก็บ Public ID สำหรับลบจาก Cloudinary
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Product || mongoose.model("Product", productSchema);
