import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/axios";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/api/auth/login", formData);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/auctions");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", position: "relative", overflow: "hidden" }}>
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />

      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between" style={{
        width: "480px", height: "580px", padding: "3rem",
        background: "linear-gradient(135deg, var(--bg-3), var(--bg-4))",
        border: "1px solid var(--gold-border)", borderRadius: "24px",
        marginRight: "2rem", position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "-60px", right: "-60px",
          width: "300px", height: "300px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212,168,67,0.1), transparent 70%)",
        }} />
        <div>
          <div style={{
            width: "48px", height: "48px",
            background: "linear-gradient(135deg, #c9973a, #f0c866)",
            borderRadius: "14px", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "1.4rem",
            fontFamily: "Playfair Display, serif", fontWeight: "900",
            color: "#1a1000", marginBottom: "2rem",
            boxShadow: "0 8px 24px rgba(212,168,67,0.3)",
          }}>B</div>
          <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "2.5rem", fontWeight: "700", lineHeight: 1.2, marginBottom: "1rem" }}>
            The Premier<br /><span style={{ color: "var(--gold)" }}>Auction</span><br />Platform
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.7 }}>
            Real-time bidding. Live updates. Transparent transactions. Built for the modern bidder.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[
            { icon: "⚡", label: "Real-time bidding with WebSockets" },
            { icon: "🔒", label: "Secure JWT authentication" },
            { icon: "📊", label: "Live bid feed & history" },
            { icon: "🏆", label: "Instant winner notification" },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-3">
              <span style={{ fontSize: "1.1rem" }}>{icon}</span>
              <span style={{ color: "var(--text-mid)", fontSize: "0.85rem" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="glass fade-up" style={{ width: "100%", maxWidth: "420px", padding: "2.5rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <p style={{ color: "var(--gold)", fontSize: "0.75rem", fontWeight: "600", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            Welcome back
          </p>
          <h2 className="serif" style={{ fontSize: "1.8rem", fontWeight: "700", marginBottom: "0.4rem" }}>
            Sign in to BidRush
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
            Enter your credentials to continue bidding
          </p>
        </div>

        {error && (
          <div className="fade-in" style={{
            background: "rgba(224,85,85,0.1)", border: "1px solid rgba(224,85,85,0.2)",
            color: "var(--red)", padding: "0.75rem 1rem", borderRadius: "10px",
            fontSize: "0.85rem", marginBottom: "1.5rem",
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          {[
            { name: "email", type: "email", label: "Email Address", placeholder: "you@example.com" },
            { name: "password", type: "password", label: "Password", placeholder: "••••••••" },
          ].map(({ name, type, label, placeholder }) => (
            <div key={name}>
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
                {label}
              </label>
              <input
                type={type} name={name}
                value={formData[name]}
                onChange={handleChange}
                required placeholder={placeholder}
                className="input-dark"
              />
            </div>
          ))}

          <button type="submit" disabled={loading} className="btn-gold"
            style={{ padding: "0.9rem", fontSize: "0.95rem", marginTop: "0.5rem", width: "100%" }}>
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        <hr className="gold-line" style={{ margin: "1.8rem 0" }} />

        <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
          New to BidRush?{" "}
          <Link to="/register" style={{ color: "var(--gold-light)", fontWeight: "600", textDecoration: "none" }}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;