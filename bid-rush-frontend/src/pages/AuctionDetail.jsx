import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../utils/axios";
import socket from "../utils/socket";

function BidGraph({ bids, startPrice }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || bids.length === 0) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const sorted = [...bids].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const prices = [startPrice, ...sorted.map((b) => b.amount)];
    const minP = Math.min(...prices) * 0.95;
    const maxP = Math.max(...prices) * 1.05;
    const pad = { top: 20, right: 20, bottom: 30, left: 55 };
    const gW = W - pad.left - pad.right;
    const gH = H - pad.top - pad.bottom;

    const xPos = (i) => pad.left + (i / (prices.length - 1)) * gW;
    const yPos = (v) => pad.top + gH - ((v - minP) / (maxP - minP)) * gH;

    // Grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (i / 4) * gH;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
      const val = maxP - (i / 4) * (maxP - minP);
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.font = "10px Outfit";
      ctx.fillText("₹" + Math.round(val).toLocaleString(), 2, y + 4);
    }

    // Gradient fill
    const grad = ctx.createLinearGradient(0, pad.top, 0, H - pad.bottom);
    grad.addColorStop(0, "rgba(212,168,67,0.3)");
    grad.addColorStop(1, "rgba(212,168,67,0)");
    ctx.beginPath();
    ctx.moveTo(xPos(0), yPos(prices[0]));
    prices.forEach((p, i) => { if (i > 0) ctx.lineTo(xPos(i), yPos(p)); });
    ctx.lineTo(xPos(prices.length - 1), H - pad.bottom);
    ctx.lineTo(xPos(0), H - pad.bottom);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.strokeStyle = "#d4a843";
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.moveTo(xPos(0), yPos(prices[0]));
    prices.forEach((p, i) => { if (i > 0) ctx.lineTo(xPos(i), yPos(p)); });
    ctx.stroke();

    // Dots
    prices.forEach((p, i) => {
      ctx.beginPath();
      ctx.arc(xPos(i), yPos(p), i === prices.length - 1 ? 5 : 3, 0, Math.PI * 2);
      ctx.fillStyle = i === prices.length - 1 ? "#f0c866" : "#d4a843";
      ctx.fill();
      if (i === prices.length - 1) {
        ctx.strokeStyle = "rgba(212,168,67,0.4)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(xPos(i), yPos(p), 8, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
  }, [bids, startPrice]);

  if (bids.length === 0) return (
    <div style={{ textAlign: "center", padding: "2rem 0", color: "var(--text-muted)", fontSize: "0.85rem" }}>
      📊 Chart will appear when first bid is placed
    </div>
  );

  return (
    <canvas ref={canvasRef} width={560} height={180}
      style={{ width: "100%", height: "180px", display: "block" }} />
  );
}

