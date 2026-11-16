import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils";

const EMPTY = { name: "", phone: "", line1: "", city: "", state: "", pincode: "" };

export default function Checkout() {
  const { user, loading } = useAuth();
  const { items, count, subtotal, delivery, total, clear } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ ...EMPTY });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Pre-fill the name from the Google account
  useEffect(() => {
    if (user?.displayName) {
      setForm((f) => (f.name ? f : { ...f, name: user.displayName }));
    }
  }, [user]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  if (loading) return <div className="splash"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" state={{ from: "/checkout" }} replace />;

  if (items.length === 0) {
    return (
      <div className="container" style={{ marginTop: 30 }}>
        <div className="empty">
          <span className="big">🛒</span>
          <h2>Nothing to check out</h2>
          <p>Your cart is empty.</p>
          <Link to="/products" className="btn-link">Browse products</Link>
        </div>
      </div>
    );
  }

  const placeOrder = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.line1.trim() || !form.city.trim() || !form.state.trim()) {
      return setError("Please fill in all the address fields.");
    }
    if (!/^\d{10}$/.test(form.phone.trim())) return setError("Enter a valid 10 digit phone number.");
    if (!/^\d{6}$/.test(form.pincode.trim())) return setError("Enter a valid 6 digit pincode.");

    setBusy(true);
    try {
      await addDoc(collection(db, "orders"), {
        userId: user.uid,
        userName: user.displayName || "",
        userEmail: user.email || "",
        items: items.map(({ product, qty }) => ({
          productId: product.id,
          name: product.name,
          price: product.price,
          qty,
        })),
        subtotal,
        delivery,
        total,
        payment: "Cash on Delivery",
        address: {
          name: form.name.trim(),
          phone: form.phone.trim(),
          line1: form.line1.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
        },
        status: "Placed",
        createdAt: serverTimestamp(),
      });
      clear();
      navigate("/orders", { state: { placed: true } });
    } catch (err) {
      console.error(err);
      setError("Could not place the order. Please try again.");
      setBusy(false);
    }
  };

  return (
    <div className="container">
      <div className="cart-layout">
        <form className="panel" onSubmit={placeOrder}>
          <h1>Delivery address</h1>
          <div className="form-grid">
            <label className="field">Full name<input value={form.name} onChange={set("name")} autoComplete="name" /></label>
            <label className="field">Phone number<input value={form.phone} onChange={set("phone")} inputMode="numeric" maxLength={10} autoComplete="tel" /></label>
            <label className="field full">Address<input value={form.line1} onChange={set("line1")} placeholder="House no, street, area" autoComplete="street-address" /></label>
            <label className="field">City<input value={form.city} onChange={set("city")} autoComplete="address-level2" /></label>
            <label className="field">State<input value={form.state} onChange={set("state")} autoComplete="address-level1" /></label>
            <label className="field">Pincode<input value={form.pincode} onChange={set("pincode")} inputMode="numeric" maxLength={6} autoComplete="postal-code" /></label>
          </div>

          <h2 style={{ marginTop: 26 }}>Payment</h2>
          <div className="pay-box">💵 Cash on Delivery <span style={{ marginLeft: "auto", fontWeight: 400, color: "var(--muted)" }}>Pay when your order arrives</span></div>

          {error && <div className="error">{error}</div>}

          <button className="btn-buy" type="submit" disabled={busy} style={{ width: "100%", padding: 14, fontSize: 16 }}>
            {busy ? "Placing order..." : `Place order · ${formatPrice(total)}`}
          </button>
        </form>

        <aside className="panel">
          <h2>Order summary</h2>
          {items.map(({ product, qty }) => (
            <div className="sum-row" key={product.id}>
              <span>{product.name} × {qty}</span>
              <span>{formatPrice(product.price * qty)}</span>
            </div>
          ))}
          <div className="sum-row" style={{ marginTop: 14 }}><span>Items ({count})</span><span>{formatPrice(subtotal)}</span></div>
          <div className="sum-row">
            <span>Delivery</span>
            <span className={delivery === 0 ? "free" : ""}>{delivery === 0 ? "FREE" : formatPrice(delivery)}</span>
          </div>
          <div className="sum-row sum-total"><span>Total</span><span>{formatPrice(total)}</span></div>
        </aside>
      </div>
    </div>
  );
}