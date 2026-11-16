import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useProducts } from "./ProductsContext";
import { useToast } from "./ToastContext";
import { DELIVERY_FEE, FREE_DELIVERY_ABOVE } from "../utils";

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

const KEY = "shopspark_cart";

function loadLines() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const { byId } = useProducts();
  const { toast } = useToast();
  const [lines, setLines] = useState(loadLines);

  // Only product ids and quantities are saved, prices always come fresh from the shop
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {
      /* storage not available */
    }
  }, [lines]);

  const items = useMemo(
    () =>
      lines
        .map((l) => {
          const product = byId[l.id];
          if (!product) return null;
          const qty = Math.min(l.qty, product.stock || 0);
          return qty > 0 ? { product, qty } : null;
        })
        .filter(Boolean),
    [lines, byId]
  );

  const add = useCallback(
    (product, qty = 1) => {
      if (!product || !(product.stock > 0)) {
        toast("Sorry, this item is out of stock", "err");
        return;
      }
      setLines((prev) => {
        const found = prev.find((l) => l.id === product.id);
        const next = Math.min((found?.qty || 0) + qty, product.stock);
        return found
          ? prev.map((l) => (l.id === product.id ? { ...l, qty: next } : l))
          : [...prev, { id: product.id, qty: next }];
      });
      toast("Added to cart");
    },
    [toast]
  );

  const setQty = useCallback((id, qty) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.id !== id)
        : prev.map((l) => (l.id === id ? { ...l, qty } : l))
    );
  }, []);

  const remove = useCallback((id) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo(() => {
    const count = items.reduce((n, i) => n + i.qty, 0);
    const subtotal = items.reduce((n, i) => n + i.product.price * i.qty, 0);
    const delivery = subtotal === 0 || subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
    return {
      items,
      count,
      subtotal,
      delivery,
      total: subtotal + delivery,
      add,
      setQty,
      remove,
      clear,
    };
  }, [items, add, setQty, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}