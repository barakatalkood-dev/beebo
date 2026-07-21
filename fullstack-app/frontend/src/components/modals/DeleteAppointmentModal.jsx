import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../config/api";
import "./Modal.css";

function DeleteAppointmentModal({ open, appointment, onClose, onDelete }) {
  if (!open || !appointment) return null;

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");

      const { data } = await axios.delete(
        `${API_BASE_URL}/appointments/${appointment.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(data.message || "Appointment deleted");
      onDelete();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">

        <h2>Delete Appointment</h2>

        <p style={{ marginBottom: "20px", lineHeight: "1.6" }}>
          Are you sure you want to delete the appointment for
          <br />
          <strong>{appointment.Customer?.full_name}</strong>
          {" "}on <strong>{appointment.appointment_date}</strong> at{" "}
          <strong>{appointment.appointment_time?.slice(0, 5)}</strong>?
        </p>

        <div className="modal-actions">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            style={{ background: "#dc3545", color: "#fff" }}
          >
            Delete
          </button>
        </div>

      </div>
    </div>
  );
}

export default DeleteAppointmentModal;
