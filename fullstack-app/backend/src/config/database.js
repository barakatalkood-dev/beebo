const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    logging: false,

    dialectOptions: {
      charset: "UTF8_GENERAL_CI"
    },

    define: {
      charset: "utf8",
      collate: "utf8_general_ci"
    }
  }
);

module.exports = sequelize;