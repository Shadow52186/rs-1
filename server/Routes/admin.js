const express = require("express");
const router = express.Router();
const { auth, isAdmin } = require("../Middleware/auth");

const User = require("../Models/User");
const BannedIP = require("../Models/BannedIP");
const PurchaseHistory = require("../Models/PurchaseHistory");
const Product = require("../Models/Product");
const Category = require("../Models/Category");

// ✅ GET /admin/users
router.get("/admin/users", auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// ✅ GET /admin/banned-ips
router.get("/admin/banned-ips", auth, isAdmin, async (req, res) => {
  try {
    const ips = await BannedIP.find().sort({ bannedAt: -1 });
    res.json(ips);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// ✅ PUT /admin/user/:id
router.put("/admin/user/:id", auth, isAdmin, async (req, res) => {
  try {
    const { username, password, role, point } = req.body;
    const update = { username, role, point };
    if (password?.trim()) {
      const bcrypt = require("bcryptjs");
      const salt = await bcrypt.genSalt(10);
      update.password = await bcrypt.hash(password, salt);
    }
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).send("Update failed");
  }
});

// ✅ DELETE /admin/user/:id
router.delete("/admin/user/:id", auth, isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.send("Deleted");
  } catch (err) {
    res.status(500).send("Delete failed");
  }
});

// ✅ GET /admin/sales-log
router.get("/admin/sales-log", auth, isAdmin, async (req, res) => {
  try {
    const sales = await PurchaseHistory.find()
      .populate({
        path: "productId",
        select: "name categoryId price",
        populate: {
          path: "categoryId",
          model: "Category",
          select: "name",
        },
      })
      .populate("userId", "username")
      .sort({ createdAt: -1 });

    const result = sales.map((item) => ({
      _id: item._id,
      productName: item.productId?.name || "ไม่พบชื่อสินค้า",
      category: item.productId?.categoryId?.name || "ไม่พบหมวดหมู่",
      username: item.username,
      password: item.password,
      price: item.productId?.price || 0,
      soldAt: item.createdAt,
      buyerUsername: item.userId?.username || "ไม่พบผู้ซื้อ",
    }));

    res.json(result);
  } catch (err) {
    console.error("❌ โหลดประวัติการขายล้มเหลว", err);
    res.status(500).send("โหลดประวัติการขายล้มเหลว");
  }
});

module.exports = router;
