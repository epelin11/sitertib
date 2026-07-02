import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Arahkan ke login, simpan halaman tujuan supaya bisa kembali otomatis
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
