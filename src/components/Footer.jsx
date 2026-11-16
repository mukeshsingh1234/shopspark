import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <button
        className="footer-top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        Back to top
      </button>
      <div className="container footer-cols">
        <div>
          <h4>ShopSpark</h4>
          <p>Quality products at honest prices, delivered to your door.</p>
        </div>
        <div>
          <h4>Shop</h4>
          <Link to="/products">All products</Link>
          <Link to="/cart">Your cart</Link>
          <Link to="/orders">Your orders</Link>
        </div>
        <div>
          <h4>Help</h4>
          <p>Cash on Delivery available</p>
          <p>Free delivery above ₹499</p>
          <p>Cancel before your order ships</p>
        </div>
      </div>
      <div className="copy">© {new Date().getFullYear()} ShopSpark. All rights reserved.</div>
    </footer>
  );
}