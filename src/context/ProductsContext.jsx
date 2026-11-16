import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";

const ProductsContext = createContext(null);
export const useProducts = () => useContext(ProductsContext);

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snap) => {
        setProducts(
          snap.docs.map((d) => ({
            id: d.id,
            ...d.data({ serverTimestamps: "estimate" }),
          }))
        );
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError(err.code);
        setLoading(false);
      }
    );
  }, []);

  const byId = useMemo(
    () => Object.fromEntries(products.map((p) => [p.id, p])),
    [products]
  );

  const value = useMemo(
    () => ({ products, byId, loading, error }),
    [products, byId, loading, error]
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}