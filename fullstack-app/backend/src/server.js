require("dotenv").config();

const { Op } = require("sequelize");
const app = require("./app");
const sequelize = require("./config/database");

// استدعاء جميع الـ Models
const User = require("./models/User");
const Service = require("./models/Service");
const dashboardRoutes = require("./routes/dashboardRoutes");
const { Appointment, AppointmentServiceItem } = require("./models");
const PORT = process.env.PORT || 5000;

// مواعيد قديمة مربوطة بخدمة واحدة (service_id) قبل دعم تعدد الخدمات —
// ننسخها لجدول appointment_service_items مرة وحدة حتى تظهر صح بالواجهة
// الجديدة. آمنة تتكرر (idempotent): تتجاهل أي موعد عنده سطور أصلاً.
async function backfillLegacyServiceItems() {
  const legacyAppointments = await Appointment.findAll({
    where: { service_id: { [Op.ne]: null } },
  });

  for (const appt of legacyAppointments) {
    const alreadyMigrated = await AppointmentServiceItem.count({
      where: { appointment_id: appt.id },
    });

    if (alreadyMigrated > 0) continue;

    const service = await Service.findByPk(appt.service_id);
    if (!service) continue;

    await AppointmentServiceItem.create({
      appointment_id: appt.id,
      service_id: service.id,
      price: service.price,
      duration: service.duration,
    });
  }
}

(async () => {
  try {
    // الاتصال بقاعدة البيانات
    await sequelize.authenticate();
    console.log("✅ Connected to MySQL");

    // إنشاء الجداول إذا لم تكن موجودة، وتحديث الأعمدة الناقصة تلقائياً
    await sequelize.sync({ alter: true });
    console.log("✅ Database synced");

    // ترحيل المواعيد القديمة (خدمة واحدة) لنظام تعدد الخدمات
    await backfillLegacyServiceItems();
    console.log("✅ Legacy appointment services backfilled");

    // تشغيل السيرفر
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error("❌ Database connection failed:");
    console.error(err);
  }
})();