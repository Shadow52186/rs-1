const express = require("express");
const router = express.Router();
const Stock = require("../Models/Stock");

// เพิ่มสต็อกใหม่
router.post("/stock", async (req, res) => {
  try {
    const { productId, username, password } = req.body;
    const stock = new Stock({ productId, username, password });
    await stock.save();
    res.json(stock);
  } catch (err) {
    res.status(500).send("Add stock failed");
  }
});

// ดูสต็อกทั้งหมดของสินค้า
router.get("/stock/:productId", async (req, res) => {
  try {
    const stocks = await Stock.find({ productId: req.params.productId });
    res.json(stocks);
  } catch (err) {
    res.status(500).send("Fetch stock failed");
  }
});

// แก้ไขสต็อก
router.put("/stock/:id", async (req, res) => {
  try {
    const stock = await Stock.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(stock);
  } catch (err) {
    res.status(500).send("Update failed");
  }
});

// ลบสต็อก
router.delete("/stock/:id", async (req, res) => {
  try {
    await Stock.findByIdAndDelete(req.params.id);
    res.send("Deleted");
  } catch (err) {
    res.status(500).send("Delete failed");
  }
});

module.exports = router;
