const { Op, fn, col } = require("sequelize");
const User = require("../models/User");
const Service = require("../models/Service");
const Customer = require("../models/Customer");
const Appointment = require("../models/Appointment");
const AppointmentServiceItem = require("../models/AppointmentServiceItem");

function todayLocal() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function toDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dateRangeArray(fromStr, toStr) {
  const dates = [];
  const cur = new Date(`${fromStr}T00:00:00`);
  const end = new Date(`${toStr}T00:00:00`);

  while (cur <= end) {
    dates.push(toDateStr(cur));
    cur.setDate(cur.getDate() + 1);
  }

  return dates;
}

exports.getDashboard = async (req, res) => {
  try {
    const today = todayLocal();
    const isAdmin = req.user.role === "admin";

    // الموظف العادي يشوف مواعيده هو بس، الأدمن يشوف كل شيء
    const scopeWhere = isAdmin ? {} : { employee_id: req.user.id };

    // إحصائيات عامة — للأدمن فقط
    const employees = isAdmin ? await User.count() : 0;
    const services = isAdmin ? await Service.count() : 0;

    // عدد مواعيد اليوم
    const appointmentsToday = await Appointment.count({
      where: { appointment_date: today, ...scopeWhere },
    });

    // مواعيد اليوم مرتبة حسب الوقت
    const recentAppointments = await Appointment.findAll({
      where: { appointment_date: today, ...scopeWhere },
      order: [["appointment_time", "ASC"]],
      limit: 10,
      attributes: [
        "id",
        "appointment_date",
        "appointment_time",
        "status",
        "payment_status",
      ],
      include: [
        { model: Customer, attributes: ["full_name"] },
        { model: User, attributes: ["full_name"] },
        {
          model: AppointmentServiceItem,
          as: "ServiceItems",
          attributes: ["price", "duration"],
          include: [{ model: Service, attributes: ["name"] }],
        },
      ],
    });

    const recentAppointmentsWithServices = recentAppointments.map((appt) => {
      const json = appt.toJSON();
      json.services = (json.ServiceItems || []).map((item) => item.Service?.name).filter(Boolean);
      delete json.ServiceItems;
      return json;
    });

    // إيرادات اليوم (المدفوعة فقط) — للأدمن فقط
    let revenueToday = 0;

    if (isAdmin) {
      const revenueRow = await Appointment.findOne({
        attributes: [[fn("SUM", col("paid_amount")), "total"]],
        where: {
          payment_status: "paid",
          appointment_date: today,
        },
        raw: true,
      });

      revenueToday = Number(revenueRow?.total || 0);
    }

    res.json({
      success: true,

      isAdmin,

      stats: {
        employees,
        services,
        appointmentsToday,
        revenueToday,
      },

      recentAppointments: recentAppointmentsWithServices,
    });


  } catch (error) {

    console.error("Dashboard Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// إيرادات آخر N يوم (يومياً) — لرسم شارت الداشبورد
exports.getRevenueChart = async (req, res) => {
  try {
    const days = Math.min(parseInt(req.query.days, 10) || 14, 90);

    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (days - 1));

    const fromStr = toDateStr(start);
    const toStr = toDateStr(end);

    const rows = await Appointment.findAll({
      attributes: [
        "appointment_date",
        [fn("SUM", col("paid_amount")), "revenue"],
      ],
      where: {
        payment_status: "paid",
        appointment_date: { [Op.between]: [fromStr, toStr] },
      },
      group: ["appointment_date"],
      raw: true,
    });

    const revenueByDate = {};

    rows.forEach((row) => {
      revenueByDate[row.appointment_date] = Number(row.revenue || 0);
    });

    const chart = dateRangeArray(fromStr, toStr).map((date) => ({
      date,
      revenue: revenueByDate[date] || 0,
    }));

    res.json({
      success: true,
      chart,
    });

  } catch (error) {

    console.error("Revenue Chart Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
