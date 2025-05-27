const express = require("express");
const router = express.Router();
const { auth, isAdmin } = require("../Middleware/auth");
const User = require("../Models/User");
const BannedIP = require("../Models/BannedIP");

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

module.exports = router;
