import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../config/api";
import "./AddServiceModal.css";

function EditServiceModal({
  open,
  onClose,
  service,
  onUpdate,
}) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    duration: "",
    price: "",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (service) {
      setForm({
        name: service.name || "",
        description: service.description || "",
        duration: service.duration || "",
        price: service.price || "",
      });
    }
  }, [service]);

  if (!open) return null;

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/services/${service.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name,
            description: form.description,
            duration: Number(form.duration),
            price: Number(form.price),
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        onUpdate(data.service);
        onClose();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Server Error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">

        <div className="modal-header">
          <h2>Edit Service</h2>

          <button
            className="close-btn"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Service Name</label>

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>

            <textarea
              rows="3"
              name="description"
              value={form.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="row">

            <div className="form-group">
              <label>Duration (Minutes)</label>

              <input
                type="number"
                name="duration"
                value={form.duration}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Price (OMR)</label>

              <input
                type="number"
                step="0.001"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
              />
            </div>

          </div>

          <div className="modal-footer">

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
              disabled={saving}
            >
              {saving ? "Updating..." : "Update Service"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}

export default EditServiceModal;