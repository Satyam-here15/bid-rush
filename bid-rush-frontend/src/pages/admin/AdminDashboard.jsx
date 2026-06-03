import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axios";

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("auctions");
  const [auctions, setAuctions] = useState([]);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (localStorage.getItem("adminAuth") !== "true") navigate("/admin/login");
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const auctionsRes = await api.get("/api/auctions");
        const data = Array.isArray(auctionsRes.data) ? auctionsRes.data : auctionsRes.data.auctions || [];
        setAuctions(data);
        const allBids = [];
        for (const auction of data) {
          try {
            const bidsRes = await api.get(`/api/bids/auction/${auction._id}`);
            (bidsRes.data.bids || []).forEach((bid) => allBids.push({ ...bid, auctionTitle: auction.title }));
          } catch (e) {}
        }
        setBids(allBids);
      } catch (err) { console.log(err); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this auction?")) return;
    try {
      await api.delete(`/api/auctions/admin/${id}`, { headers: { "x-admin-secret": "bidrush-admin-secret-2024" } });
      setAuctions((prev) => prev.filter((a) => a._id !== id));
      setBids((prev) => prev.filter((b) => b.auctionId !== id));
    } catch (err) { alert("Failed to delete auction."); }
  };

  const handleLogout = () => { localStorage.removeItem("adminAuth"); navigate("/admin/login"); };

  const tabs = [
    { key: "auctions", label: "Auctions", icon: "🏷️", count: auctions.length },
    { key: "bids", label: "All Bids", icon: "⚡", count: bids.length },
  ];

  const getBadge = (s) => {
    if (s === "active") return <span className="badge badge-active">Live</span>;
    if (s === "ended") return <span className="badge badge-ended">Ended</span>;
    return <span className="badge badge-upcoming">Upcoming</span>;
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div className="spinner" style={{ margin: "0 auto 1rem" }} />
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>Loading admin data</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", position: "relative" }}>
      <div className="bg-glow bg-glow-1" />

      {/* Admin navbar */}
      <div style={{
        background: "rgba(8,8,16,0.9)", borderBottom: "1px solid var(--gold-border)",
        backdropFilter: "blur(20px)", padding: "0 1.5rem",
        display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
          <span style={{ fontSize: "1.2rem" }}>🔐</span>
          <span className="serif" style={{ fontWeight: "700", fontSize: "1.1rem" }}>
            Bid<span style={{ color: "var(--gold)" }}>Rush</span>
            <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontFamily: "Outfit, sans-serif", fontWeight: "400", marginLeft: "0.5rem" }}>Admin</span>
          </span>
        </div>
        <button onClick={handleLogout} className="btn-danger" style={{ padding: "6px 16px", fontSize: "0.82rem" }}>
          Logout
        </button>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2.5rem 1.5rem", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div className="fade-up" style={{ marginBottom: "2rem" }}>
          <p style={{ color: "var(--gold)", fontSize: "0.72rem", fontWeight: "600", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Control Center</p>
          <h1 className="serif" style={{ fontSize: "2.2rem", fontWeight: "900" }}>Admin Dashboard</h1>
        </div>

        {/* Stats */}
        <div className="fade-up stagger-1" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
          {[
            { label: "Total Auctions", value: auctions.length, icon: "🏷️" },
            { label: "Active Now", value: auctions.filter((a) => a.status === "active").length, icon: "🔴", gold: true },
            { label: "Ended", value: auctions.filter((a) => a.status === "ended").length, icon: "✅" },
            { label: "Total Bids", value: bids.length, icon: "⚡" },
          ].map(({ label, value, icon, gold }) => (
            <div key={label} className="stat-card">
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.8rem" }}>
                <span style={{ fontSize: "1.1rem" }}>{icon}</span>
                <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
              </div>
              <p className="serif" style={{ fontSize: "2rem", fontWeight: "700", color: gold ? "var(--gold-light)" : "var(--text)" }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tab-bar fade-up stagger-2" style={{ marginBottom: "1.5rem" }}>
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`tab-btn ${activeTab === tab.key ? "active" : ""}`}>
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span style={{
                fontSize: "0.7rem", padding: "2px 7px", borderRadius: "99px", fontWeight: "700",
                background: activeTab === tab.key ? "var(--gold-dim)" : "var(--bg)",
                color: activeTab === tab.key ? "var(--gold)" : "var(--text-muted)",
                border: `1px solid ${activeTab === tab.key ? "var(--gold-border)" : "var(--border)"}`,
              }}>{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Auctions tab */}
        {activeTab === "auctions" && (
          <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            {auctions.length === 0 ? (
              <div className="glass" style={{ padding: "4rem", textAlign: "center" }}>
                <p style={{ color: "var(--text-muted)" }}>No auctions found.</p>
              </div>
            ) : auctions.map((auction) => (
              <div key={auction._id} className="glass glass-hover" style={{ padding: "1.2rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "4px" }}>
                    <p style={{ fontWeight: "600", fontSize: "0.92rem" }}>{auction.title}</p>
                    {getBadge(auction.status)}
                  </div>
                  <div style={{ display: "flex", gap: "1.5rem" }}>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      Ends: {new Date(auction.endTime).toLocaleString()}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "var(--gold)" }}>
                      ₹{(auction.currentBid || auction.startPrice)?.toLocaleString()}
                    </p>
                  </div>
                </div>
                <button onClick={() => handleDelete(auction._id)} className="btn-danger"
                  style={{ padding: "6px 16px", fontSize: "0.8rem", marginLeft: "1rem" }}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Bids tab */}
        {activeTab === "bids" && (
          <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            {bids.length === 0 ? (
              <div className="glass" style={{ padding: "4rem", textAlign: "center" }}>
                <p style={{ color: "var(--text-muted)" }}>No bids found.</p>
              </div>
            ) : bids.map((bid, i) => (
              <div key={i} className="glass glass-hover" style={{ padding: "1.2rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontWeight: "600", fontSize: "0.9rem", marginBottom: "3px" }}>{bid.auctionTitle}</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Bidder: {bid.userId?.toString().slice(-8) || "—"} · {new Date(bid.createdAt).toLocaleString()}
                  </p>
                </div>
                <p className="price-display serif" style={{ fontSize: "1.1rem" }}>
                  ₹{bid.amount?.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;