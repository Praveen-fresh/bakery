import { createContext, useContext, useState } from "react";
import { outlets, initialOutletStock } from "../data/sampleMenu";

const OutletContext = createContext(null);

export function OutletProvider({ children }) {
  const [outletId] = useState(outlets[0].id);
  const [stock, setStock] = useState(initialOutletStock[outletId]);
  const [movements, setMovements] = useState([]);

  // Applies a successful order's effects: patch stock, append movement log.
  // This is the client-side mirror of the Firestore writes a real
  // transaction would make -- see functions/index.js for the source of truth.
  function applyOrderResult({ stockPatch, movements: newMovements }) {
    setStock((prev) => ({ ...prev, ...stockPatch }));
    setMovements((prev) => [...newMovements, ...prev]);
  }

  const outlet = outlets.find((o) => o.id === outletId);

  return (
    <OutletContext.Provider value={{ outlet, outletId, stock, movements, applyOrderResult }}>
      {children}
    </OutletContext.Provider>
  );
}

export function useOutlet() {
  const ctx = useContext(OutletContext);
  if (!ctx) throw new Error("useOutlet must be used within OutletProvider");
  return ctx;
}
