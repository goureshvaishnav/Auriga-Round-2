# GiftPool

## Contribution & Settlement Tracker

GiftPool is a polished, client-side React application for organising shared gift contributions. Set a target, record what each person has paid, review fair-share balances, and generate a clear settlement plan without a backend or account setup.

The application is designed for farewell gifts, team celebrations, group purchases, and any shared contribution where the final amounts should be transparent.

## Highlights

- Create a pool with a gift name and target amount
- Add, remove, and update contributors
- Import messy contribution CSV files with a reviewable cleaning report
- Normalize names, parse Indian currency formats, reject invalid rows, and merge valid payments
- Calculate each member's fair share automatically
- Track target, collected, remaining, and member totals
- View contribution balances with clear status badges
- Generate debtor-to-creditor settlement transactions
- Download a professional PDF receipt containing the current pool summary, contribution table, and settlement plan
- Persist pool data in browser localStorage
- Persist the selected Light or Dark theme across sessions
- Use Indian currency formatting with a permanent visual `₹` prefix for money inputs
- Responsive layout for desktop, tablet, and mobile screens

## Product experience

GiftPool uses two intentionally distinct visual themes:

- **Light Mode:** bright white surfaces, soft lavender and blue backgrounds, colorful gradients, and lightweight financial cards
- **Dark Mode:** deep charcoal and navy surfaces, readable contrast, dark inputs and tables, and restrained violet-blue accents

Both themes share the same data and calculations. Switching themes never changes pool values or stored data.

## Technology

- React 18
- Vite 5
- JavaScript (ES modules)
- CSS with theme tokens and responsive media queries
- `lucide-react` for interface icons
- `jspdf` for client-side PDF receipt generation
- Browser `localStorage` for persistence

There is no backend, authentication layer, database, or server-side API.

## Requirements

- Node.js 18 or newer
- npm

## Getting started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Using GiftPool

1. Enter the pool or gift name and target amount.
2. Add everyone contributing to the pool.
3. Enter each member's total paid amount.
4. Review collection progress, fair share, balances, and contribution statuses.
5. Optionally upload a CSV from **Import Contributions** and review the preview before committing cleaned records.
6. Use the settlement plan to see who should pay whom and how much.
7. Select **Download Receipt** to save a print-friendly `GiftPool-Receipt.pdf` containing the current data.

The receipt is generated entirely in the browser. It is a clean document-style PDF rather than a screenshot of the dashboard, making it suitable for printing or sharing by email and messaging apps.

The receipt is disabled until at least one member has been added. It includes the pool name, generation date and time, target, collected total, remaining amount, member count, fair share, contribution table, settlement plan, and final status.

### Import cleaning rules

The importer expects `Name` and `Amount` columns, but accepts common aliases such as `Member`, `Paid`, and `Contribution`. It supports values such as `1,500`, `₹1,500`, `Rs. 1500`, `INR 1500`, and `1.5k`.

A standard import file looks like this:

```csv
Name,Amount
Rahul Sharma,1500
Amit,"₹1,000"
Rohit,"2,000"
```

The **Import Preview** shows row counts and expandable details for imported, de-duplicated, merged, and rejected records. Select **Import Cleaned Data** only after reviewing the report. The cleaned totals are then added to the existing pool, and the normal dashboard, balance, settlement, and receipt views update automatically.

- Names are compared case-insensitively after trimming, collapsing spaces, and normalizing minor separators.
- Rows with the same normalized name and amount are treated as repeated copies and de-duplicated. This is an explicit assumption shown in the import report because identical rows may otherwise be impossible to distinguish.
- Different valid amounts for the same normalized name are treated as separate payments and merged into one member total.
- Missing names, missing amounts, zero or negative amounts, and non-numeric amounts are rejected with their row number and reason.
- Every accepted, de-duplicated, merged, and rejected row remains visible in the report. The cleaned result is only added after selecting **Import Cleaned Data**.

## Calculation model

For each member, GiftPool calculates:

```text
fairShare = targetAmount / memberCount
balance = paid - fairShare
```

Balance status is interpreted as follows:

- Positive balance: the member paid extra and should receive money
- Negative balance: the member still owes money
- Zero balance: the member is settled

The settlement planner matches members who owe money with members who should receive money. Each transfer uses the smaller outstanding amount, continuing until all possible debtor-creditor balances are resolved.

All derived values are recalculated from the current pool state. They are not stored redundantly.

## Persistence

The current pool is stored in browser localStorage under:

```text
giftPool
```

The stored pool contains:

- `name`
- `targetAmount`
- `members`

The selected theme is stored separately under:

```text
giftpool-theme
```

Use **Reset pool** in the application to clear the saved pool and return to the default state. Data is local to the browser and is not uploaded anywhere.

## Project structure

```text
src/
  App.jsx                    Application state and feature composition
  main.jsx                   React entry point
  index.css                 Theme system and responsive UI styles
  components/
    BalanceTable.jsx         Contribution balances and statuses
    Dashboard.jsx            Summary cards, progress, and receipt action
    ImportContributions.jsx  CSV upload, preview, and cleaning report
    MemberForm.jsx           Add-member form
    MemberList.jsx           Member payments and removal controls
    MoneyInput.jsx            Reusable INR input
    PoolSetup.jsx             Pool details and target amount
    SettlementList.jsx        Settlement transactions
  utils/
    calculations.js           Fair share, balances, progress, and settlement logic
    importContributions.js    CSV cleaning, name normalization, and amount parsing
    receipt.js                Client-side PDF receipt generation
    storage.js                localStorage persistence
vite.config.js
index.html
package.json
README.md
```

## Validation and troubleshooting

Run the production build after changes:

```bash
npm run build
```

If the application does not start:

- Confirm Node.js 18+ is installed.
- Run `npm install` again.
- Check the browser console for runtime errors.
- Confirm localStorage is available in the browser context.

If the receipt does not download, check that the browser allows downloads for the local development origin and that at least one member exists.

## Design principles

GiftPool keeps its business logic deliberately small and transparent. Financial values remain numeric in application state, formatting happens at the presentation boundary, and all calculations are derived from the current pool data. The UI can evolve independently without changing settlement behavior or persistence contracts.
