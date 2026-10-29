# Security Specification & Threat Model (3EATCRU Architecture)

## 1. Data Invariants

1. **Platform Super Admin (HQ Central)**:
   - Only authenticated users listed in `/admins/{adminId}` or with the bootstrapped admin email `madeinfavela89@gmail.com` with `email_verified == true` can modify `/hq_settings/*` and `/admins/*`.
2. **Store Tenant Isolation (OS Sphere)**:
   - Tenants (`/tenants/{tenantId}`) can only be updated by the store owner (`contactEmail == request.auth.token.email` or `admin`).
   - Subcollections under `/tenants/{tenantId}` (such as `products` and `orders`) strictly require that the caller has membership or administrative privilege over `tenantId`.
3. **Public Marketplace & Storefront (Consumer Sphere)**:
   - Public consumers can read public storefronts (`/tenants/{tenantId}`) and active catalog items (`availableOnline == true`).
   - Consumers can create orders (`/tenants/{tenantId}/orders/{orderId}`) with `status: 'pending'`, but cannot tamper with `tenantId`, pricing calculations, or mark them `completed`.
4. **Driver & Route Protection**:
   - Drivers can only accept and update routes assigned to them (`driverId == request.auth.uid`), modifying only permitted workflow states (`status: 'accepted' | 'at_store' | 'in_progress' | 'completed'`).
   - Unauthenticated users cannot read private telemetry or change route assignments.
5. **No Shadow Fields or Update Gaps**:
   - Every mutation must validate keys through strict schema validation and bounded string sizes.

---

## 2. The "Dirty Dozen" Malicious Payloads

1. **Payload 1 (Privilege Escalation - Admin Creation)**:
   - *Attempt*: Unauthenticated or regular user writes to `/admins/attacker_uid` setting `role: 'super_admin'`.
   - *Expected*: `PERMISSION_DENIED`.
2. **Payload 2 (Unverified Admin Email Spoofing)**:
   - *Attempt*: Authenticated token with `email: 'madeinfavela89@gmail.com'`, but `email_verified: false` attempting to update `/hq_settings/global`.
   - *Expected*: `PERMISSION_DENIED`.
3. **Payload 3 (Cross-Tenant Product Injection)**:
   - *Attempt*: Tenant B writes a product document to `/tenants/tenant_A/products/prod_hack` with `tenantId: 'tenant_B'`.
   - *Expected*: `PERMISSION_DENIED`.
4. **Payload 4 (Shadow Field Attack on Tenant)**:
   - *Attempt*: Store owner updates `/tenants/store1` injecting `{ "bypassBilling": true, "vipSecret": "xxx" }`.
   - *Expected*: `PERMISSION_DENIED` (`affectedKeys().hasOnly(...)` rejects unexpected keys).
5. **Payload 5 (Order State Hijack)**:
   - *Attempt*: Consumer creating an order directly with `status: 'completed'` and `total: 0.01` for high-value items.
   - *Expected*: `PERMISSION_DENIED` (only `status: 'pending'` permitted on consumer create).
6. **Payload 6 (Route Hijacking by Unauthorized Driver)**:
   - *Attempt*: Driver 2 updates `/delivery_routes/route_101` which is currently assigned to Driver 1.
   - *Expected*: `PERMISSION_DENIED`.
7. **Payload 7 (Path Traversal / ID Poisoning)**:
   - *Attempt*: Writing to `/tenants/../../global_hack` or using a 500-character malicious path ID.
   - *Expected*: `PERMISSION_DENIED` (guarded by `isValidId(id)`).
8. **Payload 8 (Terminal State Modification)**:
   - *Attempt*: Re-opening an order or route that is already in terminal state `status: 'completed'` or `'cancelled'`.
   - *Expected*: `PERMISSION_DENIED`.
9. **Payload 9 (Denial of Wallet - Bloated Payload)**:
   - *Attempt*: Injecting a 2MB string into `description` or `customerName`.
   - *Expected*: `PERMISSION_DENIED` (string sizes strictly capped to <= 128 / <= 500 characters).
10. **Payload 10 (Unauthorized Driver Telemetry Spoof)**:
    - *Attempt*: Client updates another driver's location ping or rating in `/drivers/{driverId}`.
    - *Expected*: `PERMISSION_DENIED`.
11. **Payload 11 (Blanket Collection Scraping)**:
    - *Attempt*: Querying all orders across all tenants without scoping by tenant.
    - *Expected*: `PERMISSION_DENIED`.
12. **Payload 12 (Direct Commission Tampering)**:
    - *Attempt*: Tenant updating `/tenants/{tenantId}` trying to reduce `serviceFeePercent` from 8% to 0%.
    - *Expected*: `PERMISSION_DENIED` (`serviceFeePercent` is immutable by tenant, only Super Admin can alter).

---

## 3. Test Runner Design

The security assertions are validated using `@firebase/rules-unit-testing` or by verifying that rules compile cleanly with zero open access policies and default-deny catch-all.
