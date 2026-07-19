import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [guru, setGuru] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('sitertib_token');
    const savedGuru = localStorage.getItem('sitertib_guru');
    if (token && savedGuru) {
      setGuru(JSON.parse(savedGuru));
    }
    setLoading(false);
  }, []);

  const login = (token, guruData) => {
    localStorage.setItem('sitertib_token', token);
    localStorage.setItem('sitertib_guru', JSON.stringify(guruData));
    setGuru(guruData);
  };

  const logout = () => {
    localStorage.removeItem('sitertib_token');
    localStorage.removeItem('sitertib_guru');
    setGuru(null);
  };

  return (
    <AuthContext.Provider value={{ guru, login, logout, isAuthenticated: !!guru, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
