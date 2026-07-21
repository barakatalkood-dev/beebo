const express = require("express");
const router = express.Router();

const appointmentController = require("../controllers/appointmentController");
const authMiddleware = require("../middleware/authMiddleware");

// جميع العمليات تحتاج تسجيل الدخول
router.use(authMiddleware);

// عرض جميع المواعيد
router.get("/", appointmentController.getAppointments);

// الأوقات المتاحة ليوم/خدمة معينة
router.get("/available-times", appointmentController.getAvailableTimes);

// المواعيد القريبة للموظف الحالي (للتنبيهات)
router.get("/upcoming", appointmentController.getUpcomingAppointments);

// عرض موعد واحد
router.get("/:id", appointmentController.getAppointment);

// إنشاء موعد جديد
router.post("/", appointmentController.createAppointment);

// تعديل موعد
router.put("/:id", appointmentController.updateAppointment);

// تسجيل الدفع (كاش / تحويل / فيزا) وإصدار الفاتورة
router.post("/:id/pay", appointmentController.payAppointment);

// حذف موعد (أدمن فقط)
router.delete("/:id", authMiddleware.requireAdmin, appointmentController.deleteAppointment);

module.exports = router;