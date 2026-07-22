import { useEffect, useMemo, useState } from "react";
import "./Services.css";

import AddServiceModal from "../components/modals/AddServiceModal";
import EditServiceModal from "../components/modals/EditServiceModal";
import DeleteConfirmModal from "../components/modals/DeleteConfirmModal";
import { API_BASE_URL } from "../config/api";
import { formatOMR } from "../utils/currency";

function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const [selectedService, setSelectedService] = useState(null);

  const rowsPerPage = 10;

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/services`);
      const data = await res.json();

      setServices(data.services);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const filteredServices = useMemo(() => {
    return services.filter((service) =>
      (
        service.name +
        " " +
        service.description
      )
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [services, search]);

  const totalPages = Math.ceil(filteredServices.length / rowsPerPage);

  const currentServices = filteredServices.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  if (loading) {
    return <h2>Loading Services...</h2>;
  }

  return (
    <div className="services-page">

      <div className="services-header">

        <div>
          <h1>Services</h1>
          <p>Manage Beauty Center Services</p>
        </div>

        <button
          className="add-btn"
          onClick={() => setOpenAddModal(true)}
        >
          + Add Service
        </button>

      </div>

      <div className="toolbar">

        <input
          type="text"
          placeholder="Search service..."
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
              <th>#</th>
              <th>Service</th>
              <th>Description</th>
              <th>Duration</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {currentServices.length > 0 ? (
              currentServices.map((service) => (

                <tr key={service.id}>

                  <td data-label="#">{service.id}</td>

                  <td data-label="Service">{service.name}</td>

                  <td data-label="Description">{service.description}</td>

                  <td data-label="Duration">{service.duration} min</td>

                  <td data-label="Price">{formatOMR(service.price)}</td>

                  <td data-label="Actions">

                    <button
                      className="edit-btn"
                      onClick={() => {
                        setSelectedService(service);
                        setOpenEditModal(true);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => {
                        setSelectedService(service);
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
                  No services found
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

      {/* Add */}

      <AddServiceModal
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        onSave={(newService) => {
          setServices((prev) => [...prev, newService]);
        }}
      />

      {/* Edit */}

      <EditServiceModal
    open={openEditModal}
    service={selectedService}
    onClose={() => setOpenEditModal(false)}
    onUpdate={(updatedService) => {
        setServices((prev) =>
            prev.map((item) =>
                item.id === updatedService.id
                    ? updatedService
                    : item
            )
        );

        setOpenEditModal(false);
    }}
/>

      {/* Delete */}

      <DeleteConfirmModal
        open={openDeleteModal}
        service={selectedService}
        onClose={() => setOpenDeleteModal(false)}
        onDelete={(id) => {

          setServices((prev) =>
            prev.filter((item) => item.id !== id)
          );

          setOpenDeleteModal(false);

        }}
      />

    </div>
  );
}

export default Services;