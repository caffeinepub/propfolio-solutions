# PropFolio Solutions

## Current State
- Full SaaS platform with admin panel (Overview, Orders, Products, Promotions, Wallets, Affiliates, Support)
- Admin auth via username/password at `/admin-login` using Ed25519 seed derived from credentials
- Backend has: products, orders, licenses (auto-generated on order approval), user profiles, blob storage
- No Admin Settings tab exists currently
- No license management UI (admin can't view/edit/revoke/extend/manually generate licenses)
- No site settings storage
- No downloadable files management (admin upload / user download)
- Wallets stored in localStorage only

## Requested Changes (Diff)

### Add
- **Admin Settings page** at `/admin/settings` with 4 tabs:
  1. **Admin Accounts** -- list all admin accounts, create new (username+password), change password, delete
  2. **License Management** -- table of all licenses with revoke/extend expiry/reassign actions; button to manually generate a license key and assign to any user by principal or email
  3. **Site Settings** -- site name, tagline, contact email, support email, maintenance mode toggle, social links (Twitter, Telegram, Discord, YouTube)
  4. **Payment Gateway** -- accepted coins toggle (BTC/ETH/USDT/LTC), wallet address per coin, payment instructions text
- **File Management tab** in Admin Settings (or separate `/admin/files` page):
  - Admin uploads files/PDFs using blob-storage, assigns name, category (General / Per Product), optional description
  - Table of uploaded files with delete option
- **User Downloads page update** -- show admin-uploaded files section; users can download files (all general files + product-specific files matching their active licenses)
- **Settings nav item** added to AdminDashboard sidebar
- **Files nav item** added to AdminDashboard sidebar
- New backend functions:
  - `getAllLicenses()` -- admin only
  - `revokeLicense(id)` -- admin only, sets status to Revoked
  - `extendLicense(id, days)` -- admin only, extends expiry
  - `reassignLicense(id, newUser)` -- admin only
  - `manuallyGenerateLicense(userId, productId, days)` -- admin only, creates license without order
  - `getSiteSettings()` / `saveSiteSettings(settings)` -- admin write, public read
  - `getAdminAccounts()` / `createAdminAccount(username, principalText)` / `deleteAdminAccount(principal)` -- admin only
  - `getDownloadableFiles()` -- public read
  - `saveDownloadableFile(file)` / `deleteDownloadableFile(id)` -- admin only

### Modify
- `AdminDashboard.tsx` -- add Settings and Files nav items with icons
- `Downloads.tsx` -- add section showing admin-uploaded downloadable files
- Payment Gateway settings moved from AdminWallets to Settings > Payment Gateway tab (AdminWallets kept as-is or merged)

### Remove
- Nothing removed

## Implementation Plan
1. Update Motoko backend with new functions: getAllLicenses, revokeLicense, extendLicense, reassignLicense, manuallyGenerateLicense, getSiteSettings, saveSiteSettings, getDownloadableFiles, saveDownloadableFile, deleteDownloadableFile, admin account management
2. Regenerate backend bindings (backend.d.ts, backend.ts, backend.did.js)
3. Add Settings page with 4 tabs (Admin Accounts, License Management, Site Settings, Payment Gateway)
4. Add Files page (admin upload via blob-storage, list, delete)
5. Update Downloads page to show admin-uploaded files
6. Add Settings + Files nav items to AdminDashboard sidebar
7. Add useQueries hooks for new backend calls
