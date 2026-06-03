import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";

const CATEGORIES = ["Electronics", "Fashion", "Antiques", "Vehicles", "Collectibles", "Other"];
const CATEGORY_ICONS = { Electronics: "💻", Fashion: "👗", Antiques: "🏺", Vehicles: "🚗", Collectibles: "🎖️", Other: "📦" };

function CreateAuction() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: "", description: "", startPrice: "", category: "", endTime: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/api/auctions", { ...formData, startTime: new Date().toISOString() });
      navigate("/auctions");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create auction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", position: "relative", overflow: "hidden" }}>
      <div className="bg-glow bg-glow-1" />
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "3rem 1.5rem", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div className="fade-up" style={{ marginBottom: "2.5rem" }}>
          <p style={{ color: "var(--gold)", fontSize: "0.75rem", fontWeight: "600", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.6rem" }}>
            New Listing
          </p>
          <h1 className="serif" style={{ fontSize: "2.5rem", fontWeight: "900", marginBottom: "0.5rem" }}>
            Create an Auction
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.92rem" }}>
            List your item and let competitive bidding determine its value
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

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            <div>
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.6rem" }}>
                Auction Title
              </label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required
                placeholder="e.g. Vintage Rolex Watch" className="input-dark" />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.6rem" }}>
                Description
              </label>
              <textarea name="description" value={formData.description} onChange={handleChange} required rows={4}
                placeholder="Describe your item in detail — condition, history, specifications..."
                className="input-dark" style={{ resize: "vertical", minHeight: "110px" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.72rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.6rem" }}>
                  Starting Price (₹)
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--gold)", fontWeight: "700" }}>₹</span>
                  <input type="number" name="startPrice" value={formData.startPrice} onChange={handleChange} required min="1"
                    placeholder="500" className="input-dark" style={{ paddingLeft: "2rem" }} />
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.72rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.6rem" }}>
                  End Time
                </label>
                <input type="datetime-local" name="endTime" value={formData.endTime} onChange={handleChange} required
                  className="input-dark" />
              </div>
            </div>

            {/* Category picker */}
            <div>
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.8rem" }}>
                Category
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.6rem" }}>
                {CATEGORIES.map((cat) => (
                  <button key={cat} type="button" onClick={() => setFormData({ ...formData, category: cat })}
                    style={{
                      padding: "0.75rem 0.5rem", borderRadius: "12px", cursor: "pointer",
                      background: formData.category === cat ? "var(--gold-dim)" : "var(--bg-3)",
                      border: `1px solid ${formData.category === cat ? "var(--gold-border)" : "var(--border)"}`,
                      color: formData.category === cat ? "var(--gold-light)" : "var(--text-muted)",
                      fontSize: "0.82rem", fontWeight: "600", transition: "all 0.2s ease",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
                      fontFamily: "Outfit, sans-serif",
                    }}>
                    <span style={{ fontSize: "1.3rem" }}>{CATEGORY_ICONS[cat]}</span>
                    <span>{cat}</span>
                  </button>
                ))}
              </div>
            </div>

            <hr className="gold-line" />

            <button type="submit" disabled={loading} className="btn-gold"
              style={{ padding: "1rem", fontSize: "1rem" }}>
              {loading ? "Creating Auction..." : "🚀 Launch Auction"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateAuction;