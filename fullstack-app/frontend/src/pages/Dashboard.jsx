import { useEffect, useState } from "react";
import axios from "axios";

import StatCard from "../components/cards/StatCard";
import RevenueChart from "../components/charts/RevenueChart";
import RecentAppointments from "../components/tables/RecentAppointments";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { API_BASE_URL as API } from "../config/api";

const REFRESH_INTERVAL = 30000; // 30 seconds

function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const isAdmin = user?.role === "admin";

  const [stats, setStats] = useState({
    services: 0,
    employees: 0,
    appointmentsToday: 0,
    revenueToday: 0,
  });

  const [recentAppointments, setRecentAppointments] = useState([]);
  const [revenueChart, setRevenueChart] = useState([]);

  useEffect(() => {
    loadAll();

    const interval = setInterval(loadAll, REFRESH_INTERVAL);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAll = () => {
    loadDashboard();

    if (isAdmin) {
      loadRevenueChart();
    }
  };

  const loadDashboard = async () => {
    try {
      const token = localStorage.getItem("token");

      const { data } = await axios.get(`${API}/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStats(data.stats);
      setRecentAppointments(data.recentAppointments || []);

    } catch (error) {
      console.error(error);
    }
  };

  const loadRevenueChart = async () => {
    try {
      const token = localStorage.getItem("token");

      const { data } = await axios.get(`${API}/dashboard/revenue-chart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { days: 14 },
      });

      setRevenueChart(data.chart || []);

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {isAdmin && (
        <>
          <div className="cards">

            <StatCard
              title="Services"
              value={stats.services}
              icon="💇"
              color="var(--color-accent-1)"
            />

            <StatCard
              title="Employees"
              value={stats.employees}
              icon="👩"
              color="var(--color-accent-2)"
            />

            <StatCard
              title={t("today_appointments")}
              value={stats.appointmentsToday}
              icon="📅"
              color="var(--color-accent-3)"
            />

            <StatCard
              title={t("today_revenue")}
              value={`$${Number(stats.revenueToday).toFixed(2)}`}
              icon="💰"
              color="var(--color-accent-4)"
            />

          </div>

          <RevenueChart data={revenueChart} title="Revenue (Last 14 Days)" />
        </>
      )}

      <RecentAppointments
        appointments={recentAppointments}
      />
    </>
  );
}

export default Dashboard;
