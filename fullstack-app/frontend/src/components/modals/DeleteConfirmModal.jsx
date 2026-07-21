import { useState } from "react";
import { API_BASE_URL } from "../../config/api";
import "./DeleteConfirmModal.css";

function DeleteConfirmModal({
  open,
  onClose,
  service,
  onDelete,
}) {
  const [loading, setLoading] = useState(false);

  if (!open || !service) return null;

  const handleDelete = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/services/${service.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.success) {
        onDelete(service.id);
        onClose();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Server Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="delete-overlay">

      <div className="delete-modal">

        <div className="delete-icon">
          🗑️
        </div>

        <h2>Delete Service</h2>

        <p>
          Are you sure you want to delete
        </p>

        <h3>{service.name}</h3>

        <span className="warning">
          This action cannot be undone.
        </span>

        <div className="delete-buttons">

          <button
            className="cancel-btn"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            className="delete-btn"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>

        </div>

      </div>

    </div>
  );
}

export default DeleteConfirmModal;