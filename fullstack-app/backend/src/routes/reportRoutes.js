const express = require("express");
const router = express.Router();

const reportController = require("../controllers/reportController");
const authMiddleware = require("../middleware/authMiddleware");

// التقارير للأدمن فقط
router.use(authMiddleware);
router.use(authMiddleware.requireAdmin);

router.get("/", reportController.getReports);

module.exports = router;
