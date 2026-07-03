/**
 * Cloud Functions for CK's Bakery POS.
 *
 * processOrder is the single write-path for a checkout. It mirrors the
 * "stock deduction detail" flow:
 *
 *   order confirmed
 *     -> consume recipe ingredients
 *     -> sufficient stock?  --yes--> deduct + log movement -> check reorder threshold -> (maybe) low stock alert
 *                            --no--> block sale, return which items are short
 *
 * Everything that touches stock happens inside one Firestore transaction,
 * so two counters selling the last unit of an ingredient at the same
 * moment can't both succeed.
 */

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

exports.processOrder = onCall(async (request) => {
  const { outletId, lines } = request.data;
  // lines: [{ type: "standard", menuItemId, qty } | { type: "customCake", recipeId, recipeVersion, weightKg, flavor, designNotes }]

  if (!outletId || !Array.isArray(lines) || lines.length === 0) {
    throw new HttpsError("invalid-argument", "outletId and at least one order line are required.");
  }

  const result = await db.runTransaction(async (tx) => {
    // 1. Resolve every line to its recipe version and the ingredients it needs.
    const resolvedLines = await Promise.all(
      lines.map((line) => resolveLine(tx, line))
    );

    // 2. Sum ingredient requirements across the whole order, then read
    //    current stock for each ingredient touched.
    const requirementByIngredient = new Map();
    for (const line of resolvedLines) {
      for (const req of line.ingredientRequirements) {
        const prev = requirementByIngredient.get(req.ingredientId) || 0;
        requirementByIngredient.set(req.ingredientId, prev + req.qty);
      }
    }

    const stockRefs = [...requirementByIngredient.keys()].map((ingredientId) =>
      db.doc(`outlets/${outletId}/stock/${ingredientId}`)
    );
    const stockSnaps = await Promise.all(stockRefs.map((ref) => tx.get(ref)));

    const stockByIngredient = new Map();
    stockSnaps.forEach((snap, i) => {
      stockByIngredient.set(stockRefs[i].id, { ref: stockRefs[i], data: snap.data() });
    });

    // 3. Sufficient stock? Check every requirement before writing anything.
    const insufficient = [];
    for (const [ingredientId, qtyNeeded] of requirementByIngredient) {
      const entry = stockByIngredient.get(ingredientId);
      const available = entry?.data?.stock ?? 0;
      if (available < qtyNeeded) {
        insufficient.push({ ingredientId, needed: qtyNeeded, available });
      }
    }

    if (insufficient.length > 0) {
      // Block sale. Nothing is written -- the transaction has no writes yet.
      return { status: "insufficient_stock", insufficient };
    }

    // 4. Deduct stock and write an immutable movement log entry per ingredient.
    const lowStockAlerts = [];
    for (const [ingredientId, qtyNeeded] of requirementByIngredient) {
      const entry = stockByIngredient.get(ingredientId);
      const newStock = entry.data.stock - qtyNeeded;
      const reorderLevel = entry.data.reorderLevel ?? 0;

      tx.update(entry.ref, {
        stock: newStock,
        updatedAt: FieldValue.serverTimestamp(),
      });

      const movementRef = db.collection(`outlets/${outletId}/stockMovements`).doc();
      tx.set(movementRef, {
        ingredientId,
        type: "sale_deduction",
        qty: -qtyNeeded,
        stockAfter: newStock,
        createdAt: FieldValue.serverTimestamp(),
      });

      // 5. Check reorder threshold on the post-deduction stock.
      if (reorderLevel > 0 && newStock <= reorderLevel) {
        lowStockAlerts.push({ ingredientId, stock: newStock, reorderLevel });
      }
    }

    // 6. Write the bill itself.
    const orderRef = db.collection(`outlets/${outletId}/orders`).doc();
    const total = resolvedLines.reduce((sum, l) => sum + l.lineTotal, 0);
    tx.set(orderRef, {
      lines: resolvedLines.map(({ ingredientRequirements, ...rest }) => rest),
      total,
      createdAt: FieldValue.serverTimestamp(),
    });

    return { status: "success", orderId: orderRef.id, total, lowStockAlerts };
  });

  return result;
});

async function resolveLine(tx, line) {
  if (line.type === "standard") {
    const itemSnap = await tx.get(db.doc(`menuItems/${line.menuItemId}`));
    if (!itemSnap.exists) {
      throw new HttpsError("not-found", `Menu item ${line.menuItemId} not found.`);
    }
    const item = itemSnap.data();
    return {
      type: "standard",
      menuItemId: line.menuItemId,
      name: item.name,
      qty: line.qty,
      unitPrice: item.price,
      lineTotal: item.price * line.qty,
      // Standard items consume pre-made stock directly (1 unit of the
      // item == 1 unit of its own ingredient record).
      ingredientRequirements: [{ ingredientId: item.stockIngredientId, qty: line.qty }],
    };
  }

  if (line.type === "customCake") {
    const versionSnap = await tx.get(
      db.doc(`recipes/${line.recipeId}/versions/${line.recipeVersion}`)
    );
    if (!versionSnap.exists) {
      throw new HttpsError("not-found", "Recipe version not found.");
    }
    const recipe = versionSnap.data();
    const lineTotal = recipe.costPerKg * line.weightKg * (recipe.markupMultiplier ?? 1);

    return {
      type: "customCake",
      recipeId: line.recipeId,
      recipeVersion: line.recipeVersion,
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

  throw new HttpsError("invalid-argument", `Unknown line type: ${line.type}`);
}
