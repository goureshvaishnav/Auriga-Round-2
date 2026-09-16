# GiftPool — Contribution & Settlement Tracker

GiftPool is a Vite + React app that helps a group calculate fair contributions, track payments, and automatically generate a settlement plan for shared expenses such as farewell gifts, team events, or group purchases.

## Features

- Pool setup with gift name and target amount
- Add, remove, and update member contributions
- Automatic fair-share calculation
- Dashboard summary cards for target, collected, remaining, and member count
- Progress indicator with over-target handling
- Balance table showing who owes, is settled, or should receive money
- Settlement plan generation with debtor-to-creditor transfers
- LocalStorage persistence across refreshes
- Responsive layout for desktop and mobile screens

## Tech Stack

- React
- Vite
- JavaScript
- CSS
- Browser localStorage

## Requirements

- Node.js 18+
- npm

## Installation

```bash
npm install
```

## Run the app

```bash
npm run dev
```

## Production build

```bash
npm run build
```

## Preview production build

```bash
npm run preview
```

## How to use

1. Set the gift name and target amount.
2. Add each member participating in the pool.
3. Enter each member's total paid amount.
4. Review the fair share, collected total, remaining amount, and balances.
5. Use the generated settlement plan to settle with the correct debtor/creditor matches.

## Settlement calculation explanation

The app calculates each member's balance as:

balance = paid - fairShare

- Positive balance: member has paid extra and should receive money
- Negative balance: member still owes money
- Zero balance: member is settled

The settlement generator then matches debtors and creditors using the minimum of the owed and receivable amounts until every balance is resolved.

## Local storage information

The pool is stored in browser localStorage under the key `giftPool`.

The saved object includes:

- name
- targetAmount
- members

Derived values such as fair share and balances are recalculated dynamically from the stored data instead of being saved redundantly.

## Debugging and troubleshooting

- If the app looks blank, verify the project dependencies were installed with `npm install`.
- If the page does not update, check the browser console for runtime errors.
- If localStorage is not persisting, ensure the app is running in a browser context rather than a non-browser environment.
- If the build fails, confirm you are using Node.js 18 or newer and rerun `npm install`.

## Project structure

```text
src/
  App.jsx
  main.jsx
  index.css
  components/
    BalanceTable.jsx
    Dashboard.jsx
    MemberForm.jsx
    MemberList.jsx
    PoolSetup.jsx
    SettlementList.jsx
  utils/
    calculations.js
    storage.js
vite.config.js
index.html
package.json
README.md
REASONING.md
AI_LOGS.md
```

## Future improvements

- Add per-payment history entries instead of a single total paid amount
- Export settlement details as PDF or CSV
- Support multiple currencies and locale presets
- Add editing of member names after creation
- Add data reset confirmation modal

---

This project was built as a practical challenge app and keeps the logic simple, transparent, and easy to review.
