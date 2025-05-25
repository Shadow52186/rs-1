const Product = require("../Models/Product");
const ProductStock = require("../Models/ProductStock");
const PurchaseHistory = require("../Models/PurchaseHistory");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { validationResult } = require("express-validator");
const util = require("util"); // 👈 เพิ่มไว้ด้านบนสุดของไฟล์

// ✅ Cloudinary Config
const cloudinary = require("../utils/cloudinary");

// ✅ Multer Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "game-id-store", // 👈 ตั้งชื่อโฟลเดอร์ใน Cloudinary
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

const upload = multer({ storage });

// ✅ Middleware สำหรับอัปโหลดรูป
exports.uploadProduct = upload.single("image");

// ✅ เพิ่มสินค้าใหม่
exports.uploadProductHandler = async (req, res) => {
  try {
    console.log("📥 Body:", req.body);
    console.log("📷 File:", req.file); // 👈 ตรวจว่า Multer ได้ไฟล์หรือยัง

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("❌ Validation Errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, detail, price, categoryId } = req.body;

    const product = new Product({
      name,
      detail,
      price,
      categoryId,
      image: req.file?.path || "",
      imagePublicId: req.file?.filename || "",
    });

    await product.save();
    res.send("Product uploaded successfully");
  } catch (err) {
    console.error("❌ UPLOAD ERROR (stringify):", JSON.stringify(err, null, 2));
    console.error("❌ UPLOAD ERROR (inspect):", util.inspect(err, { showHidden: false, depth: null }));
    res.status(500).json({ error: err.message || "Upload failed", stack: err.stack });
  }
};


// ✅ แก้ไขสินค้า
exports.updateProduct = async (req, res) => {
  try {
    const { name, detail, price, categoryId } = req.body;
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) return res.status(404).send("Product not found");

    // ✅ ลบรูปเดิมจาก Cloudinary
    if (req.file && product.imagePublicId) {
      await cloudinary.uploader.destroy(product.imagePublicId);
    }

    // ✅ อัปเดตข้อมูล
    product.name = name;
    product.detail = detail;
    product.price = price;
    product.categoryId = categoryId;

    if (req.file) {
      product.image = req.file.path;
      product.imagePublicId = req.file.filename;
    }

    await product.save();
    res.send("Product updated");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Upload failed" });
  }
};

// ✅ ลบสินค้า
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send("Product not found");

    if (product.imagePublicId) {
      await cloudinary.uploader.destroy(product.imagePublicId);
    }

    await product.deleteOne();
    res.send("Product deleted");
  } catch (err) {
    console.error(err);
    res.status(500).send("Delete failed");
  }
};

// ✅ เพิ่ม Stock
exports.addStock = async (req, res) => {
  try {
    const { productId, username, password } = req.body;
    const stock = new ProductStock({ productId, username, password });
    await stock.save();
    res.send("Stock added");
  } catch (err) {
    console.error(err);
    res.status(500).send("Add stock failed");
  }
};

// ✅ ดึง Stock
exports.getStockByProduct = async (req, res) => {
  try {
    const stocks = await ProductStock.find({ productId: req.params.id });
    res.json(stocks);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to load stock");
  }
};

// ✅ ลบ Stock
exports.deleteStock = async (req, res) => {
  try {
    await ProductStock.findByIdAndDelete(req.params.id);
    res.send("Stock deleted");
  } catch (err) {
    console.error(err);
    res.status(500).send("Delete stock failed");
  }
};

// ✅ ซื้อสินค้า
exports.buyProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send("Product not found");

    const stock = await ProductStock.findOne({ productId: product._id });
    if (!stock) return res.status(400).send("สินค้าไม่มี stock");

    if (req.user.point < product.price) {
      return res.status(400).send("point ไม่พอ");
    }

    req.user.point -= product.price;
    await req.user.save();

    const purchase = new PurchaseHistory({
      userId: req.user._id,
      productId: product._id,
      username: stock.username,
      password: stock.password,
      stockId: stock._id,
    });

    await purchase.save();
    await stock.deleteOne();

    res.send("ซื้อสินค้าสำเร็จ");
  } catch (err) {
    console.error(err);
    res.status(500).send("ซื้อสินค้าไม่สำเร็จ");
  }
};

// ✅ ประวัติการซื้อ
exports.getPurchaseHistory = async (req, res) => {
  try {
    const history = await PurchaseHistory.find({
      userId: req.user._id,
    }).populate("productId");
    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).send("โหลดประวัติการซื้อไม่สำเร็จ");
  }
};


// ✅ อัปเดต Stock
exports.updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password } = req.body;
    const stock = await ProductStock.findByIdAndUpdate(
      id,
      { username, password },
      { new: true }
    );
    if (!stock) return res.status(404).send("Stock not found");
    res.json(stock);
  } catch (err) {
    console.error(err);
    res.status(500).send("Update stock failed");
  }
};
