import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useProducts } from "../context/ProductsContext";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";
import { PLACEHOLDER, discountPercent, formatPrice } from "../utils";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { byId, products, loading } = useProducts();
  const { add } = useCart();
  const [qty, setQty] = useState(1);

  const product = byId[id];

  if (loading) {
    return (
      <div className="container" style={{ marginTop: 30 }}>
        <div className="detail">
          <div className="sk sk-img" style={{ borderRadius: 12 }} />
          <div>
            <div className="sk sk-line" style={{ width: "70%", margin: "0 0 14px" }} />
            <div className="sk sk-line" style={{ width: "30%", margin: "0 0 14px" }} />
            <div className="sk sk-line" style={{ width: "90%", margin: "0 0 14px" }} />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ marginTop: 30 }}>
        <div className="empty">
          <span className="big">😕</span>
          <h2>Product not found</h2>
          <p>This product may have been removed.</p>
          <Link to="/products" className="btn-link">Browse products</Link>
        </div>
      </div>
    );
  }

  const out = !(product.stock > 0);
  const off = discountPercent(product.price, product.mrp);
  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="container">
      <div className="crumbs">
        <Link to="/">Home</Link> › <Link to={`/products?category=${encodeURIComponent(product.category)}`}>{product.category}</Link> › {product.name}
      </div>

      <div className="detail">
        <div className="detail-img">
          <img
            src={product.image || PLACEHOLDER}
            alt={product.name}
            onError={(e) => {
              e.currentTarget.src = PLACEHOLDER;
            }}
          />
        </div>

        <div className="detail-info">
          <span className="chip">{product.category}</span>
          <h1>{product.name}</h1>

          <div className="detail-price">
            {formatPrice(product.price)}
            {off > 0 && <small>{off}% off</small>}
          </div>
          {off > 0 && (
            <div className="mrp">M.R.P.: {formatPrice(product.mrp)}</div>
          )}

          <p className={`stock ${out ? "out" : ""}`} style={{ margin: "12px 0" }}>
            {out ? "Out of stock" : product.stock <= 5 ? `Only ${product.stock} left in stock` : "In stock"}
          </p>

          <div className="info-list">
            <span>🚚 Free delivery on orders above ₹499</span>
            <span>💵 Cash on Delivery available</span>
            <span>↩️ Easy cancellation before shipping</span>
          </div>

          {!out && (
            <div className="qty" aria-label="Quantity">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Decrease">−</button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} disabled={qty >= product.stock} aria-label="Increase">+</button>
            </div>
          )}

          <div className="actions">
            <button className="btn-cart" disabled={out} onClick={() => add(product, qty)}>
              Add to cart
            </button>
            <button
              className="btn-buy"
              disabled={out}
              onClick={() => {
                add(product, qty);
                navigate("/checkout");
              }}
            >
              Buy now
            </button>
          </div>

          {product.description && (
            <>
              <h3 style={{ marginTop: 26 }}>About this item</h3>
              <p className="desc">{product.description}</p>
            </>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="section">
          <div className="section-head"><h2>More in {product.category}</h2></div>
          <div className="grid">
            {related.map((p, n) => <ProductCard key={p.id} product={p} index={n} />)}
          </div>
        </section>
      )}
    </div>
  );
}