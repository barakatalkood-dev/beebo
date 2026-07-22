import { useEffect, useState } from "react";
import axios from "axios";
import StatCard from "../components/cards/StatCard";
import RevenueChart from "../components/charts/RevenueChart";
import "./Reports.css";
import { API_BASE_URL as API } from "../config/api";
import { formatOMR } from "../utils/currency";

const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

const METHOD_LABELS = {
  cash: "💵 Cash",
  transfer: "🏦 Bank Transfer",
  visa: "💳 Visa / Card",
};

function toDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function defaultRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - 29);

  return { from: toDateStr(from), to: toDateStr(to) };
}

function Reports() {
  const token = localStorage.getItem("token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const initialRange = defaultRange();

  const [fromDate, setFromDate] = useState(initialRange.from);
  const [toDate, setToDate] = useState(initialRange.to);

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadReport = async () => {
    setLoading(true);

    try {
      const { data } = await axios.get(`${API}/reports`, {
        ...authHeader,
        params: { from: fromDate, to: toDate },
      });

      setReport(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !report) {
    return <div className="loading">Loading reports...</div>;
  }

  const summary = report?.summary || {};
  const paymentBreakdown = report?.paymentBreakdown || { cash: 0, transfer: 0, visa: 0 };
  const topServices = report?.topServices || [];
  const employeePerformance = report?.employeePerformance || [];

  return (
    <div className="reports-page">

      <div className="header">
        <div>
          <h1>Reports</h1>
          <p>Business performance overview</p>
        </div>
      </div>

      <div className="reports-filters">
        <div className="filter-field">
          <label>From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div className="filter-field">
          <label>To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        <button className="add-button" onClick={loadReport} disabled={loading}>
          {loading ? "Loading..." : "Apply"}
        </button>
      </div>

      <div className="cards">

        <StatCard
          title="Total Revenue"
          value={formatOMR(summary.totalRevenue)}
          icon="💰"
          color="#F59E0B"
        />

        <StatCard
          title="Total Appointments"
          value={summary.totalAppointments || 0}
          icon="📅"
          color="#10B981"
        />

        <StatCard
          title="Avg Ticket"
          value={formatOMR(summary.avgTicket)}
          icon="🧾"
          color="#7C3AED"
        />

        <StatCard
          title="Unpaid Appointments"
          value={summary.unpaidCount || 0}
          icon="⏳"
          color="#dc3545"
        />

      </div>

      <RevenueChart
        data={report?.revenueChart || []}
        title="Revenue Over Selected Period"
      />

      <div className="reports-grid">

        <div className="table-card">
          <h2>Appointments by Status</h2>

          <div className="breakdown-list">
            {Object.keys(STATUS_LABELS).map((key) => (
              <div className="breakdown-row" key={key}>
                <span className={`badge status-${key}`}>
                  {STATUS_LABELS[key]}
                </span>
                <strong>{summary[key] || 0}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="table-card">
          <h2>Revenue by Payment Method</h2>

          <div className="breakdown-list">
            {Object.keys(METHOD_LABELS).map((key) => (
              <div className="breakdown-row" key={key}>
                <span>{METHOD_LABELS[key]}</span>
                <strong>{formatOMR(paymentBreakdown[key])}</strong>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="table-card">
        <h2>Top Services</h2>

        <table>
          <thead>
            <tr>
              <th>Service</th>
              <th>Bookings</th>
              <th>Revenue</th>
            </tr>
          </thead>

          <tbody>
            {topServices.length > 0 ? (
              topServices.map((s) => (
                <tr key={s.id}>
                  <td data-label="Service">{s.name}</td>
                  <td data-label="Bookings">{s.bookings}</td>
                  <td data-label="Revenue">{formatOMR(s.revenue)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ textAlign: "center", padding: "20px" }}>
                  No data for this period
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-card">
        <h2>Employee Performance</h2>

        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Appointments</th>
              <th>Revenue</th>
            </tr>
          </thead>

          <tbody>
            {employeePerformance.length > 0 ? (
              employeePerformance.map((e) => (
                <tr key={e.id}>
                  <td data-label="Employee">{e.name}</td>
                  <td data-label="Appointments">{e.appointments}</td>
                  <td data-label="Revenue">{formatOMR(e.revenue)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ textAlign: "center", padding: "20px" }}>
                  No data for this period
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default Reports;
