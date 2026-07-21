import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";
import "./Modal.css";

function AddCustomerModal({ open, onClose, onSave }) {
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    notes: "",
  });

  if (!open) return null;

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${API_BASE_URL}/customers`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setForm({
        full_name: "",
        phone: "",
        email: "",
        notes: "",
      });

      onSave();
      onClose();

    } catch (error) {

      console.error(error);

      alert(
        error.response?.data?.message ||
        "Failed to add customer"
      );

    }
  };

  return (
    <div className="modal-overlay">

      <div className="modal">

        <h2>Add Customer</h2>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            name="full_name"
            placeholder="Full Name"
            value={form.full_name}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />

          <textarea
            name="notes"
            placeholder="Notes"
            rows="4"
            value={form.notes}
            onChange={handleChange}
          />

          <div className="modal-actions">

            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-btn"
            >
              Save
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default AddCustomerModal;