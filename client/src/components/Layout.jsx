import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROLE_COLOR = { admin: "badge-red", manager: "badge-blue", barista: "badge-green" };

const NAV = [
  { to: "/dashboard", label: "Dashboard",  icon: "📊", roles: ["admin","manager"] },
  { to: "/pos",       label: "Point of Sale",icon: "☕", roles: ["admin","manager","barista"] },
  { to: "/orders",    label: "Orders",      icon: "🧾", roles: ["admin","manager"] },
  { to: "/inventory", label: "Inventory",   icon: "📦", roles: ["admin","manager"] },
  { to: "/schedule",  label: "Schedule",    icon: "📅", roles: ["admin","manager","barista"] },
  { to: "/employees", label: "Employees",   icon: "👥", roles: ["admin"] },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/login"); };

  const visibleNav = NAV.filter((n) => n.roles.includes(user?.role));

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, flexShrink: 0,
        background: "var(--surface)", borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column",
        padding: "20px 0",
      }}>
        {/* Logo */}
        <div style={{ padding: "0 20px 24px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.5 }}>☕ Brew</div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>POS System</div>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: "16px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
          {visibleNav.map((n) => (
            <NavLink key={n.to} to={n.to} style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: 10,
              padding: "9px 12px", borderRadius: 8,
              fontSize: 13, fontWeight: 500,
              color: isActive ? "var(--accent)" : "var(--muted)",
              background: isActive ? "rgba(108,143,255,0.1)" : "transparent",
              transition: "all 0.15s",
              textDecoration: "none",
            })}>
              <span>{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div style={{ padding: "16px 16px 0", borderTop: "1px solid var(--border)" }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{user?.name}</div>
          <span className={`badge ${ROLE_COLOR[user?.role]}`}>{user?.role}</span>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ width: "100%", marginTop: 12 }}>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: "auto", padding: 28, background: "var(--bg)" }}>
        <Outlet />
      </main>
    </div>
  );
}
