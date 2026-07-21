import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AddEmployeeModal from "../components/modals/AddEmployeeModal";
import "./Employees.css";
import EditEmployeeModal from "../components/modals/EditEmployeeModal";
import DeleteEmployeeModal from "../components/modals/DeleteEmployeeModal";
import { API_BASE_URL } from "../config/api";


function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const [openAddModal, setOpenAddModal] = useState(false);


  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
const [selectedEmployee, setSelectedEmployee] = useState(null);

  const rowsPerPage = 10;

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const token = localStorage.getItem("token");

      const { data } = await axios.get(
        `${API_BASE_URL}/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEmployees(data.users);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) =>
      (
        employee.full_name +
        " " +
        employee.email +
        " " +
        employee.role +
        " " +
        (employee.phone || "")
      )
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [employees, search]);

  const totalPages = Math.ceil(
    filteredEmployees.length / rowsPerPage
  );

  const currentEmployees = filteredEmployees.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  if (loading) {
    return <h2>Loading Employees...</h2>;
  }

  return (
    <div className="services-page">

      <div className="services-header">

        <div>
          <h1>Employees</h1>
          <p>Manage Beauty Center Employees</p>
        </div>

        <button
          className="add-btn"
          onClick={() => setOpenAddModal(true)}
        >
          + Add Employee
        </button>

      </div>

      <div className="toolbar">

        <input
          type="text"
          placeholder="Search employee..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />

      </div>

      <div className="table-card">

        <table>

          <thead>

            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>

          </thead>

          <tbody>

            {currentEmployees.length > 0 ? (

              currentEmployees.map((employee) => (

                <tr key={employee.id}>

                  <td>{employee.id}</td>

                  <td>{employee.full_name}</td>

                  <td>{employee.email}</td>

                  <td>{employee.phone || "-"}</td>

                  <td>
                    <span
                      className={
                        employee.role === "admin"
                          ? "role-admin"
                          : "role-employee"
                      }
                    >
                      {employee.role}
                    </span>
                  </td>

                  <td>

                   <button
  className="edit-btn"
  onClick={() => {
    setSelectedEmployee(employee);
    setOpenEditModal(true);
  }}
>
  Edit
</button>

                   <button
  className="delete-btn"
  onClick={() => {
    setSelectedEmployee(employee);
    setOpenDeleteModal(true);
  }}
>
  Delete
</button>

                  </td>

                </tr>

              ))

            ) : (

              <tr>

                <td
                  colSpan="6"
                  style={{
                    textAlign: "center",
                    padding: "20px",
                  }}
                >
                  No employees found
                </td>

              </tr>

            )}

          </tbody>

        </table>

        <div className="pagination">

          <button
            disabled={currentPage === 1}
            onClick={() =>
              setCurrentPage(currentPage - 1)
            }
          >
            Previous
          </button>

          {Array.from(
            { length: totalPages },
            (_, index) => (
              <button
                key={index}
                className={
                  currentPage === index + 1
                    ? "active-page"
                    : ""
                }
                onClick={() =>
                  setCurrentPage(index + 1)
                }
              >
                {index + 1}
              </button>
            )
          )}

          <button
            disabled={
              currentPage === totalPages ||
              totalPages === 0
            }
            onClick={() =>
              setCurrentPage(currentPage + 1)
            }
          >
            Next
          </button>

        </div>

      </div>

      <AddEmployeeModal
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        onSave={() => {
          loadEmployees();
        }}
      />


      <EditEmployeeModal
  open={openEditModal}
  employee={selectedEmployee}
  onClose={() => setOpenEditModal(false)}
  onSave={loadEmployees}
/>

      <DeleteEmployeeModal
  open={openDeleteModal}
  employee={selectedEmployee}
  onClose={() => setOpenDeleteModal(false)}
  onDelete={loadEmployees}
/>

    </div>
  );
}

export default Employees;