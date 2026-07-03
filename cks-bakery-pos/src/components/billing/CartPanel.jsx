import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { formatINR } from "../../utils/format";
import CustomCakeModal from "./CustomCakeModal";

export default function CartPanel() {
  const { lines, total, status, insufficientItems, removeLine, checkout } = useCart();
  const [showCakeModal, setShowCakeModal] = useState(false);

  return (
    <aside className="cart-panel">
      <div className="cart-header">
        <h2>Current order</h2>
        <button className="btn btn-secondary" onClick={() => setShowCakeModal(true)}>
          + Custom cake
        </button>
      </div>

      {lines.length === 0 ? (
        <p className="cart-empty">Tap an item, or add a custom cake, to start a bill.</p>
      ) : (
        <ul className="cart-lines">
          {lines.map((line, i) => (
            <li key={i} className="cart-line">
              <div className="cart-line-main">
                <span className="cart-line-name">
                  {line.type === "standard" ? `${line.qty} × ${line.name}` : `${line.name} (${line.weightKg} kg)`}
                </span>
                {line.type === "customCake" && (
                  <span className="cart-line-sub">{line.flavor}{line.designNotes ? ` — ${line.designNotes}` : ""}</span>
                )}
              </div>
              <div className="cart-line-right">
                <span className="cart-line-price">
                  {formatINR(line.type === "standard" ? line.unitPrice * line.qty : line.unitPrice)}
                </span>
                <button className="cart-line-remove" onClick={() => removeLine(i)} aria-label="Remove line">
                  &times;
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {status === "insufficient" && (
        <div className="cart-warning">
          <strong>Can't complete this sale — stock is short:</strong>
          <ul>
            {insufficientItems.map((item) => (
              <li key={item.ingredientId}>
                {item.name}: need {item.needed}, have {item.available}
              </li>
            ))}
          </ul>
        </div>
      )}

      {status === "error" && (
        <div className="cart-warning">Something went wrong processing that order. Try again.</div>
      )}

      <div className="cart-footer">
        <div className="cart-total-row">
          <span>Total</span>
          <span className="cart-total">{formatINR(total)}</span>
        </div>
        <button
          className="btn btn-primary btn-block"
          disabled={lines.length === 0 || status === "processing"}
          onClick={checkout}
        >
          {status === "processing" ? "Processing…" : "Checkout & print bill"}
        </button>
      </div>

      {showCakeModal && <CustomCakeModal onClose={() => setShowCakeModal(false)} />}
    </aside>
  );
}
