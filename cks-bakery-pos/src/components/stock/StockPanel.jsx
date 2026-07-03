import { useOutlet } from "../../context/OutletContext";
import { formatQty } from "../../utils/format";
import StockStatusBadge from "./StockStatusBadge";

export default function StockPanel({ onClose }) {
  const { stock } = useOutlet();
  const rows = Object.entries(stock).sort(([, a], [, b]) => a.name.localeCompare(b.name));

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="stock-title">
      <div className="modal">
        <div className="modal-header">
          <h2 id="stock-title">Outlet stock</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>
        <div className="modal-body">
          <table className="stock-table">
            <thead>
              <tr>
                <th>Ingredient / item</th>
                <th>Stock</th>
                <th>Reorder at</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([id, s]) => (
                <tr key={id}>
                  <td>{s.name}</td>
                  <td>{formatQty(s.stock, s.unit)}</td>
                  <td>{formatQty(s.reorderLevel, s.unit)}</td>
                  <td><StockStatusBadge stock={s.stock} reorderLevel={s.reorderLevel} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary btn-block" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
