import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ADMIN_EMAIL = "Admin69@gmail.com";
const ADMIN_PASSWORD = "BidRush@123";

function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.email === ADMIN_EMAIL && formData.password === ADMIN_PASSWORD) {
      localStorage.setItem("adminAuth", "true");
      navigate("/admin");
    } else {
      setError("Invalid admin credentials.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", position: "relative", overflow: "hidden" }}>
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />

      <div style={{ width: "100%", maxWidth: "400px", position: "relative", zIndex: 1 }}>
        <div className="fade-up" style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            width: "52px", height: "52px", background: "var(--bg-3)",
            border: "1px solid var(--border)", borderRadius: "14px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.5rem", margin: "0 auto 1rem",
          }}>🔐</div>
          <h1 className="serif" style={{ fontSize: "1.8rem", fontWeight: "700", marginBottom: "0.3rem" }}>
            Admin <span style={{ color: "var(--gold)" }}>Panel</span>
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Restricted access only</p>
        </div>

        <div className="glass fade-up stagger-1" style={{ padding: "2.5rem" }}>
          {error && (
            <div className="fade-in" style={{
              background: "rgba(224,85,85,0.1)", border: "1px solid rgba(224,85,85,0.2)",
              color: "var(--red)", padding: "0.75rem 1rem", borderRadius: "10px",
              fontSize: "0.85rem", marginBottom: "1.5rem",
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
                Admin Email
              </label>
              <input type="text" value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required placeholder="Admin69@gmail.com" className="input-dark" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
                Password
              </label>
              <input type="password" value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required placeholder="••••••••" className="input-dark" />
            </div>
            <button type="submit" className="btn-gold" style={{ padding: "0.9rem", fontSize: "0.95rem", marginTop: "0.5rem" }}>
              Access Admin Panel →
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;