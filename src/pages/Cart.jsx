import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { FREE_DELIVERY_ABOVE, PLACEHOLDER, formatPrice } from "../utils";

export default function Cart() {
  const { items, count, subtotal, delivery, total, setQty, remove } = useCart();

  if (items.length === 0) {
    return (
      <div className="container" style={{ marginTop: 30 }}>
        <div className="empty">
          <span className="big">🛒</span>
          <h2>Your cart is empty</h2>
          <p>Add something you like and it will show up here.</p>
          <Link to="/products" className="btn-link">Continue shopping</Link>
        </div>
      </div>
    );
  }

  const remaining = Math.max(0, FREE_DELIVERY_ABOVE - subtotal);
  const progress = Math.min(100, (subtotal / FREE_DELIVERY_ABOVE) * 100);

  return (
    <div className="container">
      <div className="cart-layout">
        <section className="panel">
          <h1>Shopping cart</h1>
          {items.map(({ product, qty }) => (
            <div className="cart-item" key={product.id}>
              <Link to={`/product/${product.id}`}>
                <img
                  src={product.image || PLACEHOLDER}
                  alt={product.name}
                  onError={(e) => {
                    e.currentTarget.src = PLACEHOLDER;
                  }}
                />
              </Link>
              <div>
                <h3><Link to={`/product/${product.id}`}>{product.name}</Link></h3>
                <div className="stock">In stock</div>
                <div style={{ marginTop: 10, display: "flex", alignItems: "center" }}>
                  <div className="qty">
                    <button onClick={() => setQty(product.id, qty - 1)} aria-label="Decrease">−</button>
                    <span>{qty}</span>
                    <button onClick={() => setQty(product.id, qty + 1)} disabled={qty >= product.stock} aria-label="Increase">+</button>
                  </div>
                  <button className="link-btn" onClick={() => remove(product.id)}>Remove</button>
                </div>
              </div>
              <div className="line-total">{formatPrice(product.price * qty)}</div>
            </div>
          ))}
        </section>

        <aside className="panel">
          <h2>Order summary</h2>
          {remaining > 0 ? (
            <p style={{ margin: 0, fontSize: 14 }}>
              Add <b>{formatPrice(remaining)}</b> more for <span className="free">free delivery</span>
            </p>
          ) : (
            <p className="free" style={{ margin: 0, fontSize: 14 }}>You get free delivery 🎉</p>
          )}
          <div className="progress"><i style={{ width: `${progress}%` }} /></div>

          <div className="sum-row"><span>Items ({count})</span><span>{formatPrice(subtotal)}</span></div>
          <div className="sum-row">
            <span>Delivery</span>
            <span className={delivery === 0 ? "free" : ""}>{delivery === 0 ? "FREE" : formatPrice(delivery)}</span>
          </div>
          <div className="sum-row sum-total"><span>Total</span><span>{formatPrice(total)}</span></div>

          <Link to="/checkout" className="btn-link" style={{ display: "block", textAlign: "center", marginTop: 16 }}>
            Proceed to checkout
          </Link>
        </aside>
      </div>
    </div>
  );
}