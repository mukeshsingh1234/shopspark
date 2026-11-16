import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "../context/ProductsContext";
import { useAuth } from "../context/AuthContext";
import ProductCard, { CardSkeleton } from "../components/ProductCard";
import Reveal from "../components/Reveal";
import { CATEGORIES, discountPercent } from "../utils";

const SLIDES = [
  { cls: "s1", tag: "Festival sale", title: "Up to 50% off on top picks", text: "Great prices on electronics, fashion and more.", cta: "Shop deals", to: "/products?sort=off" },
  { cls: "s2", tag: "New arrivals", title: "Fresh products, added often", text: "Be the first to grab what just landed.", cta: "See what is new", to: "/products" },
  { cls: "s3", tag: "Free delivery", title: "Free delivery above ₹499", text: "Pay when your order arrives with Cash on Delivery.", cta: "Start shopping", to: "/products" },
];

function Hero() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setI((v) => (v + 1) % SLIDES.length), 5000);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <section
      className="hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {SLIDES.map((s, n) => (
        <div key={s.cls} className={`slide ${s.cls} ${n === i ? "active" : ""}`} aria-hidden={n !== i}>
          <span className="blob b1" />
          <span className="blob b2" />
          <div className="slide-inner">
            <span className="hero-tag">{s.tag}</span>
            <h1>{s.title}</h1>
            <p>{s.text}</p>
            <Link className="hero-cta" to={s.to} tabIndex={n === i ? 0 : -1}>
              {s.cta}
            </Link>
          </div>
        </div>
      ))}
      <button className="arrow left" onClick={() => setI((i + SLIDES.length - 1) % SLIDES.length)} aria-label="Previous slide">
        ‹
      </button>
      <button className="arrow right" onClick={() => setI((i + 1) % SLIDES.length)} aria-label="Next slide">
        ›
      </button>
      <div className="dots">
        {SLIDES.map((s, n) => (
          <button key={s.cls} className={n === i ? "on" : ""} onClick={() => setI(n)} aria-label={`Slide ${n + 1}`} />
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const { products, loading, error } = useProducts();
  const { isAdmin } = useAuth();

  const latest = products.slice(0, 8);
  const deals = products
    .filter((p) => discountPercent(p.price, p.mrp) > 0)
    .sort((a, b) => discountPercent(b.price, b.mrp) - discountPercent(a.price, a.mrp))
    .slice(0, 8);

  return (
    <>
      <Hero />

      <div className="container">
        <div className="perks">
          <div className="perk"><span>🚚</span><div><b>Free delivery</b>On orders above ₹499</div></div>
          <div className="perk"><span>💵</span><div><b>Cash on Delivery</b>Pay when it arrives</div></div>
          <div className="perk"><span>↩️</span><div><b>Easy cancellation</b>Before your order ships</div></div>
          <div className="perk"><span>🔒</span><div><b>Secure sign in</b>With your Google account</div></div>
        </div>

        <Reveal>
          <section className="section">
            <div className="section-head"><h2>Shop by category</h2></div>
            <div className="cat-grid">
              {CATEGORIES.map((c) => (
                <Link key={c.name} className="cat-tile" to={`/products?category=${encodeURIComponent(c.name)}`}>
                  <span>{c.icon}</span>
                  {c.name}
                </Link>
              ))}
            </div>
          </section>
        </Reveal>

        {error && <div className="error" style={{ marginTop: 24 }}>Could not load products ({error}). Check the Firestore rules.</div>}

        {loading && (
          <section className="section">
            <div className="section-head"><h2>New arrivals</h2></div>
            <div className="grid"><CardSkeleton count={8} /></div>
          </section>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="empty" style={{ marginTop: 30 }}>
            <span className="big">🛍️</span>
            <h2>The store is getting ready</h2>
            <p>No products have been added yet.</p>
            {isAdmin && <Link to="/admin" className="btn-link">Add your first product</Link>}
          </div>
        )}

        {latest.length > 0 && (
          <Reveal>
            <section className="section">
              <div className="section-head">
                <h2>New arrivals</h2>
                <Link to="/products">See all</Link>
              </div>
              <div className="grid">
                {latest.map((p, n) => <ProductCard key={p.id} product={p} index={n} />)}
              </div>
            </section>
          </Reveal>
        )}

        {deals.length > 0 && (
          <Reveal>
            <section className="section">
              <div className="section-head">
                <h2>Best deals</h2>
                <Link to="/products?sort=off">See all</Link>
              </div>
              <div className="grid">
                {deals.map((p, n) => <ProductCard key={p.id} product={p} index={n} />)}
              </div>
            </section>
          </Reveal>
        )}
      </div>
    </>
  );
}