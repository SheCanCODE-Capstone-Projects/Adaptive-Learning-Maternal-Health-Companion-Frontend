
import { Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

import MyJourney from "./pages/MyJourney";
import Appointments from "./pages/Appointments";
import Diary from "./pages/Diary";

function App() {
  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Navbar />

        <div className="page-content">
          <Routes>
            <Route path="/" element={<MyJourney />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/diary" element={<Diary />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
