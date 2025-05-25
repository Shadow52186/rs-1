// routes/admin.js
const express = require("express");
const router = express.Router();
const { auth, isAdmin } = require("../Middleware/auth");

router.get("/admin/data", auth, isAdmin, (req, res) => {
  res.send("✅ Admin access granted");
});

module.exports = router;