import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./Modal.css";
import "./AppointmentModal.css";
import { API_BASE_URL as API } from "../../config/api";
import { formatOMR } from "../../utils/currency";

function AddAppointmentModal({ open, onClose, onSave }) {
  const token = localStorage.getItem("token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const [customerSearch, setCustomerSearch] = useState("");
  const [customerResults, setCustomerResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searching, setSearching] = useState(false);

  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ full_name: "", phone: "" });

  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);

  const [date, setDate] = useState("");
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");

  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const totalPrice = selectedServices.reduce((sum, s) => sum + Number(s.price), 0);
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);

  useEffect(() => {
    if (open) {
      loadServices();
    } else {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (date && selectedServices.length > 0) {
      loadAvailableTimes();
    } else {
      setAvailableTimes([]);
      setSelectedTime("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, selectedServices]);

  const resetForm = () => {
    setCustomerSearch("");
    setCustomerResults([]);
    setSelectedCustomer(null);
    setShowNewCustomer(false);
    setNewCustomer({ full_name: "", phone: "" });
    setSelectedServices([]);
    setDate("");
    setAvailableTimes([]);
    setSelectedTime("");
    setNotes("");
  };

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
    setSelectedTime("");

    try {
      const { data } = await axios.get(
        `${API}/appointments/available-times`,
        {
          ...authHeader,
          params: {
            date,
            service_ids: selectedServices.map((s) => s.id).join(","),
          },
        }
      );

      setAvailableTimes(data.times || []);
    } catch (error) {
      console.error(error);
      setAvailableTimes([]);
    } finally {
      setLoadingTimes(false);
    }
  };

  const searchCustomer = async (value) => {
    setCustomerSearch(value);
    setSelectedCustomer(null);

    if (value.trim().length < 2) {
      setCustomerResults([]);
      return;
    }

    setSearching(true);

    try {
      const { data } = await axios.get(`${API}/customers/search`, {
        ...authHeader,
        params: { query: value },
      });

      setCustomerResults(data.customers || []);
    } catch (error) {
      console.error(error);
    } finally {
      setSearching(false);
    }
  };

  const createCustomer = async () => {
    if (!newCustomer.full_name.trim() || !newCustomer.phone.trim()) {
      toast.error("Name and phone are required");
      return;
    }

    try {
      const { data } = await axios.post(
        `${API}/customers`,
        newCustomer,
        authHeader
      );

      setSelectedCustomer(data.customer);
      setCustomerSearch(data.customer.full_name);
      setCustomerResults([]);
      setShowNewCustomer(false);
      setNewCustomer({ full_name: "", phone: "" });

      toast.success("Customer created");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create customer"
      );
    }
  };

  const handleSave = async () => {
    if (!selectedCustomer) return toast.error("Please select a customer");
    if (selectedServices.length === 0) return toast.error("Please select at least one service");
    if (!date) return toast.error("Please choose a date");
    if (!selectedTime) return toast.error("Please choose an available time");

    setSaving(true);

    try {
      await axios.post(
        `${API}/appointments`,
        {
          customer_id: selectedCustomer.id,
          service_ids: selectedServices.map((s) => s.id),
          appointment_date: date,
          appointment_time: selectedTime,
          notes,
        },
        authHeader
      );

      toast.success("Appointment booked successfully");
      onSave();
      onClose();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to book appointment"
      );

      if (error.response?.status === 409) {
        loadAvailableTimes();
      }
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal appointment-modal">

        <div className="appointment-modal-header">
          <h2>New Appointment</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="appointment-modal-body">

          <label>Search Customer</label>
          <input
            type="text"
            className="input"
            placeholder="Search by name or phone..."
            value={customerSearch}
            onChange={(e) => searchCustomer(e.target.value)}
          />

          {searching && <div className="hint">Searching...</div>}

          {customerResults.length > 0 && (
            <div className="customer-results">
              {customerResults.map((customer) => (
                <div
                  key={customer.id}
                  className="customer-result"
                  onClick={() => {
                    setSelectedCustomer(customer);
                    setCustomerSearch(customer.full_name);
                    setCustomerResults([]);
                  }}
                >
                  <strong>{customer.full_name}</strong>
                  <span>{customer.phone}</span>
                </div>
              ))}
            </div>
          )}

          {selectedCustomer && (
            <div className="selected-customer">
              ✅ {selectedCustomer.full_name} — {selectedCustomer.phone}
            </div>
          )}

          {!showNewCustomer ? (
            <button
              type="button"
              className="link-btn"
              onClick={() => setShowNewCustomer(true)}
            >
              + Register new customer
            </button>
          ) : (
            <div className="new-customer-box">
              <input
                type="text"
                className="input"
                placeholder="Full name"
                value={newCustomer.full_name}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, full_name: e.target.value })
                }
              />

              <input
                type="text"
                className="input"
                placeholder="Phone number"
                value={newCustomer.phone}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, phone: e.target.value })
                }
              />

              <div className="new-customer-actions">
                <button type="button" onClick={() => setShowNewCustomer(false)}>
                  Cancel
                </button>
                <button type="button" className="save-small" onClick={createCustomer}>
                  Save Customer
                </button>
              </div>
            </div>
          )}

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

            {services.length === 0 && (
              <div className="hint">No services available</div>
            )}
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
          {!date || selectedServices.length === 0 ? (
            <div className="hint">Choose at least one service and a date to see available times</div>
          ) : loadingTimes ? (
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

          <label>Notes</label>
          <textarea
            className="input notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

        </div>

        <div className="modal-actions">
          <button type="button" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button
            type="button"
            className="save-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : `Save Appointment${selectedServices.length > 0 ? ` · ${formatOMR(totalPrice)}` : ""}`}
          </button>
        </div>

      </div>
    </div>
  );
}

export default AddAppointmentModal;
