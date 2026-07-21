import "./RecentAppointments.css";
import { useLanguage } from "../../context/LanguageContext";

const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

function RecentAppointments({ appointments = [] }) {
  const { t } = useLanguage();

  return (
    <div className="table-card">

      <h2>{t("recent_appointments_today")}</h2>

      <table>

        <thead>

          <tr>
            <th>Customer</th>
            <th>Service</th>
            <th>Employee</th>
            <th>Date</th>
            <th>Status</th>
          </tr>

        </thead>

        <tbody>

          {appointments.length > 0 ? (

            appointments.map((item) => (

              <tr key={item.id}>

                <td>{item.Customer?.full_name || "-"}</td>

                <td>{item.services?.length > 0 ? item.services.join(", ") : "-"}</td>

                <td>{item.User?.full_name || "-"}</td>

                <td>
                  {item.appointment_date}
                  <br />
                  <small>{item.appointment_time?.slice(0, 5)}</small>
                </td>

                <td>
                  <span className={`ra-badge ra-status-${item.status}`}>
                    {STATUS_LABELS[item.status] || item.status}
                  </span>
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
                No appointments found
              </td>

            </tr>

          )}

        </tbody>

      </table>

    </div>
  );
}

export default RecentAppointments;
