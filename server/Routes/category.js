const express = require("express");
const { check, param } = require("express-validator");
const router = express.Router();
const {
  listCategories,
  uploadCategory,
  removeCategory,
  updateCategory,
  uploadCategoryImage,
} = require("../Controllers/category");

const Category = require("../Models/Category");

// ✅ GET all categories
router.get("/categories", listCategories);

// ✅ GET single category
router.get("/categories/:id", [
  param("id", "ID ไม่ถูกต้อง").isMongoId(),
], async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).send("Category not found");
    res.json(category);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// ✅ POST: upload + create
router.post(
  "/category/upload",
  uploadCategoryImage,
  [check("name", "กรุณากรอกชื่อหมวดหมู่").notEmpty()],
  uploadCategory
);

// ✅ PUT: update
router.put(
  "/category/:id",
  uploadCategoryImage,
  [
    param("id", "ID ไม่ถูกต้อง").isMongoId(),
    check("name", "กรุณากรอกชื่อหมวดหมู่").notEmpty(),
  ],
  updateCategory
);

// ✅ DELETE
router.delete("/category/:id", [
  param("id", "ID ไม่ถูกต้อง").isMongoId(),
], removeCategory);

module.exports = router;
