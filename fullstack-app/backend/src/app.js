const express = require("express");
const cors = require("cors");

const app = express();

// FRONTEND_URL يقدر يكون رابط واحد أو أكثر مفصولين بفاصلة — لو ما تحدد،
// يقبل من أي مصدر (مناسب للتطوير المحلي).
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((url) => url.trim())
  : true;

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const customerRoutes = require("./routes/customerRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const reportRoutes = require("./routes/reportRoutes");

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/reports", reportRoutes);


app.use("/api/services", serviceRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Beebo Beauty Center API 🚀",
  });
});

module.exports = app;