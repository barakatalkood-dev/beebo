import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";
import "./Modal.css";

function EditCustomerModal({
  open,
  customer,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    notes: "",
  });

  useEffect(() => {
    if (customer) {
      setForm({
        full_name: customer.full_name || "",
        phone: customer.phone || "",
        email: customer.email || "",
        notes: customer.notes || "",
      });
    }
  }, [customer]);

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

      await axios.put(
        `${API_BASE_URL}/customers/${customer.id}`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onSave();
      onClose();

    } catch (error) {

      console.error(error);

      alert(
        error.response?.data?.message ||
        "Failed to update customer"
      );

    }
  };

  return (
    <div className="modal-overlay">

      <div className="modal">

        <h2>Edit Customer</h2>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />

          <textarea
            name="notes"
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
              Update
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default EditCustomerModal;