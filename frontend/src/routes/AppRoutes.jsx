import React from "react";
import { Routes, Route } from "react-router-dom";

// Layout Wrapper
import DashboardLayout from "./components/Layout/DashboardLayout"; // Adjust the path based on your folder structure

// Pages
import Dashboard from "./pages/Dashboard";
import AIAssistant from "./pages/AIAssistant";
import Alerts from "./pages/Alerts";
import WorkOrders from "./pages/WorkOrdersPage"; // Linked to your page file
import Inventory from "./pages/Inventory";
import UploadManuals from "./pages/UploadManuals";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

const AppRoutes = () => {
    return (
        <Routes>
            {/* Parent Layout Route containing the stationary Sidebar & Topbar */}
            <Route element={<DashboardLayout />}>

                {/* Nested Control Center Workspaces (Rendered inside <Outlet />) */}
                <Route path="/" element={<Dashboard />} />
                <Route path="/ai-assistant" element={<AIAssistant />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/work-orders" element={<WorkOrders />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/upload-manuals" element={<UploadManuals />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />

            </Route>
        </Routes>
    );
};

export default AppRoutes;