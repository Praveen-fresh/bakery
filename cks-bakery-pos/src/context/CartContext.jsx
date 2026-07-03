import { createContext, useContext, useState, useCallback } from "react";
import { useOutlet } from "./OutletContext";
import { processOrder } from "../services/orderService";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { outletId, stock, applyOrderResult } = useOutlet();
  const [lines, setLines] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | processing | insufficient | error
  const [insufficientItems, setInsufficientItems] = useState([]);
  const [lastBill, setLastBill] = useState(null);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);

  const addStandardItem = useCallback((menuItem) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.type === "standard" && l.menuItemId === menuItem.id);
      if (existing) {
        return prev.map((l) =>
          l === existing ? { ...l, qty: l.qty + 1 } : l
        );
      }
      return [...prev, { type: "standard", menuItemId: menuItem.id, name: menuItem.name, qty: 1, unitPrice: menuItem.price }];
    });
  }, []);

  const addCustomCake = useCallback((cakeLine) => {
    setLines((prev) => [...prev, { type: "customCake", ...cakeLine }]);
  }, []);

  const removeLine = useCallback((index) => {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearCart = useCallback(() => {
    setLines([]);
    setStatus("idle");
    setInsufficientItems([]);
  }, []);

  const checkout = useCallback(async () => {
    if (lines.length === 0) return;
    setStatus("processing");
    try {
      const result = await processOrder({ outletId, lines, stockState: stock });

      if (result.status === "insufficient_stock") {
        setStatus("insufficient");
        setInsufficientItems(result.insufficient);
        return;
      }

      applyOrderResult(result);
      setLastBill(result.order ?? result); // simulation returns .order, cloud fn returns flat fields
      setLowStockAlerts(result.lowStockAlerts ?? []);
      setLines([]);
      setStatus("idle");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }, [lines, outletId, stock, applyOrderResult]);

  const total = lines.reduce((sum, l) => {
    if (l.type === "standard") return sum + l.unitPrice * l.qty;
    return sum + l.unitPrice;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        lines,
        total,
        status,
        insufficientItems,
        lastBill,
        lowStockAlerts,
        addStandardItem,
        addCustomCake,
        removeLine,
        clearCart,
        checkout,
        dismissBill: () => setLastBill(null),
        dismissAlerts: () => setLowStockAlerts([]),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
