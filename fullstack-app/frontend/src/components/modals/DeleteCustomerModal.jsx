import axios from "axios";
import { API_BASE_URL } from "../../config/api";
import "./Modal.css";

function DeleteCustomerModal({
  open,
  customer,
  onClose,
  onDelete,
}) {
  if (!open || !customer) return null;

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `${API_BASE_URL}/customers/${customer.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onDelete();
      onClose();

    } catch (error) {

      console.error(error);

      alert(
        error.response?.data?.message ||
        "Failed to delete customer"
      );

    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">

        <h2>Delete Customer</h2>

        <p>
          Are you sure you want to delete
          <br />
          <strong>{customer.full_name}</strong>?
        </p>

        <div className="modal-actions">

          <button
            className="cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="delete-btn"
            onClick={handleDelete}
          >
            Delete
          </button>

        </div>

      </div>
    </div>
  );
}

export default DeleteCustomerModal;