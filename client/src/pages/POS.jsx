import { useState, useEffect } from "react";
import api from "../api";
import { useToast } from "../context/ToastContext";

const CATEGORIES = ["all", "espresso", "drip", "tea", "food", "other"];
const CAT_EMOJI  = { espresso:"☕", drip:"🫖", tea:"🍵", food:"🥐", other:"📦" };

export default function POS() {
  const toast = useToast();
  const [menu, setMenu]       = useState([]);
  const [cart, setCart]       = useState([]);
  const [cat, setCat]         = useState("all");
  const [note, setNote]       = useState("");
  const [payment, setPayment] = useState("card");
  const [submitting, setSubmitting] = useState(false);
  const [lastOrder, setLastOrder]   = useState(null);

  useEffect(() => {
    api.get("/menu").then(r => setMenu(r.data));
  }, []);

  const filtered = cat === "all" ? menu.filter(i => i.available) : menu.filter(i => i.category === cat && i.available);

  const addToCart = (item) => {
    setCart(c => {
      const existing = c.find(x => x.menuItem === item._id);
      if (existing) return c.map(x => x.menuItem === item._id ? { ...x, quantity: x.quantity + 1 } : x);
      return [...c, { menuItem: item._id, name: item.name, price: item.price, quantity: 1, notes: "" }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(c => c.map(x => x.menuItem === id ? { ...x, quantity: Math.max(0, x.quantity + delta) } : x).filter(x => x.quantity > 0));
  };

  const subtotal = cart.reduce((t, i) => t + i.price * i.quantity, 0);
  const tax      = subtotal * 0.06;
  const total    = subtotal + tax;

  const checkout = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    try {
      const { data } = await api.post("/orders", { items: cart, total, paymentMethod: payment, customerName: note });
      await api.patch(`/orders/${data._id}/status`, { status: "completed" });
      setLastOrder({ ...data, total });
      setCart([]); setNote("");
      toast("Order completed! 🎉");
    } catch (err) {
      toast(err.response?.data?.message || "Checkout failed", "error");
    } finally { setSubmitting(false); }
  };

  return (
    <div style={{ display: "flex", gap: 20, height: "calc(100vh - 56px)" }}>
      {/* Menu panel */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Point of Sale</h1>
          <button className="btn btn-ghost btn-sm" onClick={() => api.post("/menu/seed").then(() => api.get("/menu").then(r => setMenu(r.data)))}>
            Seed Menu
          </button>
        </div>

        {/* Category filter */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCat(c)} className="btn btn-sm" style={{
              background: cat === c ? "var(--accent)" : "var(--surface)",
              color: cat === c ? "#fff" : "var(--muted)",
              border: "1px solid var(--border)",
              textTransform: "capitalize",
            }}>
              {c !== "all" && CAT_EMOJI[c]} {c}
            </button>
          ))}
        </div>

        {/* Menu grid */}
        <div style={{ flex: 1, overflowY: "auto", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12, alignContent: "start" }}>
          {filtered.map(item => (
            <button key={item._id} onClick={() => addToCart(item)} style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 10, padding: 16, textAlign: "left", cursor: "pointer",
              transition: "all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.background = "var(--surface2)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--surface)"; }}
            >
              <div style={{ fontSize: 22, marginBottom: 8 }}>{CAT_EMOJI[item.category] || "📦"}</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, lineHeight: 1.3 }}>{item.name}</div>
              <div style={{ fontSize: 13, color: "var(--accent)", fontWeight: 600 }}>${item.price.toFixed(2)}</div>
              {item.description && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4, lineHeight: 1.4 }}>{item.description}</div>}
            </button>
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: "1/-1", color: "var(--muted)", fontSize: 13, padding: 20 }}>No items in this category.</div>
          )}
        </div>
      </div>

      {/* Cart panel */}
      <div style={{ width: 300, flexShrink: 0, display: "flex", flexDirection: "column", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Current Order</h2>

        {/* Cart items */}
        <div style={{ flex: 1, overflowY: "auto", marginBottom: 16 }}>
          {cart.length === 0 ? (
            <div style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", marginTop: 40 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>☕</div>
              Tap items to add them
            </div>
          ) : cart.map(item => (
            <div key={item.menuItem} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>${(item.price * item.quantity).toFixed(2)}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button onClick={() => updateQty(item.menuItem, -1)} style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid var(--border)", background: "var(--surface2)", color: "var(--text)", fontSize: 14 }}>−</button>
                <span style={{ fontSize: 13, fontWeight: 600, minWidth: 16, textAlign: "center" }}>{item.quantity}</span>
                <button onClick={() => updateQty(item.menuItem, 1)}  style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid var(--border)", background: "var(--surface2)", color: "var(--text)", fontSize: 14 }}>+</button>
              </div>
            </div>
          ))}
        </div>

        {/* Customer name */}
        <div className="form-group">
          <label>Customer Name (optional)</label>
          <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Alex" />
        </div>

        {/* Payment method */}
        <div className="form-group">
          <label>Payment</label>
          <select value={payment} onChange={e => setPayment(e.target.value)}>
            <option value="card">Card</option>
            <option value="cash">Cash</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Totals */}
        <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}><span>Tax (6%)</span><span>${tax.toFixed(2)}</span></div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 700, marginBottom: 16, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
          <span>Total</span><span>${total.toFixed(2)}</span>
        </div>

        <button className="btn btn-success" style={{ justifyContent: "center" }} onClick={checkout} disabled={cart.length === 0 || submitting}>
          {submitting ? <><span className="spinner" /> Processing...</> : `Charge $${total.toFixed(2)}`}
        </button>
        {cart.length > 0 && (
          <button className="btn btn-ghost btn-sm" style={{ justifyContent: "center", marginTop: 8 }} onClick={() => setCart([])}>
            Clear order
          </button>
        )}

        {/* Last order receipt */}
        {lastOrder && (
          <div style={{ marginTop: 16, padding: 12, background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 8, fontSize: 12 }}>
            <div style={{ fontWeight: 600, color: "var(--success)", marginBottom: 4 }}>✅ Order complete</div>
            <div style={{ color: "var(--muted)" }}>{lastOrder.items.length} item{lastOrder.items.length !== 1 ? "s" : ""} · ${lastOrder.total.toFixed(2)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
