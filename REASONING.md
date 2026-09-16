# Reasoning

## 1. Problem understanding

The application is meant to manage a shared collection for a gift or farewell expense where participants may contribute varying amounts. The core challenge is to calculate a fair equal share, compare it to each person's actual contribution, and then generate a minimal settlement plan so the group ends in a balanced state.

## 2. Requirements derived from the problem

The app must support:

- a configurable gift name and target amount
- any number of members
- each member's total paid amount
- fair-share calculation for the entire group
- balance tracking for each member
- target progress calculations
- settlement generation based on real balances rather than the full target again
- browser persistence for refresh recovery

## 3. Assumptions

- A single total paid value per member is sufficient for this challenge.
- Currency is fixed to INR for the front-end experience.
- Payment amounts are non-negative numbers.
- The app is a front-end-only solution, with all state kept locally in the browser.

## 4. User flow

1. The user enters the gift name and target amount.
2. The user adds members.
3. The user enters each member's paid amount.
4. The app dynamically recalculates fair share, totals, remaining amount, and balances.
5. The app shows the settlement plan for any members who owe or should receive money.
6. The browser stores the state automatically and reloads it on future visits.

## 5. Data model

The main persisted object is:

```js
giftPool = {
  name,
  targetAmount,
  members: [
    { id, name, paid }
  ]
}
```

The app avoids storing derived values such as balance or settlement plan, because those can be computed from the current members and target value.

## 6. Fair-share calculation

The fair share is calculated as:

$$
\text{fairShare} = \frac{\text{targetAmount}}{\text{numberOfMembers}}
$$

If the target amount is zero or there are no members, the fair share is treated as zero.

## 7. Balance calculation

Each member's balance is:

$$
\text{balance} = \text{paid} - \text{fairShare}
$$

Interpretation:

- balance > 0: receives money
- balance < 0: owes money
- balance = 0: settled

## 8. Settlement algorithm

The settlement algorithm:

1. Collect all members with negative balances as debtors.
2. Collect all members with positive balances as creditors.
3. Match the debtor and creditor lists.
4. Transfer the smaller of the two values, as the next payment.
5. Repeat until all balances are resolved.

This ensures that money is transferred only between members who actually need it and only for the amount needed to reach each person's fair share contribution.

## 9. Edge cases

The app explicitly handles:

- no members
- one member
- no payments
- exact target reached
- target exceeded
- target not reached
- invalid or negative targets
- negative payments
- empty member names
- removing members
- target changes that alter fair share recalculation

## 10. Technology decisions

- React was chosen because the app is a small front-end dashboard with shared state.
- Vite was chosen for a fast and simple modern build tool.
- JavaScript was used because the brief explicitly required it.
- CSS is kept component-focused and readable rather than using a larger styling system.
- localStorage is used to persist data without introducing a backend.

## 11. UI/UX decisions

- A single-page dashboard keeps the app easy to understand.
- Cards provide clear spacing and hierarchy for summary values.
- Tables make member balances readable and quick to scan.
- Minimal color-coding communicates status without overcomplicating the UI.
- Responsive layout ensures usability on both desktop and mobile.

## 12. Future improvements

- Support multiple payment entries per person rather than one lump-sum amount
- Allow editing member names after creation
- Add CSV/PDF export for the settlement plan
- Add loading and validation states for more polished UX
- Support multi-currency configuration

## 13. Implementation notes

This app intentionally does not claim features that were not built. The current implementation focuses on a single total contribution per member, fair-share analysis, and a simple settlement plan generator suitable for the challenge scope.
