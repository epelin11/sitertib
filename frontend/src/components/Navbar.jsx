import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, DoorOpen, ScanLine } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", label: "Beranda" },
  { to: "/tentang", label: "Tentang" },
  { to: "/isi-identitas", label: "Isi Identitas" },
  { to: "/scan-barcode", label: "Scan Barcode", protected: true },
  { to: "/data-siswa", label: "Data Siswa" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, guru, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    setOpen(false);
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-ink-100 bg-paper/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo / stempel */}
        <NavLink to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="stamp h-11 w-11 text-[10px] leading-none">
            <DoorOpen className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span className="font-display text-xl font-bold leading-none text-ink-800">
            SI TERTIB
            <span className="block text-[10px] font-sans font-medium uppercase tracking-widest text-ink-400">
              Tertib Keluar Masuk Kelas
            </span>
          </span>
        </NavLink>

        {/* Menu desktop */}
        <div className="hidden items-center gap-1 md:flex">
          {navItems
            .filter((item) => !item.protected || isAuthenticated)
            .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-md px-3.5 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-ink-800 text-white"
                    : "text-ink-700 hover:bg-ink-50"
                }`
              }
            >
              {item.to === "/scan-barcode" && <ScanLine className="mr-1 inline h-4 w-4 align-[-3px]" />}
              {item.label}
            </NavLink>
          ))}

          {isAuthenticated ? (
            <div className="ml-3 flex items-center gap-3 border-l border-ink-100 pl-3">
              <span className="text-sm text-ink-600">
                Halo, <span className="font-semibold text-ink-800">{guru?.nama}</span>
              </span>
              <button onClick={handleLogout} className="btn-outline !px-3 !py-2">
                <LogOut className="h-4 w-4" /> Keluar
              </button>
            </div>
          ) : (
            <NavLink to="/login" className="btn-primary ml-3">
              Login Guru
            </NavLink>
          )}
        </div>

        {/* Tombol menu mobile */}
        <button
          className="rounded-md p-2 text-ink-800 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Buka menu navigasi"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Menu mobile */}
      {open && (
        <div className="border-t border-ink-100 bg-paper px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-1 pt-2">
            {navItems
              .filter((item) => !item.protected || isAuthenticated)
              .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-md px-3.5 py-2.5 text-sm font-medium ${
                    isActive ? "bg-ink-800 text-white" : "text-ink-700 hover:bg-ink-50"
                  }`
                }
              >
                {item.to === "/scan-barcode" && <ScanLine className="mr-2 inline h-4 w-4 align-[-3px]" />}
                {item.label}
              </NavLink>
            ))}

            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="mt-2 flex items-center gap-2 rounded-md px-3.5 py-2.5 text-left text-sm font-medium text-danger hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" /> Keluar ({guru?.nama})
              </button>
            ) : (
              <NavLink to="/login" onClick={() => setOpen(false)} className="btn-primary mt-2">
                Login Guru
              </NavLink>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
