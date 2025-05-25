const { validationResult } = require("express-validator");
const Category = require("../Models/Category");
const cloudinary = require("../utils/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// ✅ Cloudinary Multer Setup
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "categories",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});
const upload = multer({ storage });
exports.uploadCategoryImage = upload.single("image");

// ✅ ดึงหมวดหมู่ทั้งหมด
exports.listCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

// ✅ เพิ่มหมวดหมู่
exports.uploadCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { name } = req.body;
    const image = req.file?.path || "";
    const imagePublicId = req.file?.filename || "";

    const category = await new Category({ name, image, imagePublicId }).save();
    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error uploading category");
  }
};

// ✅ แก้ไขหมวดหมู่
exports.updateCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { id } = req.params;
    const { name } = req.body;
    const category = await Category.findById(id);
    if (!category) return res.status(404).send("ไม่พบหมวดหมู่เดิม");

    const updateData = { name };

    if (req.file) {
      if (category.imagePublicId) {
        await cloudinary.uploader.destroy(category.imagePublicId);
      }
      updateData.image = req.file.path;
      updateData.imagePublicId = req.file.filename;
    }

    const updated = await Category.findByIdAndUpdate(id, updateData, { new: true });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).send("แก้ไขหมวดหมู่ล้มเหลว");
  }
};

// ✅ ลบหมวดหมู่
exports.removeCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).send("ไม่พบหมวดหมู่");

    if (category.imagePublicId) {
      await cloudinary.uploader.destroy(category.imagePublicId);
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "ลบหมวดหมู่แล้ว", category });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting category");
  }
};
