# PropFolio Solutions

## Current State
- Admin login page has `useState("admin")` which pre-fills "admin" in the username field
- "Add Admin" form in AdminSettings requires manually entering a raw Principal ID (users don't know how to get this)
- No "Change My Credentials" section exists for the current admin to migrate their own username/password
- `removeAdminAccount` prevents removing your own account, so self-migration is blocked
- No backend function to atomically transfer admin principal from old credentials to new ones

## Requested Changes (Diff)

### Add
- Backend: `transferAdminPrincipal(newUsername: Text, newPrincipalText: Text)` — caller must be admin, atomically adds new principal as admin AND removes caller (the old principal) from admin. Updates adminAccountStore accordingly.
- AdminSettings: "Change My Credentials" section — enter new username + password, derives Principal via SHA-256 hash in browser, calls `transferAdminPrincipal` to atomically swap to new credentials. Shows clear instructions.
- AdminSettings: "Add Admin" form now takes username + password fields (not raw Principal ID) — derives Principal automatically from SHA-256(username:password) hash, same algorithm as login

### Modify
- AdminLogin.tsx: change `useState("admin")` to `useState("")` so username field is blank by default
- AdminSettings AdminAccountsTab: replace "Principal ID" input field with "Password" input field; derive Principal from username+password hash before calling addAdminAccount
- backend.d.ts and backend.ts: add `transferAdminPrincipal` method

### Remove
- Nothing to remove (Default Credentials box is already absent from current AdminLogin.tsx code)

## Implementation Plan
1. Add `transferAdminPrincipal(newUsername: Text, newPrincipalText: Text)` to src/backend/main.mo — authorized caller only, removes caller from admin roles and adminAccountStore, adds new principal as admin
2. Update backend.d.ts to add the new function signature
3. Update backend.ts to add the implementation shim
4. Update declarations/backend.did.d.ts and backend.did.js to reflect the new function
5. Fix AdminLogin.tsx: `useState("")` instead of `useState("admin")`
6. Fix AdminSettings.tsx AdminAccountsTab: replace Principal ID field with Password field, derive Principal using SubtleCrypto SHA-256 before calling addAdminAccount
7. Add "Change My Credentials" section in AdminSettings.tsx that derives new Principal and calls transferAdminPrincipal
