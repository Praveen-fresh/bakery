export default function StockStatusBadge({ stock, reorderLevel }) {
  const level = stock <= reorderLevel ? "low" : stock <= reorderLevel * 2 ? "watch" : "ok";
  const label = { low: "Low", watch: "Watch", ok: "OK" }[level];

  return <span className={`stock-badge stock-badge-${level}`}>{label}</span>;
}
