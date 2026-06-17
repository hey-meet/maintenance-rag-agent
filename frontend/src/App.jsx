import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layout Wrapper
import DashboardLayout from "./components/layout/DashboardLayout";

// Pages
import Dashboard from "./pages/Dashboard";
import Alerts from "./pages/Alerts";
import WorkOrdersPage from "./pages/WorkOrdersPage";
import Inventory from "./pages/Inventory";
import UploadManuals from "./pages/UploadManuals";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import AIAssistant from "./pages/AIAssistant";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Global Layout Wrapper Route */}
        <Route element={<DashboardLayout />}>
          {/* Nested Content Routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/work-orders" element={<WorkOrdersPage />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/upload-manuals" element={<UploadManuals />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;