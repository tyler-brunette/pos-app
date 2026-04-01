import { useState, useEffect } from "react";
import api from "../api";

function StatCard({ label, value, sub, color = "var(--accent)" }) {
  return (
    <div className="card" style={{ position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: color, borderRadius: "10px 0 0 10px" }} />
      <div style={{ paddingLeft: 8 }}>
        <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>{label}</div>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -1 }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats]       = useState(null);
  const [orders, setOrders]     = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/orders/stats"),
      api.get("/orders?status=completed&limit=6"),
      api.get("/inventory"),
    ]).then(([s, o, inv]) => {
      setStats(s.data);
      setOrders(o.data);
      setLowStock(inv.data.filter(i => i.quantity <= i.lowStockThreshold));
    }).finally(() => setLoading(false));
  }, []);

  const fmt = (n) => `$${Number(n).toFixed(2)}`;

  if (loading) return <div style={{ display:"flex",alignItems:"center",gap:10 }}><div className="spinner" /> Loading dashboard...</div>;

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Dashboard</h1>
      <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 28 }}>
        {new Date().toLocaleDateString("en-US", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}
      </p>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
        <StatCard label="Today's Revenue"  value={fmt(stats?.todayRevenue)}   sub={`${stats?.todayCount} orders`}  color="var(--accent)" />
        <StatCard label="This Week"        value={fmt(stats?.weekRevenue)}    sub={`${stats?.weekCount} orders`}   color="var(--accent2)" />
        <StatCard label="All-Time Revenue" value={fmt(stats?.allTimeRevenue)} color="var(--success)" />
        <StatCard label="Low Stock Items"  value={lowStock.length}            sub="need restocking"                color={lowStock.length > 0 ? "var(--warning)" : "var(--success)"} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Recent orders */}
        <div className="card">
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Recent Orders</h2>
          {orders.length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: 13 }}>No orders yet today.</p>
          ) : (
            <table>
              <thead><tr><th>Time</th><th>Items</th><th>Total</th><th>By</th></tr></thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o._id}>
                    <td style={{ color: "var(--muted)", fontSize: 12 }}>{new Date(o.createdAt).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })}</td>
                    <td>{o.items.length} item{o.items.length !== 1 ? "s" : ""}</td>
                    <td style={{ fontWeight: 600 }}>{fmt(o.total)}</td>
                    <td style={{ color: "var(--muted)", fontSize: 12 }}>{o.servedBy?.name || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Low stock */}
        <div className="card">
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
            Low Stock Alerts
            {lowStock.length > 0 && <span className="badge badge-yellow" style={{ marginLeft: 8 }}>{lowStock.length}</span>}
          </h2>
          {lowStock.length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: 13 }}>✅ All items well stocked.</p>
          ) : (
            <table>
              <thead><tr><th>Item</th><th>Qty</th><th>Threshold</th></tr></thead>
              <tbody>
                {lowStock.map(i => (
                  <tr key={i._id}>
                    <td>{i.name}</td>
                    <td>
                      <span className={`badge ${i.quantity === 0 ? "badge-red" : "badge-yellow"}`}>
                        {i.quantity} {i.unit}
                      </span>
                    </td>
                    <td style={{ color: "var(--muted)", fontSize: 12 }}>{i.lowStockThreshold} {i.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
