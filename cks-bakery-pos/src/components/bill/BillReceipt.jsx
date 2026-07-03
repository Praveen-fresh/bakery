import { useCart } from "../../context/CartContext";
import { formatINR } from "../../utils/format";

export default function BillReceipt() {
  const { lastBill, dismissBill } = useCart();
  if (!lastBill) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="bill-title">
      <div className="modal receipt">
        <div className="modal-header">
          <h2 id="bill-title">Bill generated</h2>
          <button className="modal-close" onClick={dismissBill} aria-label="Close">
            &times;
          </button>
        </div>

        <div className="modal-body">
          <p className="receipt-id">Order #{lastBill.id ?? lastBill.orderId}</p>
          <ul className="receipt-lines">
            {(lastBill.lines ?? []).map((line, i) => (
              <li key={i} className="receipt-line">
                <span>
                  {line.type === "standard" ? `${line.qty} × ${line.name}` : `${line.name} (${line.weightKg} kg, ${line.flavor})`}
                </span>
                <span>{formatINR(line.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <div className="receipt-total-row">
            <span>Total</span>
            <span>{formatINR(lastBill.total)}</span>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary btn-block" onClick={dismissBill}>Done</button>
        </div>
      </div>
    </div>
  );
}
