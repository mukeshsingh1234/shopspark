import { useEffect, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { collection, doc, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { formatDate, formatPrice } from "../utils";

const STEPS = ["Placed", "Shipped", "Delivered"];

function Stepper({ status }) {
  if (status === "Cancelled") return null;
  const idx = STEPS.indexOf(status);
  return (
    <div className="stepper">
      {STEPS.map((s, n) => (
        <div key={s} className={`step ${n <= idx ? "done" : ""}`}>{s}</div>
      ))}
    </div>
  );
}

export default function Orders() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "orders"), where("userId", "==", user.uid));
    return onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...d.data({ serverTimestamps: "estimate" }),
        }));
        list.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
        setOrders(list);
        setFetching(false);
      },
      (err) => {
        console.error(err);
        setFetching(false);
      }
    );
  }, [user]);

  const cancel = async (id) => {
    if (!window.confirm("Cancel this order?")) return;
    try {
      await updateDoc(doc(db, "orders", id), { status: "Cancelled" });
      toast("Order cancelled");
    } catch (err) {
      console.error(err);
      toast("Could not cancel the order", "err");
    }
  };

  if (loading) return <div className="splash"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" state={{ from: "/orders" }} replace />;

  return (
    <div className="container" style={{ marginTop: 22 }}>
      <h1 style={{ margin: "0 0 16px" }}>Your orders</h1>

      {location.state?.placed && (
        <div className="notice">✅ Order placed successfully. You will pay when it arrives.</div>
      )}

      {fetching ? (
        <div className="splash"><div className="spinner" /></div>
      ) : orders.length === 0 ? (
        <div className="empty">
          <span className="big">📦</span>
          <h2>No orders yet</h2>
          <p>When you place an order, it will show up here.</p>
          <Link to="/products" className="btn-link">Start shopping</Link>
        </div>
      ) : (
        orders.map((o) => (
          <article className="order" key={o.id}>
            <div className="order-head">
              <div>Order placed<b>{formatDate(o.createdAt)}</b></div>
              <div>Total<b>{formatPrice(o.total)}</b></div>
              <div>Ship to<b>{o.address?.name}</b></div>
              <div style={{ marginLeft: "auto" }}><span className={`badge ${o.status}`}>{o.status}</span></div>
            </div>
            <div className="order-body">
              <Stepper status={o.status} />
              <ul className="order-items">
                {o.items?.map((it) => (
                  <li key={it.productId}>{it.name} × {it.qty} · {formatPrice(it.price * it.qty)}</li>
                ))}
              </ul>
              <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>
                {o.address?.line1}, {o.address?.city}, {o.address?.state} {o.address?.pincode} · {o.address?.phone}
              </div>
              {o.status === "Placed" && (
                <button className="btn-sm danger" onClick={() => cancel(o.id)}>Cancel order</button>
              )}
            </div>
          </article>
        ))
      )}
    </div>
  );
}