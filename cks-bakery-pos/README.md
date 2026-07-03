# CK's Bakery POS

A React + Firebase point-of-sale scaffold implementing the order flow we
diagrammed: billing screen → standard item or custom cake → recipe version
lookup → cloud function (stock deduction) → Firestore stock update → bill,
with the reorder-threshold / low-stock branch built into the same
transaction.

Runs immediately with `npm install && npm run dev` — no Firebase project
required. Stock and orders are simulated in-memory using the exact same
logic that `functions/index.js` runs for real once you deploy.

## File structure

```
cks-bakery-pos/
├── firestore.rules            # Security rules: clients read, only Cloud
│                               # Functions write stock/orders
├── firebase.json
│
├── functions/                 # Real, deployable backend
│   ├── package.json
│   └── index.js                # processOrder: the atomic transaction —
│                                # consume recipe -> check stock -> deduct
│                                # + log movement -> check reorder threshold
│
└── src/
    ├── main.jsx
    ├── App.jsx                 # Wires providers + screens together
    ├── index.css
    │
    ├── firebase/
    │   └── config.js           # Firebase init; no-ops until .env.local is set
    │
    ├── data/
    │   └── sampleMenu.js       # Seed data: outlets, menu items, immutable
    │                            # recipe versions, starting outlet stock
    │
    ├── context/
    │   ├── OutletContext.jsx   # Current outlet's stock + movement log
    │   └── CartContext.jsx     # Cart lines, checkout, bill/alert state
    │
    ├── services/
    │   └── orderService.js     # Client-side mirror of functions/index.js —
    │                            # same resolve -> check -> deduct steps,
    │                            # run locally or via httpsCallable
    │
    ├── components/
    │   ├── billing/
    │   │   ├── BillingScreen.jsx
    │   │   ├── ItemGrid.jsx         # Standard menu items
    │   │   ├── CustomCakeModal.jsx  # Weight, flavor, design notes -> price
    │   │   └── CartPanel.jsx        # Order lines, checkout, stock warnings
    │   ├── stock/
    │   │   ├── StockPanel.jsx       # Outlet stock table
    │   │   ├── StockStatusBadge.jsx
    │   │   └── LowStockAlert.jsx    # Reorder-threshold banner
    │   └── bill/
    │       └── BillReceipt.jsx      # Generated bill after checkout
    │
    └── utils/
        └── format.js
```

## Running the demo

```
npm install
npm run dev
```

Try it end to end:
1. Add a few standard items, or click **+ Custom cake** and price out a
   vanilla or chocolate truffle cake by weight.
2. Checkout — stock deducts, a movement log entry is recorded, and a bill
   appears.
3. `ing-flour` starts near its reorder level in the seed data
   (`src/data/sampleMenu.js`) — add a custom cake or two and you'll see the
   low-stock banner fire from the same transaction that deducted stock.
4. Click **View stock** to see current levels per ingredient/item.
5. Try ordering more bread loaves than are in stock to see the
   insufficient-stock path block the sale with no partial deduction.

## Connecting to real Firebase

1. `cp .env.example .env.local` and fill in your Firebase web config.
2. Seed Firestore with the same shape as `src/data/sampleMenu.js`:
   `menuItems/{id}`, `recipes/{id}/versions/{version}`,
   `outlets/{outletId}/stock/{ingredientId}`.
3. Deploy the backend:
   ```
   firebase deploy --only functions,firestore:rules
   ```
4. Set `VITE_USE_CLOUD_FUNCTION=true` in `.env.local`. The UI code doesn't
   change — `orderService.processOrder` switches from the local simulation
   to `httpsCallable(functions, "processOrder")` automatically.

## Extending toward the full ERP

This scaffold covers the billing → stock deduction flow end to end. Not yet
included, but the data model is shaped to support it: multi-outlet outlet
switching (the `outlets` array already supports more than one), role-based
Firestore rules keyed off a `staff/{uid}.outletId` doc (see
`firestore.rules`), and an admin UI for writing new immutable recipe
versions (currently seeded directly in `sampleMenu.js`).
