import { NavLink, useNavigate } from "react-router-dom";
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

  const linkClass = ({ isActive }) => (isActive ? "active" : "");

  return (
    <>
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>

        <div className="logo">
          Beebo Beauty
        </div>

        <nav>

          <NavLink to="/dashboard" className={linkClass} onClick={onClose}>
            <FaHome />
            {t("dashboard")}
          </NavLink>

          {user?.role === "admin" && (
            <NavLink to="/services" className={linkClass} onClick={onClose}>
              <FaCut />
              {t("services")}
            </NavLink>
          )}

          {user?.role === "admin" && (
            <NavLink to="/employees" className={linkClass} onClick={onClose}>
              <FaUsers />
              {t("employees")}
            </NavLink>
          )}

          <NavLink to="/appointments" className={linkClass} onClick={onClose}>
            <FaCalendarAlt />
            {t("appointments")}
          </NavLink>

          <NavLink to="/customers" className={linkClass} onClick={onClose}>
            <FaUserFriends />
            {t("customers")}
          </NavLink>

          {user?.role === "admin" && (
            <NavLink to="/reports" className={linkClass} onClick={onClose}>
              <FaChartBar />
              {t("reports")}
            </NavLink>
          )}

          <NavLink to="/settings" className={linkClass} onClick={onClose}>
            <FaCog />
            {t("settings")}
          </NavLink>

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
