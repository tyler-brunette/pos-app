import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DEMO_ACCOUNTS = [
  { role: "Admin",   email: "admin@cafe.com",   password: "admin123"   },
  { role: "Manager", email: "sara@cafe.com",     password: "manager123" },
  { role: "Barista", email: "jake@cafe.com",     password: "barista123" },
];

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]   = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) { navigate("/dashboard"); return null; }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const u = await login(form.email, form.password);
      navigate(u.role === "barista" ? "/pos" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally { setLoading(false); }
  };

  const fillDemo = (account) => {
    setForm({ email: account.email, password: account.password });
    setError("");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>☕</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5 }}>Brew POS</h1>
          <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 6 }}>Sign in to your account</p>
        </div>

        {/* Demo accounts */}
        <div style={{ background: "rgba(108,143,255,0.06)", border: "1px solid rgba(108,143,255,0.2)", borderRadius: 10, padding: "14px 16px", marginBottom: 20 }}>
          <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>Demo Accounts</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {DEMO_ACCOUNTS.map(a => (
              <button key={a.role} onClick={() => fillDemo(a)} style={{
                fontSize: 12, padding: "6px 12px", borderRadius: 6,
                background: "var(--surface2)", border: "1px solid var(--border)",
                color: "var(--text)", cursor: "pointer", transition: "all 0.15s",
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
              >
                {a.role}
              </button>
            ))}
          </div>
        </div>

        {/* Login form */}
        <div className="card">
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "var(--danger)", marginBottom: 16 }}>
                {error}
              </div>
            )}
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@cafe.com" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 4 }} disabled={loading}>
              {loading ? <><span className="spinner" /> Signing in...</> : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
