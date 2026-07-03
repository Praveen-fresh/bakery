import { useCart } from "../../context/CartContext";
import { formatQty } from "../../utils/format";

export default function LowStockAlert() {
  const { lowStockAlerts, dismissAlerts } = useCart();
  if (lowStockAlerts.length === 0) return null;

  return (
    <div className="low-stock-banner" role="alert">
      <div className="low-stock-text">
        <strong>Low stock:</strong>{" "}
        {lowStockAlerts
          .map((a) => `${a.name} (${formatQty(a.stock, "")} left, reorder at ${a.reorderLevel})`)
          .join(" · ")}
      </div>
      <button className="low-stock-dismiss" onClick={dismissAlerts} aria-label="Dismiss">
        &times;
      </button>
    </div>
  );
}
