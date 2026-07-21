const express = require("express");
const router = express.Router();

const serviceController = require("../controllers/serviceController");

// لا تستورد authMiddleware حالياً
// const authMiddleware = require("../middleware/authMiddleware");

router.get("/", serviceController.getServices);

// بدون authMiddleware
router.post("/", serviceController.createService);

router.put("/:id", serviceController.updateService);

router.delete("/:id", serviceController.deleteService);

module.exports = router;