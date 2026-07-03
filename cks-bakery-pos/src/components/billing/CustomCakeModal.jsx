import { useMemo, useState } from "react";
import { cakeRecipes } from "../../data/sampleMenu";
import { useCart } from "../../context/CartContext";
import { formatINR } from "../../utils/format";

export default function CustomCakeModal({ onClose }) {
  const { addCustomCake } = useCart();
  const [recipeId, setRecipeId] = useState(cakeRecipes[0].id);
  const [weightKg, setWeightKg] = useState(1);
  const [flavor, setFlavor] = useState(cakeRecipes[0].flavors[0]);
  const [designNotes, setDesignNotes] = useState("");

  const recipe = cakeRecipes.find((r) => r.id === recipeId);
  const version = recipe.versions[recipe.currentVersion];

  const price = useMemo(
    () => version.costPerKg * weightKg * (version.markupMultiplier ?? 1),
    [version, weightKg]
  );

  function handleRecipeChange(id) {
    const next = cakeRecipes.find((r) => r.id === id);
    setRecipeId(id);
    setFlavor(next.flavors[0]);
  }

  function handleAdd() {
    addCustomCake({
      recipeId,
      recipeVersion: recipe.currentVersion,
      name: recipe.name,
      flavor,
      designNotes,
      weightKg,
      unitPrice: price,
    });
    onClose();
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="cake-modal-title">
      <div className="modal">
        <div className="modal-header">
          <h2 id="cake-modal-title">Custom cake order</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <div className="modal-body">
          <label className="field">
            <span className="field-label">Cake type</span>
            <select value={recipeId} onChange={(e) => handleRecipeChange(e.target.value)}>
              {cakeRecipes.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field-label">Flavor</span>
            <select value={flavor} onChange={(e) => setFlavor(e.target.value)}>
              {recipe.flavors.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field-label">Weight (kg)</span>
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={weightKg}
              onChange={(e) => setWeightKg(Math.max(0.5, Number(e.target.value)))}
            />
          </label>

          <label className="field">
            <span className="field-label">Design notes</span>
            <textarea
              rows={3}
              placeholder="e.g. Happy birthday Meera, blue piping, edible pearls"
              value={designNotes}
              onChange={(e) => setDesignNotes(e.target.value)}
            />
          </label>

          <div className="cake-recipe-meta">
            Recipe version <code>{version.version}</code>, effective {version.effectiveFrom}
          </div>

          <div className="cake-price-row">
            <span>Price</span>
            <span className="cake-price">{formatINR(price)}</span>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleAdd}>Add to bill</button>
        </div>
      </div>
    </div>
  );
}
