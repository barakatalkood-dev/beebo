import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./Appointments.css";
import AddAppointmentModal from "../components/modals/AddAppointmentModal";
import EditAppointmentModal from "../components/modals/EditAppointmentModal";
import DeleteAppointmentModal from "../components/modals/DeleteAppointmentModal";
import PaymentModal from "../components/modals/PaymentModal";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL as API } from "../config/api";

const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

// An appointment is considered "done" once it's confirmed/completed AND paid —
// at that point it moves out of the active table into history.
function isFinished(item) {
  return (
    item.payment_status === "paid" &&
    (item.status === "completed" || item.status === "confirmed")
  );
}

function AppointmentsTable({ items, isAdmin, onEdit, onPay, onDelete, emptyText }) {
  return (
    <div className="card">
      <table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Service</th>
            <th>Employee</th>
            <th>Date</th>
            <th>Time</th>
            <th>Status</th>
            <th>Payment</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {items.length > 0 ? (
            items.map((item) => (
              <tr key={item.id}>
                <td data-label="Customer">{item.Customer?.full_name || "-"}</td>
                <td data-label="Service">
                  {item.services?.length > 0
                    ? item.services.map((s) => s.name).join(", ")
                    : "-"}
                </td>
                <td data-label="Employee">{item.User?.full_name || "-"}</td>
                <td data-label="Date">{item.appointment_date}</td>
                <td data-label="Time">{item.appointment_time?.slice(0, 5)}</td>
                <td data-label="Status">
                  <span className={`badge status-${item.status}`}>
                    {STATUS_LABELS[item.status] || item.status}
                  </span>
                </td>
                <td data-label="Payment">
                  <span className={`badge payment-${item.payment_status}`}>
                    {item.payment_status === "paid"
                      ? `Paid (${item.payment_method})`
                      : "Unpaid"}
                  </span>
                </td>
                <td data-label="Actions" className="actions-cell">
                  <button className="edit-btn" onClick={() => onEdit(item)}>
                    Edit
                  </button>
                  <button className="pay-btn" onClick={() => onPay(item)}>
                    {item.payment_status === "paid" ? "Invoice" : "Pay"}
                  </button>
                  {isAdmin && (
                    <button className="delete-btn" onClick={() => onDelete(item)}>
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
                {emptyText}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Appointments() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openPayment, setOpenPayment] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const { data } = await axios.get(`${API}/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAppointments(data.appointments || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return appointments;

    return appointments.filter((item) =>
      [
        item.Customer?.full_name,
        item.Customer?.phone,
        ...(item.services || []).map((s) => s.name),
        item.User?.full_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [appointments, search]);

  const activeAppointments = useMemo(
    () => filteredAppointments.filter((item) => !isFinished(item)),
    [filteredAppointments]
  );

  const historyAppointments = useMemo(
    () => filteredAppointments.filter((item) => isFinished(item)),
    [filteredAppointments]
  );

  const handleEdit = (item) => {
    setSelectedAppointment(item);
    setOpenEdit(true);
  };

  const handlePay = (item) => {
    setSelectedAppointment(item);
    setOpenPayment(true);
  };

  const handleDelete = (item) => {
    setSelectedAppointment(item);
    setOpenDelete(true);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="appointments-page">

      <div className="header">
        <div>
          <h1>Appointments</h1>
          <p>Manage customer appointments and services</p>
        </div>
      </div>

      <div className="toolbar">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Search by customer, phone, service or employee..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button className="add-button" onClick={() => setOpenAdd(true)}>
          + New Appointment
        </button>
      </div>

      <h3 className="table-section-title">Active</h3>

      <AppointmentsTable
        items={activeAppointments}
        isAdmin={isAdmin}
        onEdit={handleEdit}
        onPay={handlePay}
        onDelete={handleDelete}
        emptyText="No active appointments"
      />

      <h3 className="table-section-title">Completed &amp; Paid</h3>

      <AppointmentsTable
        items={historyAppointments}
        isAdmin={isAdmin}
        onEdit={handleEdit}
        onPay={handlePay}
        onDelete={handleDelete}
        emptyText="No completed & paid appointments yet"
      />

      <AddAppointmentModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSave={loadAppointments}
      />

      <EditAppointmentModal
        open={openEdit}
        appointment={selectedAppointment}
        onClose={() => setOpenEdit(false)}
        onSave={loadAppointments}
      />

      <DeleteAppointmentModal
        open={openDelete}
        appointment={selectedAppointment}
        onClose={() => setOpenDelete(false)}
        onDelete={loadAppointments}
      />

      <PaymentModal
        open={openPayment}
        appointment={selectedAppointment}
        onClose={() => setOpenPayment(false)}
        onPaid={loadAppointments}
      />

    </div>
  );
}

export default Appointments;
