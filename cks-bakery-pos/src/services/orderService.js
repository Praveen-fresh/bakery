// This module is the client-side entry point for "process this order".
//
// It has two modes:
//  - Simulation (default): runs the exact same steps as functions/index.js
//    against the in-memory stock held in OutletContext, so the demo works
//    with zero Firebase setup and behaves identically to production.
//  - Cloud Function: calls the deployed `processOrder` callable, which runs
//    the real Firestore transaction. Enable with VITE_USE_CLOUD_FUNCTION=true.
//
// Keeping the resolution/deduction logic mirrored between this file and
// functions/index.js means the on-screen flow always matches what
// actually happens once you deploy.

import { httpsCallable } from "firebase/functions";
import { functions, USE_CLOUD_FUNCTION } from "../firebase/config";
import { cakeRecipes, menuItems } from "../data/sampleMenu";

function findMenuItem(menuItemId) {
  return menuItems.find((m) => m.id === menuItemId);
}

function findRecipeVersion(recipeId, versionId) {
  const recipe = cakeRecipes.find((r) => r.id === recipeId);
  return recipe?.versions[versionId];
}

function resolveLine(line) {
  if (line.type === "standard") {
    const item = findMenuItem(line.menuItemId);
    return {
      type: "standard",
      menuItemId: line.menuItemId,
      name: item.name,
      qty: line.qty,
      unitPrice: item.price,
      lineTotal: item.price * line.qty,
      ingredientRequirements: [{ ingredientId: item.stockIngredientId, qty: line.qty }],
    };
  }

  if (line.type === "customCake") {
    const recipe = findRecipeVersion(line.recipeId, line.recipeVersion);
    const lineTotal = recipe.costPerKg * line.weightKg * (recipe.markupMultiplier ?? 1);
    return {
      type: "customCake",
      recipeId: line.recipeId,
      recipeVersion: line.recipeVersion,
      name: line.name,
      flavor: line.flavor,
      designNotes: line.designNotes ?? "",
      weightKg: line.weightKg,
      unitPrice: lineTotal,
      lineTotal,
      ingredientRequirements: recipe.ingredients.map((ing) => ({
        ingredientId: ing.ingredientId,
        qty: ing.qtyPerKg * line.weightKg,
      })),
    };
  }

  throw new Error(`Unknown line type: ${line.type}`);
}

/**
 * Simulated version of the processOrder Cloud Function.
 * `stockState` is the current { [ingredientId]: { stock, reorderLevel, ... } }
 * for the outlet. Returns a result plus a stockPatch to apply if successful,
 * so the caller (CartContext) can commit the update atomically in React state.
 */
function simulateProcessOrder({ stockState, lines }) {
  const resolvedLines = lines.map(resolveLine);

  const requirementByIngredient = new Map();
  for (const line of resolvedLines) {
    for (const req of line.ingredientRequirements) {
      requirementByIngredient.set(
        req.ingredientId,
        (requirementByIngredient.get(req.ingredientId) || 0) + req.qty
      );
    }
  }

  // Sufficient stock check, across the whole order, before any deduction.
  const insufficient = [];
  for (const [ingredientId, qtyNeeded] of requirementByIngredient) {
    const available = stockState[ingredientId]?.stock ?? 0;
    if (available < qtyNeeded) {
      insufficient.push({
        ingredientId,
        name: stockState[ingredientId]?.name ?? ingredientId,
        needed: qtyNeeded,
        available,
      });
    }
  }

  if (insufficient.length > 0) {
    return { status: "insufficient_stock", insufficient };
  }

  // Deduct + log movement + check reorder threshold.
  const stockPatch = {};
  const movements = [];
  const lowStockAlerts = [];

  for (const [ingredientId, qtyNeeded] of requirementByIngredient) {
    const current = stockState[ingredientId];
    const newStock = round(current.stock - qtyNeeded);
    stockPatch[ingredientId] = { ...current, stock: newStock };

    movements.push({
      ingredientId,
      name: current.name,
      qty: -qtyNeeded,
      stockAfter: newStock,
      at: new Date().toISOString(),
    });

    if (current.reorderLevel > 0 && newStock <= current.reorderLevel) {
      lowStockAlerts.push({ ingredientId, name: current.name, stock: newStock, reorderLevel: current.reorderLevel });
    }
  }

  const total = resolvedLines.reduce((sum, l) => sum + l.lineTotal, 0);
  const order = {
    id: `local-${Date.now()}`,
    lines: resolvedLines,
    total,
    createdAt: new Date().toISOString(),
  };

  return { status: "success", order, stockPatch, movements, lowStockAlerts };
}

function round(n) {
  return Math.round(n * 1000) / 1000;
}

/**
 * Public entry point used by the UI. Either calls the real Cloud
 * Function, or runs the local simulation against the stock passed in.
 */
export async function processOrder({ outletId, lines, stockState }) {
  if (USE_CLOUD_FUNCTION) {
    const callable = httpsCallable(functions, "processOrder");
    const { data } = await callable({ outletId, lines });
    return data;
  }
  return simulateProcessOrder({ stockState, lines });
}

export { findMenuItem, findRecipeVersion };
