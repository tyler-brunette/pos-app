import { useState, useEffect } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const ROLE_COLOR = { admin:"badge-red", manager:"badge-blue", barista:"badge-green" };

function getWeekStart(offset = 0) {
  const d = new Date();
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1 + offset * 7);
  d.setHours(0,0,0,0);
  return d;
}

function weekDates(start) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });
}

export default function Schedule() {
  const { user } = useAuth();
  const toast = useToast();
  const isManager = ["admin","manager"].includes(user?.role);

  const [weekOffset, setWeekOffset] = useState(0);
  const [shifts, setShifts]         = useState([]);
  const [employees, setEmployees]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [modal, setModal]           = useState(null);
  const [form, setForm]             = useState({ employee:"", date:"", startTime:"08:00", endTime:"16:00", notes:"" });
  const [saving, setSaving]         = useState(false);

  const weekStart = getWeekStart(weekOffset);
  const dates     = weekDates(weekStart);

  const load = () => {
    setLoading(true);
    const qs = `?weekStart=${dates[0]}`;
    const calls = [api.get(`/schedule${qs}`)];
    if (isManager) calls.push(api.get("/employees"));
    Promise.all(calls).then(([s, e]) => {
      setShifts(s.data);
      if (e) setEmployees(e.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [weekOffset]);

  const openAdd = (date) => {
    setForm({ employee: employees[0]?._id || "", date, startTime:"08:00", endTime:"16:00", notes:"" });
    setModal("add");
  };

  const saveShift = async () => {
    setSaving(true);
    try {
      if (modal === "add") {
        await api.post("/schedule", form);
        toast("Shift added");
      } else {
        await api.put(`/schedule/${modal._id}`, form);
        toast("Shift updated");
      }
      load(); setModal(null);
    } catch (err) {
      toast(err.response?.data?.message || "Failed to save shift", "error");
    } finally { setSaving(false); }
  };

  const deleteShift = async (id) => {
    if (!confirm("Delete this shift?")) return;
    try { await api.delete(`/schedule/${id}`); load(); toast("Shift removed"); }
    catch { toast("Failed to delete", "error"); }
  };

  const shiftsForDate = (date) => shifts.filter(s => s.date === date);

  const weekLabel = `${new Date(dates[0]).toLocaleDateString("en-US",{month:"short",day:"numeric"})} – ${new Date(dates[6]).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}`;

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <h1 style={{ fontSize:22, fontWeight:700 }}>Schedule</h1>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setWeekOffset(w => w-1)}>‹ Prev</button>
          <span style={{ fontSize:13, fontWeight:500, minWidth:200, textAlign:"center" }}>{weekLabel}</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setWeekOffset(w => w+1)}>Next ›</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setWeekOffset(0)}>Today</button>
        </div>
      </div>

      {loading ? <div style={{ display:"flex",alignItems:"center",gap:10 }}><div className="spinner" /> Loading...</div> : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:8 }}>
          {dates.map((date, i) => {
            const dayShifts = shiftsForDate(date);
            const isToday   = date === new Date().toISOString().split("T")[0];
            return (
              <div key={date} style={{ background:"var(--surface)", border:`1px solid ${isToday ? "var(--accent)" : "var(--border)"}`, borderRadius:10, padding:10, minHeight:160 }}>
                {/* Day header */}
                <div style={{ marginBottom:8 }}>
                  <div style={{ fontSize:11, color:"var(--muted)", fontWeight:600, textTransform:"uppercase", letterSpacing:0.5 }}>{DAYS[i]}</div>
                  <div style={{ fontSize:15, fontWeight:isToday ? 700 : 500, color:isToday ? "var(--accent)" : "var(--text)" }}>
                    {new Date(date+"T12:00:00").getDate()}
                  </div>
                </div>

                {/* Shifts */}
                <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                  {dayShifts.map(shift => (
                    <div key={shift._id} style={{ background:"rgba(108,143,255,0.1)", border:"1px solid rgba(108,143,255,0.2)", borderRadius:6, padding:"5px 7px", fontSize:11 }}>
                      <div style={{ fontWeight:600, marginBottom:1 }}>{shift.employee?.name || "?"}</div>
                      <div style={{ color:"var(--muted)" }}>{shift.startTime} – {shift.endTime}</div>
                      {isManager && (
                        <div style={{ display:"flex", gap:4, marginTop:4 }}>
                          <button onClick={() => { setForm({ employee:shift.employee._id, date:shift.date, startTime:shift.startTime, endTime:shift.endTime, notes:shift.notes||"" }); setModal(shift); }}
                            style={{ fontSize:10, background:"none", border:"none", color:"var(--accent)", cursor:"pointer", padding:0 }}>edit</button>
                          <span style={{ color:"var(--border)" }}>·</span>
                          <button onClick={() => deleteShift(shift._id)}
                            style={{ fontSize:10, background:"none", border:"none", color:"var(--danger)", cursor:"pointer", padding:0 }}>del</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {isManager && (
                  <button onClick={() => openAdd(date)} style={{ marginTop:6, width:"100%", background:"none", border:"1px dashed var(--border)", borderRadius:6, color:"var(--muted)", fontSize:11, padding:"4px 0", cursor:"pointer" }}>
                    + Add
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Shift list below calendar */}
      {!loading && shifts.length > 0 && (
        <div className="card" style={{ marginTop:20, padding:0, overflow:"hidden" }}>
          <div style={{ padding:"12px 16px", borderBottom:"1px solid var(--border)", fontSize:13, fontWeight:600 }}>This Week's Shifts</div>
          <table>
            <thead><tr><th>Employee</th><th>Role</th><th>Date</th><th>Hours</th><th>Notes</th></tr></thead>
            <tbody>
              {shifts.map(s => (
                <tr key={s._id}>
                  <td style={{ fontWeight:500 }}>{s.employee?.name || "—"}</td>
                  <td><span className={`badge ${ROLE_COLOR[s.employee?.role]}`}>{s.employee?.role}</span></td>
                  <td style={{ fontSize:12 }}>{new Date(s.date+"T12:00:00").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}</td>
                  <td style={{ fontSize:12 }}>{s.startTime} – {s.endTime}</td>
                  <td style={{ color:"var(--muted)", fontSize:12 }}>{s.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit modal */}
      {modal !== null && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">{modal === "add" ? "Add Shift" : "Edit Shift"}</h2>
            <div className="form-group">
              <label>Employee</label>
              <select value={form.employee} onChange={e => setForm(f => ({...f, employee:e.target.value}))}>
                {employees.filter(e => e.active).map(e => <option key={e._id} value={e._id}>{e.name} ({e.role})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({...f, date:e.target.value}))} />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div className="form-group">
                <label>Start Time</label>
                <input type="time" value={form.startTime} onChange={e => setForm(f => ({...f, startTime:e.target.value}))} />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input type="time" value={form.endTime} onChange={e => setForm(f => ({...f, endTime:e.target.value}))} />
              </div>
            </div>
            <div className="form-group">
              <label>Notes (optional)</label>
              <input type="text" value={form.notes} onChange={e => setForm(f => ({...f, notes:e.target.value}))} placeholder="e.g. Opening shift" />
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button className="btn btn-primary" onClick={saveShift} disabled={saving} style={{ flex:1, justifyContent:"center" }}>
                {saving ? <><span className="spinner" /> Saving...</> : "Save Shift"}
              </button>
              <button className="btn btn-ghost" onClick={() => setModal(null)} style={{ flex:1, justifyContent:"center" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
