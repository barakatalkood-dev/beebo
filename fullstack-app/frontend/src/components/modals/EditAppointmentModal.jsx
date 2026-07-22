import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./Modal.css";
import "./AppointmentModal.css";
import { API_BASE_URL as API } from "../../config/api";
import { formatOMR } from "../../utils/currency";

const STATUSES = ["pending", "confirmed", "completed", "cancelled"];

function sameServiceSet(a, b) {
  if (a.length !== b.length) return false;
  const idsA = a.map((s) => s.id).sort().join(",");
  const idsB = b.map((s) => s.id).sort().join(",");
  return idsA === idsB;
}

function EditAppointmentModal({ open, appointment, onClose, onSave }) {
  const token = localStorage.getItem("token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [originalServices, setOriginalServices] = useState([]);

  const [date, setDate] = useState("");
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");

  const [status, setStatus] = useState("pending");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const totalPrice = selectedServices.reduce((sum, s) => sum + Number(s.price), 0);
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);

  useEffect(() => {
    if (open) {
      loadServices();
    } else {
      setReady(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (open && appointment && services.length > 0 && !ready) {
      const initialServices = (appointment.services || [])
        .map((s) => services.find((full) => full.id === s.id) || s);

      setSelectedServices(initialServices);
      setOriginalServices(initialServices);
      setDate(appointment.appointment_date);
      setSelectedTime(appointment.appointment_time?.slice(0, 5) || "");
      setStatus(appointment.status);
      setNotes(appointment.notes || "");
      setReady(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, appointment, services]);

  useEffect(() => {
    if (ready && date && selectedServices.length > 0) {
      loadAvailableTimes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, date, selectedServices]);

  const loadServices = async () => {
    try {
      const { data } = await axios.get(`${API}/services`, authHeader);
      setServices(data.services || []);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleService = (service) => {
    setSelectedServices((prev) =>
      prev.some((s) => s.id === service.id)
        ? prev.filter((s) => s.id !== service.id)
        : [...prev, service]
    );
  };

  const loadAvailableTimes = async () => {
    setLoadingTimes(true);

    try {
      const { data } = await axios.get(
        `${API}/appointments/available-times`,
        {
          ...authHeader,
          params: {
            date,
            service_ids: selectedServices.map((s) => s.id).join(","),
            exclude_id: appointment.id,
          },
        }
      );

      let times = data.times || [];
      const currentTime = appointment.appointment_time?.slice(0, 5);

      // Keep the appointment's current slot selectable even though it's
      // technically "taken" by itself.
      if (
        date === appointment.appointment_date &&
        sameServiceSet(selectedServices, originalServices) &&
        currentTime &&
        !times.includes(currentTime)
      ) {
        times = [...times, currentTime].sort();
      }

      setAvailableTimes(times);
    } catch (error) {
      console.error(error);
      setAvailableTimes([]);
    } finally {
      setLoadingTimes(false);
    }
  };

  const handleClose = () => {
    setReady(false);
    onClose();
  };

  const handleSave = async () => {
    if (selectedServices.length === 0) return toast.error("Please select at least one service");
    if (!date) return toast.error("Please choose a date");
    if (!selectedTime) return toast.error("Please choose an available time");

    setSaving(true);

    try {
      await axios.put(
        `${API}/appointments/${appointment.id}`,
        {
          service_ids: selectedServices.map((s) => s.id),
          appointment_date: date,
          appointment_time: selectedTime,
          status,
          notes,
        },
        authHeader
      );

      toast.success("Appointment updated");
      onSave();
      handleClose();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update appointment"
      );

      if (error.response?.status === 409) {
        loadAvailableTimes();
      }
    } finally {
      setSaving(false);
    }
  };

  if (!open || !appointment) return null;

  return (
    <div className="modal-overlay">
      <div className="modal appointment-modal">

        <div className="appointment-modal-header">
          <h2>Edit Appointment</h2>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>

        <div className="appointment-modal-body">

          <div className="selected-customer">
            👤 {appointment.Customer?.full_name} — {appointment.Customer?.phone}
          </div>

          <label>Services (select one or more)</label>
          <div className="service-grid">
            {services.map((service) => {
              const isSelected = selectedServices.some((s) => s.id === service.id);

              return (
                <div
                  key={service.id}
                  className={`service-card ${isSelected ? "active" : ""}`}
                  onClick={() => toggleService(service)}
                >
                  {isSelected && <span className="service-check">✓</span>}
                  <div className="service-name">{service.name}</div>
                  <div className="service-meta">
                    <span>{formatOMR(service.price)}</span>
                    <span>{service.duration} min</span>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedServices.length > 0 && (
            <div className="services-total">
              <span>{selectedServices.length} service(s) selected</span>
              <strong>{formatOMR(totalPrice)} · {totalDuration} min</strong>
            </div>
          )}

          <label>Date</label>
          <input
            type="date"
            className="input"
            min={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <label className="available-times-label">
            Available Times
            {selectedServices.length > 0 && (
              <span className="duration-hint">
                ({totalDuration} min per appointment)
              </span>
            )}
          </label>
          {loadingTimes ? (
            <div className="hint">Loading times...</div>
          ) : availableTimes.length === 0 ? (
            <div className="hint no-times">No available times for this date</div>
          ) : (
            <div className="time-grid">
              {availableTimes.map((time) => (
                <button
                  type="button"
                  key={time}
                  className={`time-slot ${selectedTime === time ? "active" : ""}`}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </button>
              ))}
            </div>
          )}

          <label>Status</label>
          <select
            className="input"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>

          <label>Notes</label>
          <textarea
            className="input notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

        </div>

        <div className="modal-actions">
          <button type="button" onClick={handleClose} disabled={saving}>
            Cancel
          </button>
          <button
            type="button"
            className="save-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Update Appointment"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default EditAppointmentModal;
