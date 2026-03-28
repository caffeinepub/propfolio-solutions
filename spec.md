# PropFolio Solutions

## Current State
Phases 1–4 are complete. The backend has products, orders, licenses, coupons, combos, and lifetime pricing. The Products page wires to the backend. No trial-related logic exists anywhere.

## Requested Changes (Diff)

### Add
- Backend: `productTrialSettings` store (Map<Nat, {trialEnabled, trialDurationDays}>) — separate from Product type to avoid stable var issues
- Backend: `trialUsedStore` (Map<Principal, Bool>) — tracks one trial per Principal ID
- Backend functions:
  - `setProductTrialSettings(productId, trialEnabled, trialDurationDays)` — admin only
  - `getAllProductTrialSettings()` — public, returns all trial configs
  - `hasCallerUsedTrial()` — query, returns bool for caller
  - `markTrialUsed()` — shared, records trial claim for caller
  - `resetUserTrial(principalText)` — admin only, clears trial flag
  - `getUsersWhoUsedTrial()` — admin only, returns list of Principal texts
- Frontend: Admin > Products — add "Enable Trial" toggle and "Trial Duration (days)" field per product
- Frontend: Admin > Users (or Users section in Settings) — show trial flag per user, with Reset Trial button
- Frontend: Products Page — show "Free Trial" badge/button on trial-enabled products; if user already used trial, show "You have already used your free trial" and disable trial option
- Frontend: Checkout modal — if order amount is $0 (trial), call `markTrialUsed()` before/after `createOrder`; check `hasCallerUsedTrial()` on load and block trial flow if already used

### Modify
- `backend.d.ts` — add new trial function signatures

### Remove
- Nothing

## Implementation Plan
1. Add trial stores and functions to `src/backend/main.mo` (isolated additions, no changes to existing types)
2. Update `src/frontend/src/backend.d.ts` with new trial function types
3. Update Admin > Products (`AdminProducts.tsx`) to include trial toggle + duration field
4. Update Products Page (`ProductsPage.tsx`) to show trial option and enforce one-trial-per-user
5. Update Checkout modal (`CheckoutModal.tsx`) to call `markTrialUsed()` on $0 trial orders
6. Add trial usage visibility in admin (Admin > Users section or Settings)
