import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useProducts } from "../context/ProductsContext";
import { useToast } from "../context/ToastContext";
import { CATEGORIES, PLACEHOLDER, compressImage, formatDate, formatPrice } from "../utils";

const BLANK = { name: "", category: CATEGORIES[0].name, price: "", mrp: "", stock: "", description: "", image: "" };

/* ---------- Add / edit product ---------- */
function ProductForm({ editing, onDone }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState(
    editing
      ? {
          name: editing.name,
          category: editing.category,
          price: String(editing.price),
          mrp: editing.mrp ? String(editing.mrp) : "",
          stock: String(editing.stock),
          description: editing.description || "",
          image: editing.image || "",
        }
      : { ...BLANK }
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const pickFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Please choose an image file.");
    try {
      const image = await compressImage(file);
      setForm((f) => ({ ...f, image }));
      setError("");
    } catch {
      setError("Could not read that image. Try another one.");
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    const price = Number(form.price);
    const mrp = Number(form.mrp || 0);
    const stock = Number(form.stock);

    if (!form.name.trim()) return setError("Enter the product name.");
    if (!(price > 0)) return setError("Enter a valid selling price.");
    if (!Number.isInteger(stock) || stock < 0) return setError("Stock must be a whole number (0 or more).");
    if (!form.image) return setError("Add a product image (upload a photo or paste a link).");

    const data = {
      name: form.name.trim(),
      category: form.category,
      price,
      mrp: mrp > price ? mrp : 0,
      stock,
      description: form.description.trim(),
      image: form.image.trim(),
    };

    setBusy(true);
    try {
      if (editing) {
        await updateDoc(doc(db, "products", editing.id), { ...data, updatedAt: serverTimestamp() });
        toast("Product updated");
      } else {
        await addDoc(collection(db, "products"), { ...data, createdAt: serverTimestamp(), sellerId: user.uid });
        toast("Product added");
      }
      onDone();
    } catch (err) {
      console.error(err);
      setError("Could not save the product. Make sure the Firestore rules are published.");
      setBusy(false);
    }
  };

  return (
    <form className="panel" onSubmit={submit}>
      <h2>{editing ? "Edit product" : "Add a new product"}</h2>

      <div className="form-grid">
        <label className="field full">Product name<input value={form.name} onChange={set("name")} placeholder="e.g. Wireless Bluetooth Headphones" /></label>

        <label className="field">Category
          <select value={form.category} onChange={set("category")}>
            {CATEGORIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
        </label>
        <label className="field">Stock (quantity)<input value={form.stock} onChange={set("stock")} inputMode="numeric" placeholder="e.g. 25" /></label>

        <label className="field">Selling price (₹)<input value={form.price} onChange={set("price")} inputMode="decimal" placeholder="e.g. 799" /></label>
        <label className="field">M.R.P. (₹) <small style={{ fontWeight: 400, color: "var(--muted)" }}>optional, shows a discount</small>
          <input value={form.mrp} onChange={set("mrp")} inputMode="decimal" placeholder="e.g. 1299" />
        </label>

        <label className="field full">Description
          <textarea rows={5} value={form.description} onChange={set("description")} placeholder="Features, size, material, warranty..." />
        </label>

        <div className="field full">
          Product image
          <div className="upload-row">
            <img
              className="preview"
              src={form.image || PLACEHOLDER}
              alt="Preview"
              onError={(e) => {
                e.currentTarget.src = PLACEHOLDER;
              }}
            />
            <div style={{ flex: 1, minWidth: 220, display: "grid", gap: 10 }}>
              <input type="file" accept="image/*" onChange={pickFile} />
              <input
                value={form.image.startsWith("data:") ? "" : form.image}
                onChange={set("image")}
                placeholder="...or paste an image link (https://...)"
              />
            </div>
          </div>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <button className="btn-buy" type="submit" disabled={busy} style={{ padding: "12px 28px" }}>
          {busy ? "Saving..." : editing ? "Save changes" : "Add product"}
        </button>
        {editing && <button type="button" className="btn-sm" onClick={onDone}>Cancel</button>}
      </div>
    </form>
  );
}

/* ---------- Product list ---------- */
function ProductList({ onEdit }) {
  const { products, loading } = useProducts();
  const { toast } = useToast();

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"?`)) return;
    try {
      await deleteDoc(doc(db, "products", p.id));
      toast("Product deleted");
    } catch (err) {
      console.error(err);
      toast("Could not delete the product", "err");
    }
  };

  if (loading) return <div className="splash"><div className="spinner" /></div>;
  if (products.length === 0) {
    return <div className="empty"><span className="big">📦</span><h2>No products yet</h2><p>Use the "Add product" tab to add your first one.</p></div>;
  }

  return (
    <div className="panel table-wrap">
      <table>
        <thead>
          <tr><th></th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th></th></tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td><img className="thumb" src={p.image || PLACEHOLDER} alt="" onError={(e) => { e.currentTarget.src = PLACEHOLDER; }} /></td>
              <td><Link to={`/product/${p.id}`}>{p.name}</Link></td>
              <td>{p.category}</td>
              <td>{formatPrice(p.price)}</td>
              <td style={{ color: p.stock > 0 ? "inherit" : "var(--danger)", fontWeight: 600 }}>{p.stock}</td>
              <td>
                <div className="row-actions">
                  <button className="btn-sm" onClick={() => onEdit(p)}>Edit</button>
                  <button className="btn-sm danger" onClick={() => remove(p)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- All customer orders ---------- */
function AdminOrders() {
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snap) => {
        setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data({ serverTimestamps: "estimate" }) })));
        setFetching(false);
      },
      (err) => {
        console.error(err);
        setFetching(false);
      }
    );
  }, []);

  const setStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, "orders", id), { status });
      toast(`Order marked ${status}`);
    } catch (err) {
      console.error(err);
      toast("Could not update the order", "err");
    }
  };

  if (fetching) return <div className="splash"><div className="spinner" /></div>;
  if (orders.length === 0) {
    return <div className="empty"><span className="big">📭</span><h2>No orders yet</h2><p>New orders will appear here.</p></div>;
  }

  return orders.map((o) => (
    <article className="order" key={o.id}>
      <div className="order-head">
        <div>Placed<b>{formatDate(o.createdAt)}</b></div>
        <div>Customer<b>{o.userName || o.userEmail}</b></div>
        <div>Total<b>{formatPrice(o.total)}</b></div>
        <div>Payment<b>{o.payment}</b></div>
        <div style={{ marginLeft: "auto" }}><span className={`badge ${o.status}`}>{o.status}</span></div>
      </div>
      <div className="order-body">
        <ul className="order-items">
          {o.items?.map((it) => (
            <li key={it.productId}>{it.name} × {it.qty} · {formatPrice(it.price * it.qty)}</li>
          ))}
        </ul>
        <div style={{ fontSize: 14, marginBottom: 12 }}>
          <b>{o.address?.name}</b>, {o.address?.line1}, {o.address?.city}, {o.address?.state} {o.address?.pincode}<br />
          Phone: {o.address?.phone} · {o.userEmail}
        </div>
        <label className="field" style={{ maxWidth: 220 }}>
          Update status
          <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)}>
            {["Placed", "Shipped", "Delivered", "Cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
      </div>
    </article>
  ));
}

