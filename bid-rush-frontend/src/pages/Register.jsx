import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/axios";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", password: "", phone: "", city: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/api/auth/register", formData);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", position: "relative", overflow: "hidden" }}>
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />

      <div style={{ width: "100%", maxWidth: "520px", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div className="fade-up" style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            width: "52px", height: "52px",
            background: "linear-gradient(135deg, #c9973a, #f0c866)",
            borderRadius: "14px", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "1.5rem",
            fontFamily: "Playfair Display, serif", fontWeight: "900",
            color: "#1a1000", margin: "0 auto 1.2rem",
            boxShadow: "0 8px 24px rgba(212,168,67,0.3)",
          }}>B</div>
          <h1 className="serif" style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "0.4rem" }}>
            Join <span style={{ color: "var(--gold)" }}>BidRush</span>
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Create your account and start bidding in minutes
          </p>
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
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Rahul Sharma" className="input-dark" />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="you@example.com" className="input-dark" />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" className="input-dark" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.72rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>Phone</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="9876543210" className="input-dark" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.72rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>City</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} required placeholder="Mumbai" className="input-dark" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-gold"
              style={{ padding: "0.9rem", fontSize: "0.95rem", marginTop: "0.5rem", width: "100%" }}>
              {loading ? "Creating Account..." : "Create Account →"}
            </button>
          </form>

          <hr className="gold-line" style={{ margin: "1.8rem 0" }} />

          <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--gold-light)", fontWeight: "600", textDecoration: "none" }}>
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;