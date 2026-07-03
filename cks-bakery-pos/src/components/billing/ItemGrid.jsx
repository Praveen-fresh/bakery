import { menuItems } from "../../data/sampleMenu";
import { useCart } from "../../context/CartContext";
import { formatINR } from "../../utils/format";

const categories = [...new Set(menuItems.map((m) => m.category))];

export default function ItemGrid() {
  const { addStandardItem } = useCart();

  return (
    <div className="item-grid-wrap">
      {categories.map((category) => (
        <section key={category} className="item-category">
          <h3 className="item-category-title">{category}</h3>
          <div className="item-grid">
            {menuItems
              .filter((m) => m.category === category)
              .map((item) => (
                <button key={item.id} className="item-card" onClick={() => addStandardItem(item)}>
                  <span className="item-card-name">{item.name}</span>
                  <span className="item-card-price">{formatINR(item.price)}</span>
                </button>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
