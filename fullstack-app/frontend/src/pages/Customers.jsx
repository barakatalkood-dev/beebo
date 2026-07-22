import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./Employees.css";
import AddCustomerModal from "../components/modals/AddCustomerModal";
import EditCustomerModal from "../components/modals/EditCustomerModal";
import DeleteCustomerModal from "../components/modals/DeleteCustomerModal";
import { API_BASE_URL } from "../config/api";


function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [openAddModal, setOpenAddModal] = useState(false);

  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const rowsPerPage = 10;

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const token = localStorage.getItem("token");

      const { data } = await axios.get(
        `${API_BASE_URL}/customers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCustomers(data.customers);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) =>
      (
        customer.full_name +
        " " +
        customer.phone +
        " " +
        (customer.email || "")
      )
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [customers, search]);

  const totalPages = Math.ceil(
    filteredCustomers.length / rowsPerPage
  );

  const currentCustomers = filteredCustomers.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  if (loading) {
    return <h2>Loading Customers...</h2>;
  }

  return (
    <div className="services-page">

      <div className="services-header">

        <div>
          <h1>Customers</h1>
          <p>Manage Beauty Center Customers</p>
        </div>

        <button
  className="add-btn"
  onClick={() => setOpenAddModal(true)}
>
  + Add Customer
</button>

      </div>

      <div className="toolbar">

        <input
          type="text"
          placeholder="Search customer..."
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
              <th>Phone</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>

          </thead>

          <tbody>

            {currentCustomers.length > 0 ? (

              currentCustomers.map((customer) => (

                <tr key={customer.id}>

                  <td data-label="ID">{customer.id}</td>

                  <td data-label="Full Name">{customer.full_name}</td>

                  <td data-label="Phone">{customer.phone}</td>

                  <td data-label="Email">{customer.email || "-"}</td>

                  <td data-label="Actions">

                   <button
  className="edit-btn"
  onClick={() => {
    setSelectedCustomer(customer);
    setOpenEditModal(true);
  }}
>
  Edit
</button>

                    <button
  className="delete-btn"
  onClick={() => {
    setSelectedCustomer(customer);
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
                  colSpan="5"
                  style={{
                    textAlign: "center",
                    padding: "20px",
                  }}
                >
                  No customers found
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
<AddCustomerModal
  open={openAddModal}
  onClose={() => setOpenAddModal(false)}
  onSave={loadCustomers}
/>


<EditCustomerModal
  open={openEditModal}
  customer={selectedCustomer}
  onClose={() => setOpenEditModal(false)}
  onSave={loadCustomers}
/>


<DeleteCustomerModal
  open={openDeleteModal}
  customer={selectedCustomer}
  onClose={() => setOpenDeleteModal(false)}
  onDelete={loadCustomers}
/>

    </div>
  );
}

export default Customers;