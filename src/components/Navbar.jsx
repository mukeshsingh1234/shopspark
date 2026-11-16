import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { CATEGORIES } from "../utils";

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");

  const submit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (cat !== "All") params.set("category", cat);
    const qs = params.toString();
    navigate(qs ? `/products?${qs}` : "/products");
  };

  const firstName = user?.displayName?.split(" ")[0] || "there";

  return (
    <header className="header">
      <div className="topbar">
        <Link to="/" className="logo">
          <span className="logo-mark">S</span>
          ShopSpark
        </Link>

        <form className="search" onSubmit={submit}>
          <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Search category">
            <option value="All">All</option>
            {CATEGORIES.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products"
          />
          <button type="submit" aria-label="Search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
          </button>
        </form>

        <div className="nav-actions">
          <div className="account" tabIndex={0}>
            <span className="small">Hello, {user ? firstName : "sign in"}</span>
            <strong>Account ▾</strong>
            <div className="dropdown">
              {user ? (
                <>
                  <Link to="/orders">My orders</Link>
                  {isAdmin && <Link to="/admin">Seller dashboard</Link>}
                  <button onClick={logout}>Sign out</button>
                </>
              ) : (
                <Link to="/login">Sign in with Google</Link>
              )}
            </div>
          </div>

          <Link to="/orders" className="nav-link">
            <span className="small">Your</span>
            <strong>Orders</strong>
          </Link>

          <Link to="/cart" className="cart-link" aria-label={`Cart, ${count} items`}>
            <span className="cart-icon">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="20" r="1.6" />
                <circle cx="18" cy="20" r="1.6" />
                <path d="M2 3h3l2.7 12.4a1 1 0 0 0 1 .8h9.5a1 1 0 0 0 1-.8L21 7H6" />
              </svg>
              <span key={count} className="cart-count">
                {count}
              </span>
            </span>
            <strong>Cart</strong>
          </Link>
        </div>
      </div>

      <nav className="catbar">
        <Link to="/products">All</Link>
        {CATEGORIES.map((c) => (
          <Link key={c.name} to={`/products?category=${encodeURIComponent(c.name)}`}>
            {c.name}
          </Link>
        ))}
      </nav>
    </header>
  );
}