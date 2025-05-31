const express = require("express");
const router = express.Router();

// ✅ ตัวอย่าง route ที่ถูกต้อง
router.get("/cloud", (req, res) => {
  res.send("Cloudinary API");
});

module.exports = router; // ✅ ต้องมี
