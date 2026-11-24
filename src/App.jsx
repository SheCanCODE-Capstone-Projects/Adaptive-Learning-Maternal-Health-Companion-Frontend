
import { Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

import MyJourney from "./pages/MyJourney";
import Appointments from "./pages/Appointments";
import Diary from "./pages/Diary";

function App() {
  return (
    <div className="app-layout">
      {/* Shared sidebar */}
      <Sidebar />

      <main className="main-content">
        {/* Shared navbar */}
        <Navbar />

        {/* Page content changes depending on the route */}
        <div className="page-content">
          <Routes>
            <Route path="/" element={<MyJourney />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/diary" element={<Diary />} />

            {/* Redirect unknown pages */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
