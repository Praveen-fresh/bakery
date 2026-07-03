export function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatQty(qty, unit) {
  const rounded = Math.round(qty * 1000) / 1000;
  return `${rounded} ${unit}`;
}
