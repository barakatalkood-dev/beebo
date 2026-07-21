const express = require("express");
const router = express.Router();

const setupController = require("../controllers/setupController");

// بدون authMiddleware عمداً — آمن لأنه يتحقق داخلياً إن الجداول فاضية قبل أي إضافة
router.post("/seed-initial-data", setupController.seedInitialData);

module.exports = router;
