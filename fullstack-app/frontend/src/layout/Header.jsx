import { useEffect, useRef, useState } from "react";
import { FaBell, FaBars } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { API_BASE_URL as API } from "../config/api";

const POLL_INTERVAL = 60000; // 1 minute
const WITHIN_MINUTES = 60;

function getInitials(name = "") {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");
}

function minutesUntil(time) {
    const [h, m] = time.slice(0, 5).split(":").map(Number);
    const now = new Date();
    const target = h * 60 + m;
    const current = now.getHours() * 60 + now.getMinutes();
    return target - current;
}

function Header({ onToggleSidebar }) {
    const { user, token } = useAuth();
    const { t } = useLanguage();

    const [upcoming, setUpcoming] = useState([]);
    const [dismissedIds, setDismissedIds] = useState(() => new Set());
    const [open, setOpen] = useState(false);
    const notifiedIds = useRef(new Set());
    const dropdownRef = useRef(null);

    const visibleUpcoming = upcoming.filter((item) => !dismissedIds.has(item.id));

    useEffect(() => {
        if (!token) return;

        loadUpcoming();

        const interval = setInterval(loadUpcoming, POLL_INTERVAL);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    useEffect(() => {
        if (!open) return;

        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    const loadUpcoming = async () => {
        try {
            const { data } = await axios.get(`${API}/appointments/upcoming`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { within: WITHIN_MINUTES },
            });

            const appointments = data.appointments || [];
            setUpcoming(appointments);

            appointments.forEach((item) => {
                if (!notifiedIds.current.has(item.id)) {
                    notifiedIds.current.add(item.id);

                    const mins = minutesUntil(item.appointment_time);

                    toast.info(
                        `Upcoming: ${item.Customer?.full_name || "Customer"} — ${item.Service?.name || (item.services || []).map((s) => s.name).join(", ")} in ${mins <= 0 ? "a moment" : `${mins} min`}`
                    );
                }
            });
        } catch (error) {
            console.error(error);
        }
    };

    const dismissNotification = (id, e) => {
        e.stopPropagation();
        setDismissedIds((prev) => new Set(prev).add(id));
    };

    return (

        <header className="header">

            <button className="hamburger-btn" onClick={onToggleSidebar}>
                <FaBars />
            </button>

            <h2>{t("dashboard")}</h2>

            <div className="header-right">

                <div className="notification-wrapper" ref={dropdownRef}>

                    <button
                        className="header-bell-btn"
                        onClick={() => setOpen((prev) => !prev)}
                    >
                        <FaBell className="header-bell" />
                        {visibleUpcoming.length > 0 && (
                            <span className="bell-badge">{visibleUpcoming.length}</span>
                        )}
                    </button>

                    {open && (
                        <div className="notification-dropdown">

                            <div className="notification-header">
                                <span>{t("upcoming_appointments")}</span>
                                <button
                                    className="notification-close"
                                    onClick={() => setOpen(false)}
                                >
                                    ×
                                </button>
                            </div>

                            {visibleUpcoming.length === 0 ? (
                                <div className="notification-empty">
                                    {t("no_upcoming")}
                                </div>
                            ) : (
                                visibleUpcoming.map((item) => (
                                    <div className="notification-item" key={item.id}>
                                        <div className="notification-item-main">
                                            <strong>{item.Customer?.full_name}</strong>
                                            <span>
                                                {item.Service?.name || (item.services || []).map((s) => s.name).join(", ")}
                                            </span>
                                        </div>
                                        <div className="notification-item-time">
                                            {item.appointment_time?.slice(0, 5)}
                                        </div>
                                        <button
                                            className="notification-dismiss"
                                            onClick={(e) => dismissNotification(item.id, e)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))
                            )}

                        </div>
                    )}

                </div>

                <div className="header-profile">

                    <div className="header-avatar">
                        {getInitials(user?.full_name) || "?"}
                    </div>

                    <div className="header-user-info">
                        <span className="header-user-name">
                            {user?.full_name || "Guest"}
                        </span>
                        <span className="header-user-role">
                            {user?.role || ""}
                        </span>
                    </div>

                </div>

            </div>

        </header>

    );

}

export default Header;
