const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const authController = require("../controllers/authController");

// Register
router.post("/register", authController.register);
router.post("/login", authController.login);

router.get("/profile", authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: "Profile loaded successfully",
    user: req.user,
  });
});

module.exports = router;