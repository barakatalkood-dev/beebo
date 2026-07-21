const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// خط تفصيلي لكل خدمة مختارة داخل الموعد — يسمح للموعد الواحد يحتوي أكثر
// من خدمة، ويحفظ سعر/مدة الخدمة وقت الحجز (snapshot) حتى لو تغيّرت
// أسعار الخدمة لاحقاً.
const AppointmentServiceItem = sequelize.define(
  "AppointmentServiceItem",
  {

    id:{
      type:DataTypes.INTEGER,
      primaryKey:true,
      autoIncrement:true
    },

    appointment_id:{
      type:DataTypes.INTEGER,
      allowNull:false
    },

    service_id:{
      type:DataTypes.INTEGER,
      allowNull:false
    },

    price:{
      type:DataTypes.DECIMAL(10, 2),
      allowNull:false
    },

    duration:{
      type:DataTypes.INTEGER,
      allowNull:false
    }

  },
  {
    tableName:"appointment_service_items",

    timestamps:false
  }
);


module.exports = AppointmentServiceItem;
