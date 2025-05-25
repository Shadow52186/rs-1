const User = require("../Models/User");

// ดึงผู้ใช้ทั้งหมด
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

// อัปเดตผู้ใช้
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).send("User not found");
    res.send(user);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

// ลบผู้ใช้
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).send("User not found");
    res.send("User deleted");
  } catch (err) {
    res.status(500).send("Server Error");
  }
};
