# Documentation — Code Structure & How It Works

## Overview
This is a pure front‑end app with **no frameworks**. State is stored in `localStorage` and in memory.

### State
`transactions: Array<{ id, date, desc, category, amount, type }>`
- `type` is either `"income"` or `"expense"`.
- Stored under key `expense-tracker:transactions` in localStorage.

### Main Modules
- **Validation**: `validateForm()` checks required fields and positive amount, sets inline error messages.
- **Persistence**: `save()` writes state to localStorage; initial state loads from localStorage.
- **Summary**: `computeSummary()` recalculates totals and updates the 3 summary cards.
- **Filters & Sorting**:
  - Category filter (`#filterCategory`) is populated from existing categories.
  - Text search on description.
  - Sort by date or amount (asc/desc).
- **Rendering**:
  - `renderList()` builds `<tbody>` rows from filtered/sorted data.
  - `refreshCategoryFilters()` refreshes the category dropdown.
- **Editing & Deleting**:
  - Clicking **Edit** loads a transaction into the form and toggles buttons.
  - **Delete** removes a transaction after confirmation.
- **Chart**:
  - `renderChart()` aggregates expense totals per category and draws a **pie chart** if `window.Chart` exists.
- **Export/Import**:
  - **Export** saves `{ exportedAt, transactions }` as `transactions.json`.
  - **Import** validates basic schema then replaces current state.

## Data Flow
1. **Form Submit** → Validate → Create/Update transaction → Save → Recompute summary → Re-render list + chart.
2. **Filters/Search/Sort** → Re-render list only.
3. **Delete/Clear** → Update state → Save → Recompute summary → Re-render list + chart.

## Responsiveness
- CSS grid swaps 3‑column/2‑column sections to single column below 900px.
- Table container scrolls horizontally on small screens.

## Validation Details
- `required` attributes + custom checks.
- Inline `<small class="error">` elements per field show messages.
- Amount must be a number > 0.

## Extensibility Tips
- Add custom categories: insert `<option>` into `#txCategory` dynamically.
- Add monthly summary: group by `YYYY-MM` on the `date` field.
- Add currency setting: store a `currency` in localStorage and format with `Intl.NumberFormat`.
