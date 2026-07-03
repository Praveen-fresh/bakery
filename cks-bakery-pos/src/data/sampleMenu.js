// Seed data for local/demo mode. In production this lives in Firestore
// (menuItems, recipes/{id}/versions/{n}, outlets/{id}/stock/{ingredientId})
// and is managed through admin tooling, never edited by the POS client.

export const outlets = [
  { id: "madipakkam-main", name: "CK's Bakery — Madipakkam" },
];

export const menuItems = [
  { id: "bread-white", name: "White bread loaf", category: "Bakery", price: 55, stockIngredientId: "stock-bread-white" },
  { id: "bun-milk", name: "Milk bun (pack of 6)", category: "Bakery", price: 60, stockIngredientId: "stock-bun-milk" },
  { id: "puff-veg", name: "Vegetable puff", category: "Snacks", price: 25, stockIngredientId: "stock-puff-veg" },
  { id: "cookie-choc", name: "Chocolate chip cookie", category: "Snacks", price: 20, stockIngredientId: "stock-cookie-choc" },
  { id: "cake-slice-black-forest", name: "Black Forest slice", category: "Cakes", price: 90, stockIngredientId: "stock-slice-blackforest" },
];

// Immutable recipe versions. A price/ingredient change creates a new
// version entry rather than mutating v1 -- so a bill billed against v1
// always recalculates the same way even after v2 exists.
export const cakeRecipes = [
  {
    id: "recipe-vanilla-cream",
    name: "Vanilla cream custom cake",
    versions: {
      v1: {
        version: "v1",
        effectiveFrom: "2025-11-01",
        costPerKg: 420,
        markupMultiplier: 1.6,
        ingredients: [
          { ingredientId: "ing-flour", name: "Flour", qtyPerKg: 0.32, unit: "kg" },
          { ingredientId: "ing-sugar", name: "Sugar", qtyPerKg: 0.22, unit: "kg" },
          { ingredientId: "ing-butter", name: "Butter", qtyPerKg: 0.18, unit: "kg" },
          { ingredientId: "ing-cream", name: "Fresh cream", qtyPerKg: 0.28, unit: "kg" },
          { ingredientId: "ing-vanilla", name: "Vanilla essence", qtyPerKg: 0.01, unit: "l" },
        ],
      },
      v2: {
        version: "v2",
        effectiveFrom: "2026-05-15",
        costPerKg: 460,
        markupMultiplier: 1.6,
        note: "Cream ratio increased for a softer finish; supplier price update.",
        ingredients: [
          { ingredientId: "ing-flour", name: "Flour", qtyPerKg: 0.30, unit: "kg" },
          { ingredientId: "ing-sugar", name: "Sugar", qtyPerKg: 0.20, unit: "kg" },
          { ingredientId: "ing-butter", name: "Butter", qtyPerKg: 0.18, unit: "kg" },
          { ingredientId: "ing-cream", name: "Fresh cream", qtyPerKg: 0.34, unit: "kg" },
          { ingredientId: "ing-vanilla", name: "Vanilla essence", qtyPerKg: 0.012, unit: "l" },
        ],
      },
    },
    currentVersion: "v2",
    flavors: ["Vanilla", "Vanilla & strawberry swirl", "Vanilla & choc-chip"],
  },
  {
    id: "recipe-chocolate-truffle",
    name: "Chocolate truffle custom cake",
    versions: {
      v1: {
        version: "v1",
        effectiveFrom: "2026-01-10",
        costPerKg: 520,
        markupMultiplier: 1.55,
        ingredients: [
          { ingredientId: "ing-flour", name: "Flour", qtyPerKg: 0.28, unit: "kg" },
          { ingredientId: "ing-cocoa", name: "Cocoa powder", qtyPerKg: 0.10, unit: "kg" },
          { ingredientId: "ing-choc-compound", name: "Chocolate compound", qtyPerKg: 0.35, unit: "kg" },
          { ingredientId: "ing-butter", name: "Butter", qtyPerKg: 0.16, unit: "kg" },
          { ingredientId: "ing-cream", name: "Fresh cream", qtyPerKg: 0.20, unit: "kg" },
        ],
      },
    },
    currentVersion: "v1",
    flavors: ["Dark chocolate", "Milk chocolate truffle"],
  },
];

// Starting stock for the single demo outlet. reorderLevel drives the
// low-stock alert in the stock-deduction flow.
export const initialOutletStock = {
  "madipakkam-main": {
    "stock-bread-white": { name: "White bread loaf", stock: 40, unit: "loaf", reorderLevel: 10 },
    "stock-bun-milk": { name: "Milk bun (pack of 6)", stock: 25, unit: "pack", reorderLevel: 8 },
    "stock-puff-veg": { name: "Vegetable puff", stock: 60, unit: "pc", reorderLevel: 15 },
    "stock-cookie-choc": { name: "Chocolate chip cookie", stock: 90, unit: "pc", reorderLevel: 20 },
    "stock-slice-blackforest": { name: "Black Forest slice", stock: 12, unit: "pc", reorderLevel: 4 },
    "ing-flour": { name: "Flour", stock: 3, unit: "kg", reorderLevel: 5 },
    "ing-sugar": { name: "Sugar", stock: 8, unit: "kg", reorderLevel: 3 },
    "ing-butter": { name: "Butter", stock: 6, unit: "kg", reorderLevel: 2 },
    "ing-cream": { name: "Fresh cream", stock: 4, unit: "kg", reorderLevel: 2 },
    "ing-vanilla": { name: "Vanilla essence", stock: 1.5, unit: "l", reorderLevel: 0.5 },
    "ing-cocoa": { name: "Cocoa powder", stock: 2, unit: "kg", reorderLevel: 1 },
    "ing-choc-compound": { name: "Chocolate compound", stock: 5, unit: "kg", reorderLevel: 2 },
  },
};
