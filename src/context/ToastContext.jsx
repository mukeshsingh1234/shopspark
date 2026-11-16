import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [msg, setMsg] = useState(null);
  const timer = useRef(null);

  const toast = useCallback((text, type = "ok") => {
    setMsg({ text, type, id: Date.now() });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(null), 2800);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {msg && (
        <div key={msg.id} className={`toast ${msg.type}`} role="status">
          {msg.text}
        </div>
      )}
    </ToastContext.Provider>
  );
}