const { Op } = require("sequelize");
const Appointment = require("../models/Appointment");
const Customer = require("../models/Customer");
const Service = require("../models/Service");
const User = require("../models/User");
const AppointmentServiceItem = require("../models/AppointmentServiceItem");

// Business hours & slot granularity
const OPEN_MINUTES = 9 * 60; // 09:00
const CLOSE_MINUTES = 21 * 60; // 21:00
const SLOT_STEP = 30; // minutes

const SERVICE_ITEMS_INCLUDE = {
  model: AppointmentServiceItem,
  as: "ServiceItems",
  include: [{ model: Service, attributes: ["id", "name", "price", "duration"] }],
};

const INCLUDE_RELATIONS = [
  Customer,
  { model: User, attributes: { exclude: ["password"] } },
  SERVICE_ITEMS_INCLUDE,
];

function timeToMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(mins) {
  const h = String(Math.floor(mins / 60)).padStart(2, "0");
  const m = String(mins % 60).padStart(2, "0");
  return `${h}:${m}`;
}

// Local (server timezone) date as YYYY-MM-DD — avoids the UTC-shift bug
// that toISOString() would introduce for non-UTC timezones.
function todayLocal() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function itemsTotalDuration(items) {
  return (items || []).reduce((sum, item) => sum + item.duration, 0) || 30;
}

// Flattens an Appointment (+ ServiceItems) into plain JSON with a `services`
// array and computed `total_price` / `total_duration`.
function serializeAppointment(appointment) {
  const json = appointment.toJSON();
  const items = json.ServiceItems || [];

  json.services = items.map((item) => ({
    id: item.Service?.id,
    name: item.Service?.name,
    price: Number(item.price),
    duration: item.duration,
  }));

  json.total_price = json.services.reduce((sum, s) => sum + s.price, 0);
  json.total_duration = json.services.reduce((sum, s) => sum + s.duration, 0);

  delete json.ServiceItems;

  return json;
}

function parseServiceIds(raw) {
  if (Array.isArray(raw)) return raw.map(Number).filter(Boolean);
  if (typeof raw === "string") {
    return raw
      .split(",")
      .map((v) => Number(v.trim()))
      .filter(Boolean);
  }
  return [];
}

// Returns true if [startMinutes, startMinutes+duration) overlaps an existing
// appointment for the same employee on the same date.
async function hasConflict({ employeeId, date, startMinutes, duration, excludeId }) {
  const where = {
    employee_id: employeeId,
    appointment_date: date,
    status: { [Op.ne]: "cancelled" },
  };

  if (excludeId) {
    where.id = { [Op.ne]: excludeId };
  }

  const dayAppointments = await Appointment.findAll({
    where,
    include: [{ model: AppointmentServiceItem, as: "ServiceItems" }],
  });

  const endMinutes = startMinutes + duration;

  return dayAppointments.some((appt) => {
    const apptStart = timeToMinutes(appt.appointment_time.slice(0, 5));
    const apptDuration = itemsTotalDuration(appt.ServiceItems);
    const apptEnd = apptStart + apptDuration;

    return startMinutes < apptEnd && apptStart < endMinutes;
  });
}

exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      include: INCLUDE_RELATIONS,
      order: [
        ["appointment_date", "DESC"],
        ["appointment_time", "DESC"],
      ],
    });

    res.json({
      success: true,
      appointments: appointments.map(serializeAppointment),
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


exports.getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: INCLUDE_RELATIONS,
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    res.json({
      success: true,
      appointment: serializeAppointment(appointment),
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


// Returns the free time slots for a given date + set of services, sized to
// the combined duration of all selected services, for the logged in employee.
exports.getAvailableTimes = async (req, res) => {
  try {
    const { date, exclude_id } = req.query;
    const serviceIds = parseServiceIds(req.query.service_ids);

    if (!date || serviceIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "date and service_ids are required",
      });
    }

    const services = await Service.findAll({ where: { id: serviceIds } });

    if (services.length !== serviceIds.length) {
      return res.status(404).json({
        success: false,
        message: "One or more services not found",
      });
    }

    const employeeId = req.user.id;
    const duration = services.reduce((sum, s) => sum + s.duration, 0);

    const where = {
      employee_id: employeeId,
      appointment_date: date,
      status: { [Op.ne]: "cancelled" },
    };

    if (exclude_id) {
      where.id = { [Op.ne]: exclude_id };
    }

    const dayAppointments = await Appointment.findAll({
      where,
      include: [{ model: AppointmentServiceItem, as: "ServiceItems" }],
    });

    const busyRanges = dayAppointments.map((appt) => {
      const start = timeToMinutes(appt.appointment_time.slice(0, 5));
      const apptDuration = itemsTotalDuration(appt.ServiceItems);

      return [start, start + apptDuration];
    });

    const now = new Date();
    const isToday = date === todayLocal();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const times = [];

    for (
      let start = OPEN_MINUTES;
      start + duration <= CLOSE_MINUTES;
      start += SLOT_STEP
    ) {
      if (isToday && start <= nowMinutes) continue;

      const end = start + duration;

      const conflict = busyRanges.some(
        ([busyStart, busyEnd]) => start < busyEnd && busyStart < end
      );

      if (!conflict) {
        times.push(minutesToTime(start));
      }
    }

    res.json({
      success: true,
      times,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


// Appointments for the logged-in employee, today, starting within the next
// `within` minutes — used to power the reminder bell in the header.
exports.getUpcomingAppointments = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const withinMinutes = parseInt(req.query.within, 10) || 60;

    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const appointments = await Appointment.findAll({
      where: {
        employee_id: employeeId,
        appointment_date: todayLocal(),
        status: { [Op.notIn]: ["cancelled", "completed"] },
      },
      include: INCLUDE_RELATIONS,
      order: [["appointment_time", "ASC"]],
    });

    const upcoming = appointments.filter((appt) => {
      const start = timeToMinutes(appt.appointment_time.slice(0, 5));
      return start >= nowMinutes && start - nowMinutes <= withinMinutes;
    });

    res.json({
      success: true,
      appointments: upcoming.map(serializeAppointment),
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


exports.createAppointment = async (req, res) => {
  try {
    const {
      customer_id,
      service_ids,
      appointment_date,
      appointment_time,
      notes,
    } = req.body;

    const ids = Array.isArray(service_ids) ? service_ids.map(Number).filter(Boolean) : [];

    if (!customer_id || ids.length === 0 || !appointment_date || !appointment_time) {
      return res.status(400).json({
        success: false,
        message: "customer_id, service_ids (at least one), appointment_date and appointment_time are required",
      });
    }

    const [customer, services] = await Promise.all([
      Customer.findByPk(customer_id),
      Service.findAll({ where: { id: ids } }),
    ]);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    if (services.length !== ids.length) {
      return res.status(404).json({
        success: false,
        message: "One or more services not found",
      });
    }

    const employeeId = req.user.id;
    const startMinutes = timeToMinutes(appointment_time);
    const totalDuration = services.reduce((sum, s) => sum + s.duration, 0);

    const conflict = await hasConflict({
      employeeId,
      date: appointment_date,
      startMinutes,
      duration: totalDuration,
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: "This time slot is no longer available",
      });
    }

    const appointment = await Appointment.create({
      customer_id,
      employee_id: employeeId,
      appointment_date,
      appointment_time,
      notes,
    });

    await AppointmentServiceItem.bulkCreate(
      services.map((service) => ({
        appointment_id: appointment.id,
        service_id: service.id,
        price: service.price,
        duration: service.duration,
      }))
    );

    const fullAppointment = await Appointment.findByPk(appointment.id, {
      include: INCLUDE_RELATIONS,
    });

    res.status(201).json({
      success: true,
      appointment: serializeAppointment(fullAppointment),
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


exports.updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [{ model: AppointmentServiceItem, as: "ServiceItems" }],
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    const {
      service_ids,
      appointment_date,
      appointment_time,
      status,
      notes,
    } = req.body;

    let newServices = null;

    if (Array.isArray(service_ids) && service_ids.length > 0) {
      const ids = service_ids.map(Number).filter(Boolean);
      newServices = await Service.findAll({ where: { id: ids } });

      if (newServices.length !== ids.length) {
        return res.status(404).json({
          success: false,
          message: "One or more services not found",
        });
      }
    }

    const finalDate = appointment_date || appointment.appointment_date;
    const finalTime = (appointment_time || appointment.appointment_time).slice(0, 5);

    const totalDuration = newServices
      ? newServices.reduce((sum, s) => sum + s.duration, 0)
      : itemsTotalDuration(appointment.ServiceItems);

    const startMinutes = timeToMinutes(finalTime);

    const conflict = await hasConflict({
      employeeId: appointment.employee_id,
      date: finalDate,
      startMinutes,
      duration: totalDuration,
      excludeId: appointment.id,
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: "This time slot conflicts with another appointment",
      });
    }

    await appointment.update({
      appointment_date: finalDate,
      appointment_time: finalTime,
      status: status || appointment.status,
      notes: notes !== undefined ? notes : appointment.notes,
    });

    if (newServices) {
      await AppointmentServiceItem.destroy({ where: { appointment_id: appointment.id } });

      await AppointmentServiceItem.bulkCreate(
        newServices.map((service) => ({
          appointment_id: appointment.id,
          service_id: service.id,
          price: service.price,
          duration: service.duration,
        }))
      );
    }

    const fullAppointment = await Appointment.findByPk(appointment.id, {
      include: INCLUDE_RELATIONS,
    });

    res.json({
      success: true,
      appointment: serializeAppointment(fullAppointment),
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


const PAYMENT_METHODS = ["cash", "transfer", "visa"];

exports.payAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [{ model: AppointmentServiceItem, as: "ServiceItems" }],
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointment.payment_status === "paid") {
      return res.status(400).json({
        success: false,
        message: "This appointment is already paid",
      });
    }

    const { payment_method, amount } = req.body;

    if (!PAYMENT_METHODS.includes(payment_method)) {
      return res.status(400).json({
        success: false,
        message: "payment_method must be one of: cash, transfer, visa",
      });
    }

    const totalPrice = (appointment.ServiceItems || []).reduce(
      (sum, item) => sum + Number(item.price),
      0
    );

    const finalAmount = amount != null && amount !== ""
      ? Number(amount)
      : totalPrice;

    if (!(finalAmount > 0)) {
      return res.status(400).json({
        success: false,
        message: "A valid payment amount is required",
      });
    }

    await appointment.update({
      payment_status: "paid",
      payment_method,
      paid_amount: finalAmount,
      paid_at: new Date(),
    });

    const fullAppointment = await Appointment.findByPk(appointment.id, {
      include: INCLUDE_RELATIONS,
    });

    res.json({
      success: true,
      appointment: serializeAppointment(fullAppointment),
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    await AppointmentServiceItem.destroy({ where: { appointment_id: appointment.id } });
    await appointment.destroy();

    res.json({
      success: true,
      message: "Appointment deleted",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
