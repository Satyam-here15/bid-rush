import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/axios";

function Dashboard() {
  const [activeTab, setActiveTab] = useState("bids");
  const [myBids, setMyBids] = useState([]);
  const [myAuctions, setMyAuctions] = useState([]);
  const [myTransactions, setMyTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [bidsRes, auctionsRes] = await Promise.all([
          api.get("/api/bids/my-bids"),
          api.get("/api/auctions/my"),
        ]);
        setMyBids(bidsRes.data.bids || []);
        setMyAuctions(auctionsRes.data.auctions || []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const tabs = [
    { key: "bids", label: "My Bids", icon: "⚡", count: myBids.length },
    { key: "auctions", label: "My Auctions", icon: "🏷️", count: myAuctions.length },
    { key: "transactions", label: "Transactions", icon: "💳", count: myTransactions.length },
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
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>Loading dashboard</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", position: "relative" }}>
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "3rem 1.5rem", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div className="fade-up" style={{ marginBottom: "2.5rem" }}>
          <p style={{ color: "var(--gold)", fontSize: "0.75rem", fontWeight: "600", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.6rem" }}>
            Your Space
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
            <div style={{
              width: "52px", height: "52px", borderRadius: "50%",
              background: "linear-gradient(135deg, var(--gold), var(--gold-light))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.4rem", fontFamily: "Playfair Display, serif",
              fontWeight: "900", color: "#1a1000",
              boxShadow: "0 4px 20px rgba(212,168,67,0.3)",
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="serif" style={{ fontSize: "2rem", fontWeight: "900" }}>{user?.name}</h1>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="fade-up stagger-1" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
          {[
            { label: "Total Bids", value: myBids.length, icon: "⚡" },
            { label: "My Auctions", value: myAuctions.length, icon: "🏷️" },
            { label: "Active", value: myAuctions.filter((a) => a.status === "active").length, icon: "🔴", gold: true },
          ].map(({ label, value, icon, gold }) => (
            <div key={label} className="stat-card">
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.8rem" }}>
                <span style={{ fontSize: "1.2rem" }}>{icon}</span>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
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

        {/* Bids tab */}
        {activeTab === "bids" && (
          <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            {myBids.length === 0 ? (
              <div className="glass" style={{ padding: "4rem", textAlign: "center" }}>
                <p style={{ fontSize: "2.5rem", marginBottom: "0.8rem" }}>⚡</p>
                <p className="serif" style={{ fontSize: "1.2rem", marginBottom: "0.4rem" }}>No bids yet</p>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>Browse auctions and start bidding</p>
                <Link to="/auctions" className="btn-gold" style={{ padding: "0.7rem 1.5rem", textDecoration: "none", fontSize: "0.85rem", display: "inline-block" }}>
                  Browse Auctions →
                </Link>
              </div>
            ) : myBids.map((bid, i) => (
              <div key={i} className="glass glass-hover" style={{ padding: "1.2rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "10px",
                    background: "var(--gold-dim)", border: "1px solid var(--gold-border)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem",
                  }}>⚡</div>
                  <div>
                    <p style={{ fontWeight: "600", fontSize: "0.9rem", marginBottom: "3px" }}>{bid.auctionTitle || "Auction"}</p>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {new Date(bid.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: "1rem" }}>
                  <p className="price-display serif" style={{ fontSize: "1.1rem" }}>₹{bid.amount?.toLocaleString()}</p>
                  <Link to={`/auctions/${bid.auctionId}`}
                    style={{ color: "var(--gold)", fontSize: "0.8rem", textDecoration: "none", fontWeight: "600" }}>
                    View →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Auctions tab */}
        {activeTab === "auctions" && (
          <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            {myAuctions.length === 0 ? (
              <div className="glass" style={{ padding: "4rem", textAlign: "center" }}>
                <p style={{ fontSize: "2.5rem", marginBottom: "0.8rem" }}>🏷️</p>
                <p className="serif" style={{ fontSize: "1.2rem", marginBottom: "0.4rem" }}>No auctions yet</p>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>List your first item for bidding</p>
                <Link to="/create-auction" className="btn-gold" style={{ padding: "0.7rem 1.5rem", textDecoration: "none", fontSize: "0.85rem", display: "inline-block" }}>
                  Create Auction →
                </Link>
              </div>
            ) : myAuctions.map((auction, i) => (
              <div key={i} className="glass glass-hover" style={{ padding: "1.2rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "10px",
                    background: "var(--bg-3)", border: "1px solid var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem",
                  }}>🏷️</div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "3px" }}>
                      <p style={{ fontWeight: "600", fontSize: "0.9rem" }}>{auction.title}</p>
                      {getBadge(auction.status)}
                    </div>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      Ends: {new Date(auction.endTime).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: "1rem" }}>
                  <p className="price-display serif" style={{ fontSize: "1.1rem" }}>
                    ₹{(auction.currentBid || auction.startPrice)?.toLocaleString()}
                  </p>
                  <Link to={`/auctions/${auction._id}`}
                    style={{ color: "var(--gold)", fontSize: "0.8rem", textDecoration: "none", fontWeight: "600" }}>
                    View →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Transactions tab */}
        {activeTab === "transactions" && (
          <div className="fade-in">
            {myTransactions.length === 0 ? (
              <div className="glass" style={{ padding: "4rem", textAlign: "center" }}>
                <p style={{ fontSize: "2.5rem", marginBottom: "0.8rem" }}>💳</p>
                <p className="serif" style={{ fontSize: "1.2rem", marginBottom: "0.4rem" }}>No transactions yet</p>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Completed auctions will appear here</p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;