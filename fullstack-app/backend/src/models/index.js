const User = require("./User");
const Customer = require("./Customer");
const Service = require("./Service");
const Appointment = require("./Appointment");
const AppointmentServiceItem = require("./AppointmentServiceItem");

/*
|--------------------------------------------------------------------------
| Customer
|--------------------------------------------------------------------------
*/

Customer.hasMany(Appointment, {
  foreignKey: "customer_id",
});

Appointment.belongsTo(Customer, {
  foreignKey: "customer_id",
});

/*
|--------------------------------------------------------------------------
| Employee
|--------------------------------------------------------------------------
*/

User.hasMany(Appointment, {
  foreignKey: "employee_id",
});

Appointment.belongsTo(User, {
  foreignKey: "employee_id",
});

/*
|--------------------------------------------------------------------------
| Service (legacy single-service link — kept for historical data only,
| new bookings use AppointmentServiceItem below)
|--------------------------------------------------------------------------
*/

Service.hasMany(Appointment, {
  foreignKey: "service_id",
});

Appointment.belongsTo(Service, {
  foreignKey: "service_id",
});

/*
|--------------------------------------------------------------------------
| Appointment <-> Service (many-to-many via line items)
|--------------------------------------------------------------------------
*/

Appointment.hasMany(AppointmentServiceItem, {
  foreignKey: "appointment_id",
  as: "ServiceItems",
});

AppointmentServiceItem.belongsTo(Appointment, {
  foreignKey: "appointment_id",
});

AppointmentServiceItem.belongsTo(Service, {
  foreignKey: "service_id",
});

Service.hasMany(AppointmentServiceItem, {
  foreignKey: "service_id",
});

module.exports = {
  User,
  Customer,
  Service,
  Appointment,
  AppointmentServiceItem,
};
