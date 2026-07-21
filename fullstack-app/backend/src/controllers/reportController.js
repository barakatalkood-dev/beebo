const { Op } = require("sequelize");
const Appointment = require("../models/Appointment");
const Service = require("../models/Service");
const User = require("../models/User");
const AppointmentServiceItem = require("../models/AppointmentServiceItem");

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

function defaultRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - 29);

  return { from: toDateStr(from), to: toDateStr(to) };
}

const STATUSES = ["pending", "confirmed", "completed", "cancelled"];
const PAYMENT_METHODS = ["cash", "transfer", "visa"];

exports.getReports = async (req, res) => {
  try {
    const defaults = defaultRange();
    const from = req.query.from || defaults.from;
    const to = req.query.to || defaults.to;

    const appointments = await Appointment.findAll({
      where: {
        appointment_date: { [Op.between]: [from, to] },
      },
      include: [
        { model: User, attributes: ["id", "full_name"] },
        {
          model: AppointmentServiceItem,
          as: "ServiceItems",
          include: [{ model: Service, attributes: ["id", "name"] }],
        },
      ],
    });

    let totalRevenue = 0;
    let paidCount = 0;
    let unpaidCount = 0;

    const statusCounts = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
    const paymentBreakdown = { cash: 0, transfer: 0, visa: 0 };
    const revenueByDate = {};
    const serviceStats = {};
    const employeeStats = {};

    appointments.forEach((appt) => {
      if (STATUSES.includes(appt.status)) {
        statusCounts[appt.status]++;
      }

      const isPaid = appt.payment_status === "paid";
      const amount = isPaid ? Number(appt.paid_amount || 0) : 0;

      if (isPaid) {
        paidCount++;
        totalRevenue += amount;

        if (PAYMENT_METHODS.includes(appt.payment_method)) {
          paymentBreakdown[appt.payment_method] += amount;
        }

        revenueByDate[appt.appointment_date] =
          (revenueByDate[appt.appointment_date] || 0) + amount;
      } else {
        unpaidCount++;
      }

      (appt.ServiceItems || []).forEach((item) => {
        if (!item.Service) return;

        const key = item.Service.id;

        if (!serviceStats[key]) {
          serviceStats[key] = {
            id: key,
            name: item.Service.name,
            bookings: 0,
            revenue: 0,
          };
        }

        serviceStats[key].bookings++;

        if (isPaid) {
          serviceStats[key].revenue += Number(item.price);
        }
      });

      if (appt.User) {
        const key = appt.User.id;

        if (!employeeStats[key]) {
          employeeStats[key] = {
            id: key,
            name: appt.User.full_name,
            appointments: 0,
            revenue: 0,
          };
        }

        employeeStats[key].appointments++;
        employeeStats[key].revenue += amount;
      }
    });

    const revenueChart = dateRangeArray(from, to).map((date) => ({
      date,
      revenue: Number((revenueByDate[date] || 0).toFixed(2)),
    }));

    const topServices = Object.values(serviceStats)
      .map((s) => ({ ...s, revenue: Number(s.revenue.toFixed(2)) }))
      .sort((a, b) => b.revenue - a.revenue);

    const employeePerformance = Object.values(employeeStats)
      .map((e) => ({ ...e, revenue: Number(e.revenue.toFixed(2)) }))
      .sort((a, b) => b.revenue - a.revenue);

    res.json({
      success: true,

      range: { from, to },

      summary: {
        totalAppointments: appointments.length,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        avgTicket: paidCount > 0 ? Number((totalRevenue / paidCount).toFixed(2)) : 0,
        paidCount,
        unpaidCount,
        ...statusCounts,
      },

      paymentBreakdown,
      revenueChart,
      topServices,
      employeePerformance,
    });

  } catch (error) {

    console.error("Reports Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
