import { createContext, useContext, useState } from "react";
import api from "../api/axiosClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [guru, setGuru] = useState(() => {
    const stored = localStorage.getItem("sitertib_guru");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() =>
    localStorage.getItem("sitertib_token")
  );

  async function login(email, password) {
    const res = await api.post("/auth/login", { email, password });
    const { token: newToken, guru: guruData } = res.data;

    localStorage.setItem("sitertib_token", newToken);
    localStorage.setItem("sitertib_guru", JSON.stringify(guruData));
    setToken(newToken);
    setGuru(guruData);

    return guruData;
  }

  function logout() {
    localStorage.removeItem("sitertib_token");
    localStorage.removeItem("sitertib_guru");
    setToken(null);
    setGuru(null);
  }

  const value = {
    guru,
    token,
    isAuthenticated: Boolean(token),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  return ctx;
}
