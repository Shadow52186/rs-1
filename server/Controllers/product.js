const Product = require("../Models/Product");
const ProductStock = require("../Models/ProductStock");
const PurchaseHistory = require("../Models/PurchaseHistory");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { validationResult } = require("express-validator");
const util = require("util");

// Cloudinary Config
const cloudinary = require("../utils/cloudinary");

// Multer Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "game-id-store", 
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

const upload = multer({ storage });

// Middleware สำหรับอัปโหลดรูป
exports.uploadProduct = upload.single("image");

// เพิ่มสินค้าใหม่
exports.uploadProductHandler = async (req, res) => {
  try {
    console.log("📥 Body:", req.body);
    console.log("📷 File:", req.file); // 👈 ตรวจว่า Multer ได้ไฟล์หรือยัง

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("❌ Validation Errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, detail, price, categoryId, isFeatured } = req.body;

    const product = new Product({
      name,
      detail,
      price,
      categoryId,
      image: req.file?.path || "",
      imagePublicId: req.file?.filename || "",
      isFeatured: isFeatured === "true",
    });

    await product.save();
    res.send("Product uploaded successfully");
  } catch (err) {
    console.error("❌ UPLOAD ERROR (stringify):", JSON.stringify(err, null, 2));
    console.error(
      "❌ UPLOAD ERROR (inspect):",
      util.inspect(err, { showHidden: false, depth: null })
    );
    res
      .status(500)
      .json({ error: err.message || "Upload failed", stack: err.stack });
  }
};


// แก้ไขสินค้า
exports.updateProduct = async (req, res) => {
  try {
    const { name, detail, price, categoryId, isFeatured } = req.body;
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) return res.status(404).send("Product not found");

    // ลบรูปเดิมจาก Cloudinary
    if (req.file && product.imagePublicId) {
      await cloudinary.uploader.destroy(product.imagePublicId);
    }

    // อัปเดตข้อมูล
    product.name = name;
    product.detail = detail;
    product.price = price;
    product.categoryId = categoryId;
    product.isFeatured = isFeatured === "true"; 

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

// ลบสินค้า
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
    const product = await Product.findById(req.params.id)
      .populate('categoryId', 'name');
    
    if (!product) return res.status(404).send("Product not found");

    const stock = await ProductStock.findOne({ productId: product._id });
    if (!stock) return res.status(400).send("สินค้าไม่มี stock");

    if (req.user.point < product.price) {
      return res.status(400).send("point ไม่พอ");
    }

    req.user.point -= product.price;
    await req.user.save();

    // เก็บข้อมูลสำคัญไว้ใน PurchaseHistory
    const purchase = new PurchaseHistory({
      userId: req.user._id,
      productId: product._id,
      stockId: stock._id,
      productName: product.name,
      categoryName: product.categoryId?.name || "ไม่ทราบหมวด",
      buyerUsername: req.user.username,
      purchasePrice: product.price,
      username: stock.username,
      password: stock.password,
    });

    await purchase.save();
    await stock.deleteOne();

    res.send("ซื้อสินค้าสำเร็จ");
  } catch (err) {
    console.error(err);
    res.status(500).send("ซื้อสินค้าไม่สำเร็จ");
  }
};

// ประวัติการซื้อ
exports.getPurchaseHistory = async (req, res) => {
  try {
    const history = await PurchaseHistory.find({ userId: req.user._id })
      .populate({
        path: "productId",
        select: "name image price categoryId",
      })
      .sort({ createdAt: -1 });

    const result = history.map((item) => ({
      _id: item._id,
      username: item.username,
      password: item.password,
      createdAt: item.createdAt,
      product: {
        name: item.productId?.name || "ไม่พบชื่อสินค้า",
        image: item.productId?.image || "",
        price: item.productId?.price || 0,
        categoryId: item.productId?.categoryId || null,
      },
    }));

    res.json(result);
  } catch (err) {
    console.error("❌ Error loading purchase history:", err);
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

// ✅ แสดงประวัติการขายทั้งหมดสำหรับแอดมิน
exports.getSalesLog = async (req, res) => {
  console.log("=== USING NEW BACKEND CODE ===");
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { categoryName: { $regex: search, $options: 'i' } },
        { buyerUsername: { $regex: search, $options: 'i' } }
      ];
    }

    console.log("=== BACKEND DEBUG ===");
    console.log("Query:", JSON.stringify(query, null, 2));

    const history = await PurchaseHistory.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await PurchaseHistory.countDocuments(query);

    console.log("Raw DB Results:", JSON.stringify(history, null, 2));
    console.log("First Item purchasePrice:", history[0]?.purchasePrice);

    // 🚨 ตรวจสอบการ mapping - ปัญหาน่าจะอยู่ตรงนี้
    const result = history.map((item) => {
      const mapped = {
        productName: item.productName,
        category: item.categoryName,  // ✅ ใช้ categoryName
        price: item.purchasePrice,    // ✅ ใช้ purchasePrice ไม่ใช่ price
        username: item.username,
        password: item.password,
        soldAt: item.createdAt,
        buyerUsername: item.buyerUsername,
      };
      console.log("Mapping item:", {
        original: item.purchasePrice,
        mapped: mapped.price
      });
      return mapped;
    });

    console.log("Final mapped result:", JSON.stringify(result, null, 2));
    console.log("First mapped price:", result[0]?.price);
    console.log("====================");

    const response = {
      sales: result,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };

    console.log("Response being sent:", JSON.stringify(response, null, 2));

    res.json(response);
  } catch (err) {
    console.error("Error loading sales log:", err);
    res.status(500).json({ 
      error: "โหลดประวัติการขายไม่สำเร็จ",
      details: err.message 
    });
  }
};

exports.getFeaturedProducts = async (req, res) => {
  try {
    const featured = await Product.find({ isFeatured: true }).limit(6);
    res.json(featured);
  } catch (err) {
    console.error("❌ Error loading featured products:", err);
    res.status(500).send("โหลดสินค้าแนะนำไม่สำเร็จ");
  }
};
