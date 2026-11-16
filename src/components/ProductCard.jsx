import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { PLACEHOLDER, discountPercent, formatPrice } from "../utils";

export default function ProductCard({ product, index = 0 }) {
  const { add } = useCart();
  const out = !(product.stock > 0);
  const off = discountPercent(product.price, product.mrp);

  return (
    <article className="card" style={{ animationDelay: `${Math.min(index, 12) * 50}ms` }}>
      <Link to={`/product/${product.id}`} className="card-img">
        {off > 0 && <span className="off-badge">{off}% off</span>}
        <img
          src={product.image || PLACEHOLDER}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER;
          }}
        />
      </Link>
      <div className="card-body">
        <Link to={`/product/${product.id}`} className="card-title">
          {product.name}
        </Link>
        <div className="price-row">
          <span className="price">{formatPrice(product.price)}</span>
          {off > 0 && <span className="mrp">{formatPrice(product.mrp)}</span>}
        </div>
        <span className={`stock ${out ? "out" : ""}`}>
          {out ? "Out of stock" : product.stock <= 5 ? `Only ${product.stock} left` : "In stock"}
        </span>
        <button className="btn-cart" disabled={out} onClick={() => add(product)}>
          {out ? "Unavailable" : "Add to cart"}
        </button>
      </div>
    </article>
  );
}

export function CardSkeleton({ count = 8 }) {
  return Array.from({ length: count }, (_, i) => (
    <div className="skeleton" key={i}>
      <div className="sk sk-img" />
      <div className="sk sk-line" style={{ width: "80%" }} />
      <div className="sk sk-line" style={{ width: "45%" }} />
      <div className="sk sk-line" style={{ width: "60%" }} />
    </div>
  ));
}