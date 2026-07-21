import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../config/api";
import "./Modal.css";

function DeleteEmployeeModal({
  open,
  employee,
  onClose,
  onDelete,
}) {
  if (!open || !employee) return null;

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");

      const { data } = await axios.delete(
        `${API_BASE_URL}/users/${employee.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(data.message);

      onDelete();

      onClose();

    } catch (err) {

      toast.error(
        err.response?.data?.message || "Delete failed"
      );

    }
  };

  return (
    <div className="modal-overlay">

      <div className="modal">

        <h2>Delete Employee</h2>

        <p
          style={{
            marginBottom: "20px",
            lineHeight: "1.6",
          }}
        >
          Are you sure you want to delete
          <br />
          <strong>{employee.full_name}</strong> ?
        </p>

        <div className="modal-actions">

          <button
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDelete}
            style={{
              background: "#dc3545",
              color: "#fff",
            }}
          >
            Delete
          </button>

        </div>

      </div>

    </div>
  );
}

export default DeleteEmployeeModal;