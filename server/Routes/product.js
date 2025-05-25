const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const mongoose = require("mongoose");

const {
  uploadProduct,
  uploadProductHandler,
  updateProduct,
  deleteProduct,
  addStock,
  getStockByProduct,
  deleteStock,
  buyProduct,
  getPurchaseHistory,
  updateStock,
} = require("../Controllers/product");

const Product = require("../Models/Product");
const { auth, isAdmin } = require("../Middleware/auth");

// ✅ Validation
const productValidation = [
  body("name").notEmpty().withMessage("กรุณากรอกชื่อสินค้า"),
  body("detail").notEmpty().withMessage("กรุณากรอกรายละเอียด"),
  body("price").isNumeric().withMessage("ราคาต้องเป็นตัวเลข"),
  body("categoryId").notEmpty().withMessage("กรุณาเลือกหมวดหมู่"),
];

const stockValidation = [
  body("productId").notEmpty().withMessage("ต้องระบุสินค้า"),
  body("username").notEmpty().withMessage("กรุณากรอกชื่อผู้ใช้"),
  body("password").notEmpty().withMessage("กรุณากรอกรหัสผ่าน"),
];

// ✅ ดึงสินค้าทั้งหมด
router.get("/product", async (req, res) => {
  try {
    const filter = {};
    if (req.query.categoryId) {
      if (!mongoose.Types.ObjectId.isValid(req.query.categoryId)) {
        return res.status(400).send("หมวดหมู่ไม่ถูกต้อง");
      }
      filter.categoryId = req.query.categoryId;
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// ✅ อัปโหลดสินค้า
router.post("/product/upload", uploadProduct, uploadProductHandler);

// ✅ แก้ไขสินค้า
router.put("/product/:id", uploadProduct, productValidation, async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).send("รหัสสินค้าผิดพลาด");
  }
  return updateProduct(req, res, next);
});

// ✅ จัดการสต็อก
router.post("/stock", stockValidation, addStock);

router.get("/stock/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).send("รหัสสินค้าผิดพลาด");
  }
  return getStockByProduct(req, res);
});

router.delete("/stock/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).send("รหัสสต็อกไม่ถูกต้อง");
  }
  return deleteStock(req, res);
});

// ✅ ซื้อสินค้า
router.post("/purchase/:id", auth, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).send("รหัสสินค้าผิดพลาด");
  }
  return buyProduct(req, res);
});

router.get("/purchase/history", auth, getPurchaseHistory);

// ✅ ลบสินค้า
router.delete("/product/:id", auth, isAdmin, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).send("รหัสสินค้าผิดพลาด");
  }
  return deleteProduct(req, res);
});

// ✅ แก้ไขสต็อก
router.put("/stock/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).send("รหัสสต็อกผิดพลาด");
  }
  return updateStock(req, res);
});

module.exports = router;
