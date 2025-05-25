const User = require("../Models/User");
const Product = require("../Models/Product");
const Category = require("../Models/Category");
const PurchaseHistory = require("../Models/PurchaseHistory");

exports.getStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();
    const soldCount = await PurchaseHistory.countDocuments();
    const categoryCount = await Category.countDocuments();

    res.json({
      users: userCount,
      products: productCount,
      sold: soldCount,
      categories: categoryCount,
    });
  } catch (err) {
    console.error("Error loading stats:", err);
    res.status(500).send("Error loading stats");
  }
};
