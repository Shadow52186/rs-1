const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String },          // ✅ Cloudinary image URL
  imagePublicId: { type: String },  // ✅ ใช้ลบจาก Cloudinary
});

module.exports = mongoose.model("Category", categorySchema);
