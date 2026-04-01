import { useState, useEffect } from "react";
import api from "../api";

const STATUS_BADGE = { completed: "badge-green", open: "badge-blue", voided: "badge-red" };

export default function Orders() {
  const [orders, setOrders]   = useState([]);
  const [filter, setFilter]   = useState("all");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = () => {
    setLoading(true);
    const q = filter !== "all" ? `?status=${filter}` : "";
    api.get(`/orders${q}&limit=100`).then(r => setOrders(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const fmt = (n) => `$${Number(n).toFixed(2)}`;

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Orders</h1>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["all","completed","open","voided"].map(s => (
          <button key={s} onClick={() => setFilter(s)} className="btn btn-sm" style={{
            background: filter === s ? "var(--accent)" : "var(--surface)",
            color: filter === s ? "#fff" : "var(--muted)",
            border: "1px solid var(--border)", textTransform: "capitalize",
          }}>{s}</button>
        ))}
        <button onClick={load} className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }}>↻ Refresh</button>
      </div>

      {loading ? (
        <div style={{ display:"flex", alignItems:"center", gap:10 }}><div className="spinner" /> Loading...</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table>
            <thead>
              <tr>
                <th>Time</th><th>Customer</th><th>Items</th><th>Total</th>
                <th>Payment</th><th>Status</th><th>Served by</th><th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o._id} style={{ cursor: "pointer" }} onClick={() => setSelected(o)}>
                  <td style={{ fontSize: 12, color: "var(--muted)" }}>
                    {new Date(o.createdAt).toLocaleDateString()}<br />
                    {new Date(o.createdAt).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })}
                  </td>
                  <td>{o.customerName || <span style={{ color:"var(--muted)" }}>—</span>}</td>
                  <td>{o.items.length}</td>
                  <td style={{ fontWeight: 600 }}>{fmt(o.total)}</td>
                  <td style={{ textTransform: "capitalize", color: "var(--muted)", fontSize: 12 }}>{o.paymentMethod}</td>
                  <td><span className={`badge ${STATUS_BADGE[o.status]}`}>{o.status}</span></td>
                  <td style={{ fontSize: 12, color: "var(--muted)" }}>{o.servedBy?.name || "—"}</td>
                  <td style={{ color: "var(--muted)" }}>›</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: "center", color: "var(--muted)", padding: 32 }}>No orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Order detail modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 className="modal-title" style={{ marginBottom: 0 }}>Order Detail</h2>
              <span className={`badge ${STATUS_BADGE[selected.status]}`}>{selected.status}</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>
              {new Date(selected.createdAt).toLocaleString()} · {selected.paymentMethod}
              {selected.customerName && ` · ${selected.customerName}`}
            </div>
            <table style={{ marginBottom: 16 }}>
              <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Line</th></tr></thead>
              <tbody>
                {selected.items.map((item, i) => (
                  <tr key={i}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>${item.price.toFixed(2)}</td>
                    <td style={{ fontWeight: 600 }}>${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 15, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
              <span>Total</span><span>{fmt(selected.total)}</span>
            </div>
            <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", marginTop: 16 }} onClick={() => setSelected(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