function AuctionDetail() {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [bidLoading, setBidLoading] = useState(false);
  const [error, setError] = useState("");
  const [bidError, setBidError] = useState("");
  const [bidSuccess, setBidSuccess] = useState("");
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0, ended: false });
  const [contactCard, setContactCard] = useState(null);
  const [currentBid, setCurrentBid] = useState(null); // ← separate live state
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    api.get(`/api/auctions/${id}`)
      .then(async (res) => {
        const a = res.data.auction;
        setAuction(a);
        setCurrentBid(a.currentBid || a.startPrice);
        setLoading(false);

        if (a.status === "ended" && a.winner) {
          try {
            const [winnerRes, sellerRes] = await Promise.all([
              api.get(`/api/auth/user/${a.winner}`),
              api.get(`/api/auth/user/${a.createdBy}`),
            ]);
            const isWinner = user && String(user.id) === String(a.winner);
            const isSeller = user && String(user.id) === String(a.createdBy);
            if (isWinner) {
              setContactCard({ type: "winner", item: a.title, price: a.currentBid, contact: sellerRes.data });
            } else if (isSeller) {
              setContactCard({ type: "seller", item: a.title, price: a.currentBid, contact: winnerRes.data });
            }
          } catch (e) {}
        }
      })
      .catch(() => { setError("Failed to load auction."); setLoading(false); });

    api.get(`/api/bids/auction/${id}`)
      .then((res) => setBids(res.data.bids || []))
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!auction) return;
    const interval = setInterval(() => {
      const diff = new Date(auction.endTime) - new Date();
      if (diff <= 0) { setTimeLeft({ h: 0, m: 0, s: 0, ended: true }); clearInterval(interval); return; }
      setTimeLeft({
        h: Math.floor(diff / (1000 * 60 * 60)),
        m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((diff % (1000 * 60)) / 1000),
        ended: false,
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [auction]);

  useEffect(() => {
    if (!socket.connected) socket.connect();
    socket.emit("join_auction", id);
    socket.on("reconnect", () => socket.emit("join_auction", id));

    socket.on("new_bid", (bidData) => {
      setBids((prev) => [bidData, ...prev]);
      setCurrentBid(bidData.amount); // ← instant live update
      setAuction((prev) => prev ? { ...prev, currentBid: bidData.amount } : prev);
    });

    socket.on("outbid_alert", (data) => {
      if (user && data.targetUserId === user.id)
        setBidError("⚡ You've been outbid! Place a higher bid.");
    });

    socket.on("auction_won", async (data) => {
      try {
        const sellerRes = await api.get(`/api/auth/user/${data.sellerId || auction?.createdBy}`);
        setContactCard({ type: "winner", item: data.auctionTitle, price: data.finalPrice, contact: sellerRes.data });
      } catch {
        setContactCard({ type: "winner", item: data.auctionTitle, price: data.finalPrice, contact: data.sellerInfo });
      }
      setAuction((prev) => prev ? { ...prev, status: "ended" } : prev);
    });

    socket.on("auction_sold", async (data) => {
      try {
        const winnerRes = await api.get(`/api/auth/user/${data.winnerId || auction?.winner}`);
        setContactCard({ type: "seller", item: data.auctionTitle, price: data.finalPrice, contact: winnerRes.data });
      } catch {
        setContactCard({ type: "seller", item: data.auctionTitle, price: data.finalPrice, contact: data.winnerInfo });
      }
      setAuction((prev) => prev ? { ...prev, status: "ended" } : prev);
    });

    return () => {
      socket.off("reconnect"); socket.off("new_bid"); socket.off("outbid_alert");
      socket.off("auction_won"); socket.off("auction_sold");
      socket.emit("leave_auction", id);
    };
  }, [id, auction]);

  const handleBid = async () => {
    setBidError(""); setBidSuccess("");
    if (!bidAmount || isNaN(bidAmount)) { setBidError("Enter a valid amount."); return; }
    setBidLoading(true);
    try {
      await api.post("/api/bids/place", { auctionId: id, amount: Number(bidAmount) });
      setBidSuccess("🎉 Bid placed successfully!");
      setBidAmount("");
      setTimeout(() => setBidSuccess(""), 4000);
    } catch (err) {
      setBidError(err.response?.data?.message || "Failed to place bid.");
    } finally {
      setBidLoading(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div className="spinner" style={{ margin: "0 auto 1rem" }} />
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>Loading auction</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "var(--red)" }}>{error}</p>
    </div>
  );

  const isActive = auction.status === "active";
  const isOwner = user && String(user.id) === String(auction.createdBy);
  const livePrice = currentBid || auction.startPrice;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", position: "relative" }}>
      <div className="bg-glow bg-glow-1" />

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2.5rem 1.5rem", position: "relative", zIndex: 1 }}>

        <Link to="/auctions" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "var(--text-muted)", textDecoration: "none", fontSize: "0.85rem", marginBottom: "2rem", transition: "color 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--gold)"}
          onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>
          ← Back to Auctions
        </Link>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "2rem", alignItems: "start" }}>

          {/* LEFT */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {/* Main info */}
            <div className="glass fade-up" style={{ padding: "2rem" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.7rem" }}>
                    {isActive && <span className="live-dot" />}
                    <span className={`badge ${isActive ? "badge-active" : auction.status === "ended" ? "badge-ended" : "badge-upcoming"}`}>
                      {isActive ? "Live Auction" : auction.status}
                    </span>
                    {auction.category && (
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", background: "var(--bg-3)", padding: "3px 10px", borderRadius: "99px", border: "1px solid var(--border)" }}>
                        {auction.category}
                      </span>
                    )}
                  </div>
                  <h1 className="serif" style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: "900", lineHeight: 1.2 }}>
                    {auction.title}
                  </h1>
                </div>
              </div>

              <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", lineHeight: 1.75, marginBottom: "2rem" }}>
                {auction.description}
              </p>

              {/* Price cards — live updated */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: "14px", padding: "1.2rem" }}>
                  <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>Starting Price</p>
                  <p className="serif" style={{ fontSize: "1.5rem", fontWeight: "700" }}>₹{auction.startPrice?.toLocaleString()}</p>
                </div>
                <div style={{ background: "linear-gradient(135deg, rgba(212,168,67,0.08), rgba(212,168,67,0.04))", border: "1px solid var(--gold-border)", borderRadius: "14px", padding: "1.2rem", transition: "all 0.4s ease" }}>
                  <p style={{ fontSize: "0.7rem", color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
                    {isActive && <span className="live-dot" style={{ marginRight: "5px", width: "6px", height: "6px" }} />}
                    Current Bid
                  </p>
                  <p className="price-display serif" style={{ fontSize: "1.5rem", fontWeight: "700", transition: "all 0.3s ease" }}>
                    ₹{livePrice?.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Timer */}
              {!timeLeft.ended ? (
                <div style={{ background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: "14px", padding: "1.2rem" }}>
                  <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1rem", textAlign: "center" }}>
                    ⏱ Time Remaining
                  </p>
                  <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
                    {[{ val: timeLeft.h, label: "Hours" }, { val: timeLeft.m, label: "Min" }, { val: timeLeft.s, label: "Sec" }].map(({ val, label }) => (
                      <div key={label} className="timer-block">
                        <p className="serif" style={{ fontSize: "1.8rem", fontWeight: "700", color: "var(--gold-light)", lineHeight: 1 }}>
                          {String(val).padStart(2, "0")}
                        </p>
                        <p style={{ fontSize: "0.62rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "4px" }}>{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ background: "rgba(224,85,85,0.08)", border: "1px solid rgba(224,85,85,0.2)", borderRadius: "14px", padding: "1rem", textAlign: "center" }}>
                  <p style={{ color: "var(--red)", fontWeight: "600" }}>This auction has ended</p>
                </div>
              )}
            </div>

            {/* 📊 Live Bid Graph */}
            <div className="glass fade-up stagger-1" style={{ padding: "2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.5rem" }}>
                <span style={{ fontSize: "1.1rem" }}>📊</span>
                <h2 className="serif" style={{ fontSize: "1.1rem", fontWeight: "700" }}>Price History</h2>
                {bids.length > 0 && (
                  <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "var(--gold)", fontWeight: "600" }}>
                    +{((livePrice - auction.startPrice) / auction.startPrice * 100).toFixed(1)}% from start
                  </span>
                )}
              </div>
              <BidGraph bids={bids} startPrice={auction.startPrice} />
            </div>

            {/* Live bid feed */}
            <div className="glass fade-up stagger-2" style={{ padding: "2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.5rem" }}>
                {isActive && <span className="live-dot" />}
                <h2 className="serif" style={{ fontSize: "1.2rem", fontWeight: "700" }}>Live Bid Feed</h2>
                <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "var(--text-muted)", background: "var(--bg-3)", padding: "3px 10px", borderRadius: "99px", border: "1px solid var(--border)" }}>
                  {bids.length} bids
                </span>
              </div>

              {bids.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem 0" }}>
                  <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🎯</p>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No bids yet. Be the first!</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {bids.map((bid, i) => (
                    <div key={i} className={i === 0 ? "bid-leader" : ""}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "0.9rem 1rem", borderRadius: "12px",
                        background: i === 0 ? undefined : "var(--bg-3)",
                        border: i !== 0 ? "1px solid var(--border)" : undefined,
                        transition: "all 0.3s ease",
                      }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                        <div style={{
                          width: "32px", height: "32px", borderRadius: "50%",
                          background: i === 0 ? "linear-gradient(135deg, var(--gold), var(--gold-light))" : "var(--bg-4)",
                          border: `1px solid ${i === 0 ? "var(--gold-border)" : "var(--border)"}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "0.75rem", fontWeight: "700",
                          color: i === 0 ? "#1a1000" : "var(--text-muted)",
                        }}>
                          {i === 0 ? "👑" : `#${i + 1}`}
                        </div>
                        <div>
                          <p style={{ fontSize: "0.82rem", fontWeight: "600", color: i === 0 ? "var(--text)" : "var(--text-mid)" }}>
                            {bid.userId?.toString().slice(-6) || "Bidder"}
                          </p>
                          <p style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                            {bid.createdAt ? new Date(bid.createdAt).toLocaleTimeString() : "just now"}
                          </p>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p className={i === 0 ? "price-display" : ""} style={{ fontSize: "1rem", fontWeight: "700", fontFamily: "Playfair Display, serif", color: i === 0 ? "var(--gold-light)" : "var(--text-mid)" }}>
                          ₹{bid.amount?.toLocaleString()}
                        </p>
                        {i === 0 && <p style={{ fontSize: "0.65rem", color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Leading</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", position: "sticky", top: "5rem" }}>

            {/* Place bid */}
            {isActive && user && !isOwner && (
              <div className="glass-gold fade-up scale-in" style={{ padding: "1.8rem" }}>
                <h2 className="serif" style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "0.4rem" }}>Place Your Bid</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: "1.5rem" }}>
                  Minimum: <span style={{ color: "var(--gold)" }}>₹{(livePrice + 1).toLocaleString()}</span>
                </p>

                {bidError && (
                  <div className="fade-in" style={{ background: "rgba(224,85,85,0.1)", border: "1px solid rgba(224,85,85,0.2)", color: "var(--red)", padding: "0.75rem 1rem", borderRadius: "10px", fontSize: "0.82rem", marginBottom: "1rem" }}>
                    {bidError}
                  </div>
                )}
                {bidSuccess && (
                  <div className="fade-in" style={{ background: "rgba(46,204,138,0.1)", border: "1px solid rgba(46,204,138,0.2)", color: "var(--green)", padding: "0.75rem 1rem", borderRadius: "10px", fontSize: "0.82rem", marginBottom: "1rem" }}>
                    {bidSuccess}
                  </div>
                )}

                <div style={{ position: "relative", marginBottom: "1rem" }}>
                  <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--gold)", fontWeight: "700", fontSize: "1rem" }}>₹</span>
                  <input type="number" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)}
                    placeholder={`${livePrice + 1}`} className="input-dark" style={{ paddingLeft: "2rem" }} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem", marginBottom: "1rem" }}>
                  {[100, 500, 1000].map((inc) => (
                    <button key={inc} onClick={() => setBidAmount(String(livePrice + inc))}
                      className="btn-ghost" style={{ padding: "0.5rem", fontSize: "0.78rem" }}>
                      +₹{inc}
                    </button>
                  ))}
                </div>

                <button onClick={handleBid} disabled={bidLoading} className="btn-gold"
                  style={{ width: "100%", padding: "0.9rem", fontSize: "0.95rem" }}>
                  {bidLoading ? "Placing Bid..." : "⚡ Place Bid Now"}
                </button>

                <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", textAlign: "center", marginTop: "1rem", lineHeight: 1.6 }}>
                  By placing a bid you agree to our terms. All bids are final.
                </p>
              </div>
            )}

            {/* Not logged in */}
            {isActive && !user && (
              <div className="glass fade-up" style={{ padding: "1.8rem", textAlign: "center" }}>
                <p style={{ fontSize: "2rem", marginBottom: "0.8rem" }}>🔒</p>
                <h3 className="serif" style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>Login to Bid</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>Create an account to start bidding</p>
                <Link to="/login" className="btn-gold" style={{ display: "block", padding: "0.8rem", textDecoration: "none", fontSize: "0.9rem" }}>Sign In →</Link>
              </div>
            )}

            {/* Owner card */}
            {isOwner && isActive && (
              <div className="glass fade-up" style={{ padding: "1.8rem", textAlign: "center" }}>
                <p style={{ fontSize: "2rem", marginBottom: "0.8rem" }}>🏷️</p>
                <h3 className="serif" style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>Your Auction</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>You listed this item. Bidders can place bids.</p>
                <div style={{ marginTop: "1rem", padding: "0.8rem", background: "var(--bg-3)", borderRadius: "10px", border: "1px solid var(--border)" }}>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Current highest bid</p>
                  <p className="price-display serif" style={{ fontSize: "1.4rem" }}>₹{livePrice?.toLocaleString()}</p>
                </div>
              </div>
            )}

            {/* Auction details */}
            <div className="glass fade-up stagger-3" style={{ padding: "1.8rem" }}>
              <h3 className="serif" style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "1.2rem" }}>Auction Details</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                {[
                  { label: "End Time", value: new Date(auction.endTime).toLocaleString() },
                  { label: "Total Bids", value: bids.length },
                  { label: "Status", value: auction.status },
                  { label: "Start Price", value: "₹" + auction.startPrice?.toLocaleString() },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6rem 0", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{label}</span>
                    <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-mid)" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact card — both winner AND seller */}
            {contactCard && (
              <div className="fade-up" style={{
                background: "linear-gradient(135deg, rgba(212,168,67,0.12), rgba(212,168,67,0.06))",
                border: "1px solid var(--gold-border)", borderRadius: "20px", padding: "1.8rem",
              }}>
                <p style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>
                  {contactCard.type === "winner" ? "🎉" : "💰"}
                </p>
                <h3 className="serif" style={{ fontSize: "1.3rem", color: "var(--gold-light)", marginBottom: "0.3rem" }}>
                  {contactCard.type === "winner" ? "You Won!" : "Auction Sold!"}
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: "0.3rem" }}>
                  Item: <span style={{ color: "var(--text)" }}>{contactCard.item}</span>
                </p>
                <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: "1.2rem" }}>
                  Final Price: <span style={{ color: "var(--gold)", fontWeight: "700" }}>₹{contactCard.price?.toLocaleString()}</span>
                </p>
                <hr className="gold-line" style={{ marginBottom: "1.2rem" }} />
                <p style={{ fontSize: "0.7rem", color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.8rem", fontWeight: "600" }}>
                  {contactCard.type === "winner" ? "📞 Seller Contact Details" : "📞 Winner Contact Details"}
                </p>
                {["name", "email", "phone", "city"].map((k) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0", borderBottom: "1px solid rgba(212,168,67,0.1)" }}>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "capitalize" }}>{k}</span>
                    <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text)" }}>
                      {contactCard.contact?.[k] || "—"}
                    </span>
                  </div>
                ))}
                <div style={{ marginTop: "1rem", padding: "0.8rem", background: "rgba(212,168,67,0.08)", borderRadius: "10px", textAlign: "center" }}>
                  <p style={{ fontSize: "0.78rem", color: "var(--gold-light)" }}>
                    📧 Reach out to complete the transaction
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuctionDetail;