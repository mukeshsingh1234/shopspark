import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useProducts } from "../context/ProductsContext";
import ProductCard, { CardSkeleton } from "../components/ProductCard";
import { CATEGORIES, discountPercent } from "../utils";

export default function Products() {
  const { products, loading, error } = useProducts();
  const [params, setParams] = useSearchParams();

  const rawQ = params.get("q") || "";
  const q = rawQ.trim().toLowerCase();
  const category = params.get("category") || "All";
  const sort = params.get("sort") || "new";

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (!value || value === "All" || value === "new") next.delete(key);
    else next.set(key, value);
    setParams(next);
  };

  const list = useMemo(() => {
    let out = products.filter(
      (p) =>
        (category === "All" || p.category === category) &&
        (!q || `${p.name} ${p.category} ${p.description || ""}`.toLowerCase().includes(q))
    );
    if (sort === "low") out = [...out].sort((a, b) => a.price - b.price);
    else if (sort === "high") out = [...out].sort((a, b) => b.price - a.price);
    else if (sort === "off")
      out = [...out].sort((a, b) => discountPercent(b.price, b.mrp) - discountPercent(a.price, a.mrp));
    return out;
  }, [products, q, category, sort]);

  const title = rawQ ? `Results for "${rawQ}"` : category === "All" ? "All products" : category;

  return (
    <div className="container">
      <div className="shop-layout">
        <aside className="side">
          <h3>Category</h3>
          {["All", ...CATEGORIES.map((c) => c.name)].map((name) => (
            <button key={name} className={category === name ? "on" : ""} onClick={() => update("category", name)}>
              {name}
            </button>
          ))}
        </aside>

        <section>
          <div className="toolbar">
            <h1>
              {title} <small>({list.length})</small>
            </h1>
            <select value={sort} onChange={(e) => update("sort", e.target.value)} aria-label="Sort products">
              <option value="new">Newest first</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
              <option value="off">Biggest discount</option>
            </select>
          </div>

          {error && <div className="error">Could not load products ({error}).</div>}

          {loading ? (
            <div className="grid"><CardSkeleton count={8} /></div>
          ) : list.length === 0 ? (
            <div className="empty">
              <span className="big">🔍</span>
              <h2>No products found</h2>
              <p>Try a different word or category.</p>
            </div>
          ) : (
            <div className="grid">
              {list.map((p, n) => <ProductCard key={p.id} product={p} index={n} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}