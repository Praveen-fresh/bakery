import { useState } from "react";
import ItemGrid from "./ItemGrid";
import CartPanel from "./CartPanel";
import StockPanel from "../stock/StockPanel";
import { useOutlet } from "../../context/OutletContext";

export default function BillingScreen() {
  const { outlet } = useOutlet();
  const [showStock, setShowStock] = useState(false);

  return (
    <div className="billing-screen">
      <header className="billing-header">
        <div>
          <h1>CK's Bakery POS</h1>
          <p className="billing-outlet">{outlet.name}</p>
        </div>
        <button className="btn btn-ghost" onClick={() => setShowStock(true)}>
          View stock
        </button>
      </header>

      {showStock && <StockPanel onClose={() => setShowStock(false)} />}

      <div className="billing-body">
        <ItemGrid />
        <CartPanel />
      </div>
    </div>
  );
}
