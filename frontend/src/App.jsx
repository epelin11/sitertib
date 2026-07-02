import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Beranda from "./pages/Beranda";
import Tentang from "./pages/Tentang";
import IsiIdentitas from "./pages/IsiIdentitas";
import Login from "./pages/Login";
import DataSiswa from "./pages/DataSiswa";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Beranda />} />
          <Route path="/tentang" element={<Tentang />} />
          <Route path="/isi-identitas" element={<IsiIdentitas />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/data-siswa"
            element={
              <ProtectedRoute>
                <DataSiswa />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
