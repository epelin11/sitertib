import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Selipkan token JWT guru (jika ada) ke setiap request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("sitertib_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
