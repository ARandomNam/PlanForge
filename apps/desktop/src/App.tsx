import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import NewPlan from "./pages/NewPlan";
import Settings from "./pages/Settings";
import { PlanProvider } from "./contexts/PlanContext";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Database initialization is handled in the main process
    setIsInitialized(true);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing PlanForge...</p>
        </div>
      </div>
    );
  }

  return (
    <PlanProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <div className="flex h-screen bg-background">
          {/* Sidebar */}
          <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

          {/* Main Content */}
          <div
            className={`flex-1 transition-all duration-300 ${
              sidebarOpen ? "ml-64" : "ml-16"
            }`}
          >
            <main className="h-full overflow-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/new-plan" element={<NewPlan />} />
                <Route
                  path="/tasks"
                  element={<div className="p-6">Tasks page coming soon...</div>}
                />
                <Route
                  path="/calendar"
                  element={
                    <div className="p-6">Calendar page coming soon...</div>
                  }
                />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </PlanProvider>
  );
}

export default App;