/* ---------- Dashboard ---------- */
export default function Admin() {
  const { user, loading, isAdmin } = useAuth();
  const [tab, setTab] = useState("add");
  const [editing, setEditing] = useState(null);

  if (loading) return <div className="splash"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" state={{ from: "/admin" }} replace />;

  if (!isAdmin) {
    return (
      <div className="container" style={{ marginTop: 30 }}>
        <div className="empty">
          <span className="big">🔒</span>
          <h2>Seller access only</h2>
          <p>Only the store owner can open this page.</p>
          <Link to="/" className="btn-link">Back to store</Link>
        </div>
      </div>
    );
  }

  const startEdit = (p) => {
    setEditing(p);
    setTab("add");
  };
  const finish = () => {
    setEditing(null);
    setTab("products");
  };

  return (
    <div className="container">
      <h1 style={{ margin: "22px 0 0" }}>Seller dashboard</h1>

      <div className="tabs">
        <button className={tab === "add" ? "on" : ""} onClick={() => { setEditing(null); setTab("add"); }}>
          {editing ? "Edit product" : "Add product"}
        </button>
        <button className={tab === "products" ? "on" : ""} onClick={() => setTab("products")}>My products</button>
        <button className={tab === "orders" ? "on" : ""} onClick={() => setTab("orders")}>Orders</button>
      </div>

      {tab === "add" && <ProductForm key={editing?.id || "new"} editing={editing} onDone={finish} />}
      {tab === "products" && <ProductList onEdit={startEdit} />}
      {tab === "orders" && <AdminOrders />}
    </div>
  );
}