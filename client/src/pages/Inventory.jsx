import { useState, useEffect } from "react";
import api from "../api";
import { useToast } from "../context/ToastContext";

const CATS = ["all","beans","dairy","syrups","food","supplies","other"];
const EMPTY = { name:"", category:"other", quantity:0, unit:"units", lowStockThreshold:10, cost:0, supplier:"" };

export default function Inventory() {
  const toast = useToast();
  const [items, setItems]     = useState([]);
  const [cat, setCat]         = useState("all");
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null); // null | "add" | item
  const [form, setForm]       = useState(EMPTY);
  const [saving, setSaving]   = useState(false);

  const load = () => {
    setLoading(true);
    api.get("/inventory").then(r => setItems(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = cat === "all" ? items : items.filter(i => i.category === cat);

  const openAdd  = () => { setForm(EMPTY); setModal("add"); };
  const openEdit = (item) => { setForm({ ...item }); setModal(item); };

  const save = async () => {
    setSaving(true);
    try {
      if (modal === "add") {
        await api.post("/inventory", form);
        toast("Item added");
      } else {
        await api.put(`/inventory/${modal._id}`, form);
        toast("Item updated");
      }
      load(); setModal(null);
    } catch (err) {
      toast(err.response?.data?.message || "Save failed", "error");
    } finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm("Delete this item?")) return;
    try { await api.delete(`/inventory/${id}`); load(); toast("Item deleted"); }
    catch { toast("Delete failed", "error"); }
  };

  const adjustQty = async (id, delta) => {
    try {
      const { data } = await api.patch(`/inventory/${id}/quantity`, { delta });
      setItems(items => items.map(i => i._id === id ? data : i));
    } catch { toast("Failed to update quantity", "error"); }
  };

  const seed = async () => {
    try { await api.post("/inventory/seed"); load(); toast("Inventory seeded"); }
    catch { toast("Seed failed", "error"); }
  };

  const f = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Inventory</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={seed}>Seed</button>
          <button className="btn btn-primary btn-sm" onClick={openAdd}>+ Add Item</button>
        </div>
      </div>

      {/* Category tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {CATS.map(c => (
          <button key={c} onClick={() => setCat(c)} className="btn btn-sm" style={{
            background: cat === c ? "var(--accent)" : "var(--surface)",
            color: cat === c ? "#fff" : "var(--muted)",
            border: "1px solid var(--border)", textTransform: "capitalize",
          }}>{c}</button>
        ))}
      </div>

      {/* Low stock banner */}
      {items.filter(i => i.quantity <= i.lowStockThreshold).length > 0 && (
        <div style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13 }}>
          ⚠️ {items.filter(i => i.quantity <= i.lowStockThreshold).length} item(s) are at or below their low stock threshold.
        </div>
      )}

      {loading ? <div style={{ display:"flex",alignItems:"center",gap:10 }}><div className="spinner" /> Loading...</div> : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table>
            <thead>
              <tr><th>Name</th><th>Category</th><th>Quantity</th><th>Unit</th><th>Threshold</th><th>Cost</th><th>Supplier</th><th>Adjust</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const isLow = item.quantity <= item.lowStockThreshold;
                return (
                  <tr key={item._id}>
                    <td style={{ fontWeight: 500 }}>{item.name}</td>
                    <td><span className="badge badge-blue" style={{ textTransform:"capitalize" }}>{item.category}</span></td>
                    <td>
                      <span className={`badge ${item.quantity === 0 ? "badge-red" : isLow ? "badge-yellow" : "badge-green"}`}>
                        {item.quantity}
                      </span>
                    </td>
                    <td style={{ color: "var(--muted)", fontSize: 12 }}>{item.unit}</td>
                    <td style={{ color: "var(--muted)", fontSize: 12 }}>{item.lowStockThreshold}</td>
                    <td style={{ fontSize: 12 }}>${item.cost?.toFixed(2) || "0.00"}</td>
                    <td style={{ color: "var(--muted)", fontSize: 12 }}>{item.supplier || "—"}</td>
                    <td>
                      <div style={{ display:"flex", gap:4 }}>
                        <button onClick={() => adjustQty(item._id, -1)} className="btn btn-ghost btn-sm" style={{ padding:"4px 8px" }}>−</button>
                        <button onClick={() => adjustQty(item._id, 10)} className="btn btn-ghost btn-sm" style={{ padding:"4px 8px", color:"var(--success)" }}>+10</button>
                      </div>
                    </td>
                    <td>
                      <div style={{ display:"flex", gap:4 }}>
                        <button onClick={() => openEdit(item)} className="btn btn-ghost btn-sm">Edit</button>
                        <button onClick={() => del(item._id)} className="btn btn-sm" style={{ background:"rgba(248,113,113,0.1)", color:"var(--danger)", border:"none" }}>✕</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign:"center", color:"var(--muted)", padding:32 }}>No items found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit modal */}
      {modal !== null && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">{modal === "add" ? "Add Inventory Item" : "Edit Item"}</h2>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div className="form-group" style={{ gridColumn:"1/-1" }}>
                <label>Name</label>
                <input type="text" value={form.name} onChange={f("name")} placeholder="Item name" />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={form.category} onChange={f("category")}>
                  {["beans","dairy","syrups","food","supplies","other"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Unit</label>
                <input type="text" value={form.unit} onChange={f("unit")} placeholder="lbs, gallons, units…" />
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input type="number" value={form.quantity} onChange={f("quantity")} min={0} />
              </div>
              <div className="form-group">
                <label>Low Stock Threshold</label>
                <input type="number" value={form.lowStockThreshold} onChange={f("lowStockThreshold")} min={0} />
              </div>
              <div className="form-group">
                <label>Cost per unit ($)</label>
                <input type="number" value={form.cost} onChange={f("cost")} step={0.01} min={0} />
              </div>
              <div className="form-group">
                <label>Supplier</label>
                <input type="text" value={form.supplier} onChange={f("supplier")} placeholder="Supplier name" />
              </div>
            </div>
            <div style={{ display:"flex", gap:8, marginTop:8 }}>
              <button className="btn btn-primary" onClick={save} disabled={saving} style={{ flex:1, justifyContent:"center" }}>
                {saving ? <><span className="spinner" /> Saving...</> : "Save"}
              </button>
              <button className="btn btn-ghost" onClick={() => setModal(null)} style={{ flex:1, justifyContent:"center" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
