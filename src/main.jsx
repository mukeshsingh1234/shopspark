import { Component, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./context/AuthContext";
import { ProductsProvider } from "./context/ProductsContext";
import { CartProvider } from "./context/CartContext";

// Shows the real error on the page instead of a blank screen
class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <pre style={{ padding: 20, color: "#b00020", whiteSpace: "pre-wrap", fontSize: 14 }}>
          {String(this.state.error?.stack || this.state.error)}
        </pre>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <HashRouter>
        <ToastProvider>
          <AuthProvider>
            <ProductsProvider>
              <CartProvider>
                <App />
              </CartProvider>
            </ProductsProvider>
          </AuthProvider>
        </ToastProvider>
      </HashRouter>
    </ErrorBoundary>
  </StrictMode>
);
