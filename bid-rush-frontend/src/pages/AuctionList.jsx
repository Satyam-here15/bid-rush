import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/axios";
import socket from "../utils/socket";

const CATEGORY_ICONS = {
  Electronics: "💻", Fashion: "👗", Antiques: "🏺",
  Vehicles: "🚗", Collectibles: "🎖️", Other: "📦",
};

function AuctionList() {
  const [auctions, setAuctions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/api/auctions")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.auctions || [];
        setAuctions(data);
        setFiltered(data);
        setLoading(false);
      })
      .catch(() => { setError("Failed to load auctions."); setLoading(false); });
  }, []);

  useEffect(() => {
    if (auctions.length === 0) return;
    socket.connect();
    auctions.forEach((a) => { if (a.status === "active") socket.emit("join_auction", a._id); });
    socket.on("new_bid", (bidData) => {
      setAuctions((prev) => prev.map((a) =>
        a._id === bidData.auctionId ? { ...a, currentBid: bidData.amount } : a
      ));
    });
    return () => { socket.off("new_bid"); socket.disconnect(); };
  }, [auctions.length]);

  useEffect(() => {
    let result = Array.isArray(auctions) ? auctions : [];
    if (search) result = result.filter((a) => a.title.toLowerCase().includes(search.toLowerCase()));
    if (status !== "all") result = result.filter((a) => a.status === status);
    setFiltered(result);
  }, [search, status, auctions]);

  const getBadge = (s) => {
    if (s === "active") return <span className="badge badge-active">● Live</span>;
    if (s === "ended") return <span className="badge badge-ended">Ended</span>;
    return <span className="badge badge-upcoming">Upcoming</span>;
  };

  const getTimeLeft = (endTime) => {
    const diff = new Date(endTime) - new Date();
    if (diff <= 0) return "Ended";
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (h > 24) return `${Math.floor(h / 24)}d left`;
    if (h > 0) return `${h}h ${m}m left`;
    return `${m}m left`;
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div className="spinner" style={{ margin: "0 auto 1rem" }} />
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>Loading auctions</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "var(--red)" }}>{error}</p>
    </div>
  );

  const activeCount = auctions.filter((a) => a.status === "active").length;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", position: "relative" }}>
      <div className="bg-glow bg-glow-1" />

      {/* Live ticker */}
      {activeCount > 0 && (
        <div style={{
          background: "linear-gradient(90deg, var(--bg-3), var(--bg-4), var(--bg-3))",
          borderBottom: "1px solid var(--gold-border)",
          padding: "10px 0", overflow: "hidden",
        }}>
          <div className="marquee-track" style={{ gap: "4rem" }}>
            {[...Array(6)].map((_, i) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: "2rem", color: "var(--text-muted)", fontSize: "0.78rem", letterSpacing: "0.06em" }}>
                <span><span className="live-dot" style={{ marginRight: "6px" }} />LIVE BIDDING ACTIVE</span>
                <span style={{ color: "var(--gold)", opacity: 0.4 }}>◆</span>
                <span>{activeCount} ACTIVE AUCTION{activeCount !== 1 ? "S" : ""}</span>
                <span style={{ color: "var(--gold)", opacity: 0.4 }}>◆</span>
                <span>REAL-TIME UPDATES</span>
                <span style={{ color: "var(--gold)", opacity: 0.4 }}>◆</span>
                <span>SECURE BIDDING PLATFORM</span>
                <span style={{ color: "var(--gold)", opacity: 0.4 }}>◆</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "3rem 1.5rem", position: "relative", zIndex: 1 }}>

        {/* Hero header */}
        <div className="fade-up" style={{ marginBottom: "3rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
            <span className="live-dot" />
            <span style={{ color: "var(--green)", fontSize: "0.72rem", fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Live Auctions
            </span>
          </div>
          <h1 className="serif" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: "900", lineHeight: 1.1, marginBottom: "1rem" }}>
            Discover & Bid on<br />
            <span className="text-gold-shimmer">Exclusive Items</span>
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1rem", maxWidth: "500px", lineHeight: 1.7 }}>
            Real-time competitive bidding on curated items. Place your bid, win the auction.
          </p>
        </div>

        {/* Stats row */}
        <div className="fade-up stagger-1" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2.5rem", maxWidth: "480px" }}>
          {[
            { label: "Total", value: auctions.length },
            { label: "Live", value: activeCount, gold: true },
            { label: "Ended", value: auctions.filter((a) => a.status === "ended").length },
          ].map(({ label, value, gold }) => (
            <div key={label} className="stat-card" style={{ textAlign: "center", padding: "1rem" }}>
              <p style={{ fontSize: "1.6rem", fontFamily: "Playfair Display, serif", fontWeight: "700", color: gold ? "var(--gold-light)" : "var(--text)" }}>{value}</p>
              <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "2px" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="fade-up stagger-2" style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "240px", position: "relative" }}>
            <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "0.9rem" }}>🔍</span>
            <input
              type="text" placeholder="Search auctions..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="input-dark" style={{ paddingLeft: "2.5rem" }}
            />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)}
            className="input-dark" style={{ width: "160px", flex: "none" }}>
            <option value="all">All Status</option>
            <option value="active">Live Now</option>
            <option value="upcoming">Upcoming</option>
            <option value="ended">Ended</option>
          </select>
        </div>

        {/* Count */}
        {filtered.length > 0 && (
          <p className="fade-in" style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "1.5rem", letterSpacing: "0.05em" }}>
            Showing <span style={{ color: "var(--gold)" }}>{filtered.length}</span> auction{filtered.length !== 1 ? "s" : ""}
          </p>
        )}

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "6rem 0" }}>
            <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</p>
            <p className="serif" style={{ fontSize: "1.5rem", color: "var(--text-muted)" }}>No auctions found</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
            {filtered.map((auction, i) => (
              <div key={auction._id} className={`glass glass-hover fade-up`}
                style={{ padding: "1.8rem", animationDelay: `${i * 60}ms`, opacity: 0 }}>

                {/* Card header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.2rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                    <div className="auction-icon">
                      {CATEGORY_ICONS[auction.category] || "📦"}
                    </div>
                    <div>
                      <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "2px" }}>
                        {auction.category || "General"}
                      </p>
                      {getBadge(auction.status)}
                    </div>
                  </div>
                  {auction.status === "active" && (
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", background: "var(--bg-3)", padding: "4px 10px", borderRadius: "99px", border: "1px solid var(--border)" }}>
                      {getTimeLeft(auction.endTime)}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="serif" style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "0.5rem", lineHeight: 1.3 }}>
                  {auction.title}
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.5rem", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {auction.description}
                </p>

                {/* Price row */}
                <div style={{ background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: "12px", padding: "1rem", marginBottom: "1.2rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Start Price</p>
                      <p style={{ fontSize: "0.95rem", fontWeight: "600", color: "var(--text-mid)" }}>₹{auction.startPrice?.toLocaleString()}</p>
                    </div>
                    <div style={{ width: "1px", height: "36px", background: "var(--border)" }} />
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: "0.7rem", color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Current Bid</p>
                      <p className="price-display" style={{ fontSize: "1.1rem", fontWeight: "700" }}>
                        ₹{(auction.currentBid || auction.startPrice)?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <Link to={`/auctions/${auction._id}`} className="btn-gold"
                  style={{ display: "block", textAlign: "center", padding: "0.75rem", fontSize: "0.88rem", textDecoration: "none", borderRadius: "12px" }}>
                  {auction.status === "active" ? "Place Bid →" : auction.status === "upcoming" ? "View Details →" : "View Results →"}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AuctionList;