import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      background: "rgba(8,8,16,0.85)",
      borderBottom: "1px solid rgba(212,168,67,0.1)",
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.5rem" }}
        className="flex items-center justify-between h-16">

        {/* Logo */}
        <Link to="/auctions" className="flex items-center gap-3 no-underline">
          <div style={{
            width: "36px", height: "36px",
            background: "linear-gradient(135deg, #c9973a, #f0c866)",
            borderRadius: "10px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "Playfair Display, serif",
            fontWeight: "900", fontSize: "1.1rem", color: "#1a1000",
            boxShadow: "0 4px 16px rgba(212,168,67,0.3)",
          }}>B</div>
          <span style={{ fontFamily: "Playfair Display, serif", fontSize: "1.2rem", fontWeight: "700" }}>
            Bid<span style={{ color: "var(--gold)" }}>Rush</span>
          </span>
        </Link>

        {/* Center links */}
        <div className="hidden md:flex items-center gap-8">
          {[{ path: "/auctions", label: "Auctions" }, ...(user ? [{ path: "/dashboard", label: "Dashboard" }] : [])].map(({ path, label }) => (
            <Link key={path} to={path} style={{
              color: isActive(path) ? "var(--gold-light)" : "var(--text-muted)",
              fontSize: "0.9rem", fontWeight: "500",
              textDecoration: "none",
              borderBottom: isActive(path) ? "1px solid var(--gold)" : "1px solid transparent",
              paddingBottom: "2px",
              transition: "all 0.2s ease",
            }}>{label}</Link>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2" style={{
                background: "var(--bg-3)", border: "1px solid var(--border)",
                borderRadius: "99px", padding: "6px 14px",
              }}>
                <div style={{
                  width: "22px", height: "22px", borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--gold), var(--gold-light))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.65rem", fontWeight: "700", color: "#1a1000",
                }}>
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <span style={{ fontSize: "0.82rem", color: "var(--text-mid)", fontWeight: "500" }}>
                  {user.name}
                </span>
              </div>
              <Link to="/create-auction" className="btn-gold"
                style={{ padding: "8px 18px", fontSize: "0.82rem", borderRadius: "10px", textDecoration: "none" }}>
                + New Auction
              </Link>
              <button onClick={handleLogout} className="btn-ghost"
                style={{ padding: "8px 14px", fontSize: "0.82rem" }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{
                color: "var(--text-muted)", fontSize: "0.88rem",
                textDecoration: "none", fontWeight: "500",
                transition: "color 0.2s",
              }}>Login</Link>
              <Link to="/register" className="btn-gold"
                style={{ padding: "8px 20px", fontSize: "0.85rem", borderRadius: "10px", textDecoration: "none" }}>
                Join Free
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;