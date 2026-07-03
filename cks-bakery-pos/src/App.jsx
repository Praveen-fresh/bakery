import { OutletProvider } from "./context/OutletContext";
import { CartProvider } from "./context/CartContext";
import BillingScreen from "./components/billing/BillingScreen";
import BillReceipt from "./components/bill/BillReceipt";
import LowStockAlert from "./components/stock/LowStockAlert";

export default function App() {
  return (
    <OutletProvider>
      <CartProvider>
        <LowStockAlert />
        <BillingScreen />
        <BillReceipt />
      </CartProvider>
    </OutletProvider>
  );
}
