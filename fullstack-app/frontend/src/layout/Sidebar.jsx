import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

import {
  FaHome,
  FaCut,
  FaUsers,
  FaCalendarAlt,
  FaUserFriends,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>

        <div className="logo">
          Beebo Beauty
        </div>

        <nav>

          <Link to="/dashboard" onClick={onClose}>
            <FaHome />
            {t("dashboard")}
          </Link>

          {user?.role === "admin" && (
            <Link to="/services" onClick={onClose}>
              <FaCut />
              {t("services")}
            </Link>
          )}

          {user?.role === "admin" && (
            <Link to="/employees" onClick={onClose}>
              <FaUsers />
              {t("employees")}
            </Link>
          )}

          <Link to="/appointments" onClick={onClose}>
            <FaCalendarAlt />
            {t("appointments")}
          </Link>

          <Link to="/customers" onClick={onClose}>
            <FaUserFriends />
            {t("customers")}
          </Link>

          {user?.role === "admin" && (
            <Link to="/reports" onClick={onClose}>
              <FaChartBar />
              {t("reports")}
            </Link>
          )}

          <Link to="/settings" onClick={onClose}>
            <FaCog />
            {t("settings")}
          </Link>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            <FaSignOutAlt />
            {t("logout")}
          </button>

        </nav>

      </aside>

      {open && <div className="sidebar-backdrop" onClick={onClose}></div>}
    </>
  );
}

export default Sidebar;
