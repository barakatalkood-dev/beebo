const express = require("express");
const router = express.Router();

const customerController = require("../controllers/customerController");
const authMiddleware = require("../middleware/authMiddleware");

// جميع العمليات تحتاج تسجيل دخول
router.use(authMiddleware);

// عرض جميع العملاء
router.get("/", customerController.getCustomers);

// بحث العملاء
router.get(
 "/search",
 customerController.searchCustomers
);

// عرض عميل واحد
router.get("/:id", customerController.getCustomer);

// إنشاء عميل
router.post("/", customerController.createCustomer);

// تعديل عميل
router.put("/:id", customerController.updateCustomer);

// حذف عميل
router.delete("/:id", customerController.deleteCustomer);

module.exports = router;