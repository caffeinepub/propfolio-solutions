# PropFolio Solutions

## Current State
New project. Empty Motoko backend and React frontend scaffold.

## Requested Changes (Diff)

### Add
- Landing page: hero, features (VRR/Emotion Control/Smart Hedge), live offers, pricing (MT4/MT5/cTrader plans), FAQ, footer
- Auth: user registration, login, password reset
- User dashboard: active subscriptions with expiry countdowns, software downloads, license key management, order history, support tickets, referral/affiliate earnings
- Admin dashboard: order management (approve/reject manual crypto payments), product manager (add/edit products, upload files), promotion engine (coupons, special offers), communication center (in-app notifications, bulk broadcast), support ticket management, crypto wallet address management, affiliate commission settings, cashout request approvals
- Licensing system: unique 16-character alphanumeric keys bound to platform type (MT4/MT5/cTrader) and account number slots; license validation API endpoint; renewal reminders
- Manual crypto payment gateway: admin-configurable BTC/ETH/USDT wallet addresses, user submits payment hash, admin approves
- Affiliate/referral system: user referral links, commission tracking (sale + renewal separately), earnings wallet, cashout requests (user selects crypto coin/network/address), admin sets min/max cashout limits, admin approves cashouts
- Product catalog: 3 platform variants (MT4/MT5/cTrader) with pricing tiers (PropLite/PropTrader/PropPro/PropEnterprise)

### Modify
- N/A (new project)

### Remove
- N/A

## Implementation Plan
1. Backend (Motoko): Users, Products, Orders, Licenses, SupportTickets, Affiliates, Notifications, CryptoWallets, CashoutRequests actors/types
2. Select components: authorization, blob-storage
3. Frontend pages: Landing, Auth (Login/Register/Reset), User Dashboard (Overview/Downloads/Licenses/Billing/Support/Referral), Admin Dashboard (Orders/Products/Promotions/Users/Support/Wallets/Commissions/Cashouts)
4. Landing page with all required sections using dark fintech theme
5. License key generation logic in backend
6. Affiliate tracking and earning calculation
