const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Appointment = sequelize.define(
  "Appointment",
  {

    id:{
      type:DataTypes.INTEGER,
      primaryKey:true,
      autoIncrement:true
    },

    customer_id:{
      type:DataTypes.INTEGER,
      allowNull:false
    },

    appointment_date:{
      type:DataTypes.DATEONLY,
      allowNull:false
    },

    appointment_time:{
      type:DataTypes.TIME,
      allowNull:false
    },

    employee_id:{
      type:DataTypes.INTEGER
    },

    service_id:{
      type:DataTypes.INTEGER
    },

    status:{
      type:DataTypes.ENUM(
        "pending",
        "confirmed",
        "completed",
        "cancelled"
      ),
      defaultValue:"pending"
    },

    notes:{
      type:DataTypes.TEXT
    },

    payment_status:{
      type:DataTypes.ENUM(
        "unpaid",
        "paid"
      ),
      defaultValue:"unpaid"
    },

    payment_method:{
      type:DataTypes.ENUM(
        "cash",
        "transfer",
        "visa"
      ),
      allowNull:true
    },

    paid_amount:{
      type:DataTypes.DECIMAL(10, 2),
      allowNull:true
    },

    paid_at:{
      type:DataTypes.DATE,
      allowNull:true
    }

  },
  {
    tableName:"appointments",

    timestamps:false
  }
);


module.exports = Appointment;