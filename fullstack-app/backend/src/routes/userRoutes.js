const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

// جميع العمليات تحتاج تسجيل دخول
router.use(authMiddleware);

// عرض جميع الموظفين (أدمن فقط)
router.get("/", authMiddleware.requireAdmin, userController.getUsers);

// عرض موظف واحد
router.get("/:id", userController.getUser);

// إنشاء موظف (أدمن فقط)
router.post("/", authMiddleware.requireAdmin, userController.createUser);

// تعديل موظف (المستخدم نفسه أو الأدمن — يتحقق داخل الكنترولر)
router.put("/:id", userController.updateUser);

// حذف موظف (أدمن فقط)
router.delete("/:id", authMiddleware.requireAdmin, userController.deleteUser);

module.exports = router;