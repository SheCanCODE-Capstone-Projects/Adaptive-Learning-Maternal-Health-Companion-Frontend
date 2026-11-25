import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Learn from "./pages/Learn";
import Facilities from "./pages/Facilities";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/learn" replace />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/facilities" element={<Facilities />} />
        </Routes>
      </main>

      <Footer />
    </BrowserRouter>
  );
}

export default App;