const express = require("express");
const router = express.Router();
const { getStats } = require("../Controllers/stats");

router.get("/stats", getStats);

module.exports = router;
