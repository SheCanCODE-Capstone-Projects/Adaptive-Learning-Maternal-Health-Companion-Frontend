
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

import Appointments from "./pages/Appointments";
import Diary from "./pages/Diary";
import Notifications from "./pages/Notifications";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        {/* Left navigation */}
        <Sidebar />

        {/* Main application area */}
        <main className="main-content">
          {/* Top navigation */}
          <Navbar />

          {/* Application pages */}
          <div className="page-content">
            <Routes>
              <Route
                path="/"
                element={<Navigate to="/appointments" replace />}
              />

              <Route
                path="/appointments"
                element={<Appointments />}
              />

              <Route
                path="/diary"
                element={<Diary />}
              />

              <Route
                path="/notifications"
                element={<Notifications />}
              />

              <Route
                path="*"
                element={<Navigate to="/appointments" replace />}
              />
            </Routes>
          </div>

          <footer className="app-footer">
            <p>
              © {new Date().getFullYear()} MaternalCare.
              Your health, your journey.
            </p>
          </footer>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
