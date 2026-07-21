import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";
import "../styles/dashboard.css";

function DashboardLayout() {

    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (

        <div className="dashboard">

            <Sidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="main-content">

                <Header
                    onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
                />

                <div className="page-content">

                    <Outlet />

                </div>

            </div>

        </div>

    );

}

export default DashboardLayout;
