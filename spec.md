# PropFolio Solutions

## Current State
Main backend canister (591 lines) handles all user/license/order/admin logic. A standalone `license_auth_service` micro-canister has been added to handle HTTP-based license verification independently, bypassing main canister memory/timeout constraints.

## Requested Changes (Diff)

### Add
- `src/license_auth_service/main.mo` -- standalone Motoko micro-canister
  - Own lightweight `licenseStore: Map<Text, LicenseRecord>`
  - `http_request` (query) upgrades POST to update
  - `http_request_update` handles POST /verify: parses JSON body, applies rate limiting, platform check, account-number locking, returns `{status, message}`
  - Admin endpoints: `syncLicense`, `removeLicense`, `resetAccountLock`, `setAdminToken`, `listLicenses` -- all protected by `adminToken`
  - Rate limiting: 5 failures per 15min window per IP and per license key
- `src/license_auth_service/canister.yaml` -- build config for the new canister
- Updated `icp.yaml` -- adds `src/license_auth_service` to canister list

### Modify
- `icp.yaml` -- added `- src/license_auth_service`

### Remove
- Nothing removed

## Implementation Plan
1. Write `src/license_auth_service/main.mo` with all logic above
2. Write `src/license_auth_service/canister.yaml` mirroring backend build config
3. Update `icp.yaml` to include the new canister
4. Deploy -- no changes to `main.mo` or frontend
