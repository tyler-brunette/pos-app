import { useState, useEffect } from "react";
import api from "../api";
import { useToast } from "../context/ToastContext";

const ROLE_COLOR = { admin:"badge-red", manager:"badge-blue", barista:"badge-green" };
const EMPTY = { name:"", email:"", password:"", role:"barista", hourlyRate:15, phone:"" };

export default function Employees() {
  const toast = useToast();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(null);
  const [form, setForm]           = useState(EMPTY);
  const [saving, setSaving]       = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  const load = () => {
    setLoading(true);
    api.get("/employees").then(r => setEmployees(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd  = () => { setForm(EMPTY); setModal("add"); };
  const openEdit = (emp) => { setForm({ ...emp, password:"" }); setModal(emp); };

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...form };
      if (modal !== "add" && !payload.password) delete payload.password;
      if (modal === "add") {
        await api.post("/employees", payload);
        toast("Employee added");
      } else {
        await api.put(`/employees/${modal._id}`, payload);
        toast("Employee updated");
      }
      load(); setModal(null);
    } catch (err) {
      toast(err.response?.data?.message || "Save failed", "error");
    } finally { setSaving(false); }
  };

  const toggleActive = async (emp) => {
    try {
      const { data } = await api.patch(`/employees/${emp._id}/toggle`);
      setEmployees(es => es.map(e => e._id === emp._id ? { ...e, active: data.active } : e));
      toast(data.active ? "Employee activated" : "Employee deactivated");
    } catch { toast("Failed to update status", "error"); }
  };

  const f = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }));

  const visible = showInactive ? employees : employees.filter(e => e.active);

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <h1 style={{ fontSize:22, fontWeight:700 }}>Employees</h1>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <label style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"var(--muted)", cursor:"pointer" }}>
            <input type="checkbox" checked={showInactive} onChange={e => setShowInactive(e.target.checked)} />
            Show inactive
          </label>
          <button className="btn btn-primary btn-sm" onClick={openAdd}>+ Add Employee</button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(140px,1fr))", gap:12, marginBottom:20 }}>
        {[
          { label:"Total Staff",  value: employees.filter(e => e.active).length },
          { label:"Admins",       value: employees.filter(e => e.role==="admin" && e.active).length },
          { label:"Managers",     value: employees.filter(e => e.role==="manager" && e.active).length },
          { label:"Baristas",     value: employees.filter(e => e.role==="barista" && e.active).length },
        ].map(c => (
          <div key={c.label} className="card" style={{ padding:"14px 16px" }}>
            <div style={{ fontSize:11, color:"var(--muted)", marginBottom:4 }}>{c.label}</div>
            <div style={{ fontSize:26, fontWeight:700 }}>{c.value}</div>
          </div>
        ))}
      </div>

      {loading ? <div style={{ display:"flex",alignItems:"center",gap:10 }}><div className="spinner" /> Loading...</div> : (
        <div className="card" style={{ padding:0, overflow:"hidden" }}>
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Phone</th><th>Rate</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {visible.map(emp => (
                <tr key={emp._id}>
                  <td style={{ fontWeight:500 }}>{emp.name}</td>
                  <td style={{ color:"var(--muted)", fontSize:12 }}>{emp.email}</td>
                  <td><span className={`badge ${ROLE_COLOR[emp.role]}`}>{emp.role}</span></td>
                  <td style={{ color:"var(--muted)", fontSize:12 }}>{emp.phone || "—"}</td>
                  <td style={{ fontSize:12 }}>${emp.hourlyRate}/hr</td>
                  <td>
                    <span className={`badge ${emp.active ? "badge-green" : "badge-red"}`}>
                      {emp.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display:"flex", gap:6 }}>
                      <button onClick={() => openEdit(emp)} className="btn btn-ghost btn-sm">Edit</button>
                      <button onClick={() => toggleActive(emp)} className="btn btn-sm btn-ghost" style={{ color: emp.active ? "var(--danger)" : "var(--success)" }}>
                        {emp.active ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign:"center", color:"var(--muted)", padding:32 }}>No employees found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit modal */}
      {modal !== null && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" style={{ maxWidth:520 }} onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">{modal === "add" ? "Add Employee" : `Edit — ${modal.name}`}</h2>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div className="form-group" style={{ gridColumn:"1/-1" }}>
                <label>Full Name</label>
                <input type="text" value={form.name} onChange={f("name")} placeholder="Jane Smith" />
              </div>
              <div className="form-group" style={{ gridColumn:"1/-1" }}>
                <label>Email</label>
                <input type="email" value={form.email} onChange={f("email")} placeholder="jane@cafe.com" />
              </div>
              <div className="form-group" style={{ gridColumn:"1/-1" }}>
                <label>{modal === "add" ? "Password" : "New Password (leave blank to keep)"}</label>
                <input type="password" value={form.password} onChange={f("password")} placeholder="••••••••" />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={form.role} onChange={f("role")}>
                  <option value="barista">Barista</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>Hourly Rate ($)</label>
                <input type="number" value={form.hourlyRate} onChange={f("hourlyRate")} min={0} step={0.5} />
              </div>
              <div className="form-group" style={{ gridColumn:"1/-1" }}>
                <label>Phone</label>
                <input type="text" value={form.phone} onChange={f("phone")} placeholder="(555) 555-5555" />
              </div>
            </div>
            <div style={{ display:"flex", gap:8, marginTop:4 }}>
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
