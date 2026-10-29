# HQ Pro Driver Management & Automatic Route Dispatcher (Max 3 Orders)

An advanced administrative and operational control center for executive logistics management, featuring real-time geodetic map tracking, automated proximity-based batching (capped at 3 orders per route), and semi-automated dispatch workflows.

## User Review & Critical Decisions

> [!IMPORTANT]
> Based on your clarifying choices, the system will implement proximity-based clustering for route batching, a real-time interactive map and active route feed as the core HQ dashboard view, and a semi-automated dispatch approval workflow.

- **Confirmed Decision 1**: Proximity clustering algorithm groups nearest delivery waypoints automatically.
- **Confirmed Decision 2**: Maximum of 3 orders per route batch to ensure optimal delivery times and driver payload balance.
- **Confirmed Decision 3**: Semi-automated workflow where HQ reviews and approves auto-bundled 3-order routes before final dispatch.

---

## 1. Overview & Core Concept

- **What It Does**: Provides HQ administrators and store managers with a professional SaaS dashboard (`HQ Pro`) to monitor driver shifts, inspect real-time fleet GPS coordinates, and automatically cluster pending delivery orders into optimized routes of up to 3 stops.
- **Target Audience / Persona**: Logistics coordinators, fleet managers, and executive store owners.
- **Key Value**: Eliminates manual route planning, prevents driver overload by capping batches at 3 orders, and guarantees real-time visibility across the entire regional delivery network.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **HQ Pro Dashboard Entry**: Executive command center showing active drivers, online POS devices, regional revenue, and real-time alerts.
  2. **Automatic Batching Engine**: HQ clicks "Auto-Batch Pending Orders", and the system clusters unassigned delivery orders by geographic proximity into batches of up to 3 orders.
  3. **Semi-Automated Dispatch**: HQ reviews the proposed 3-order route (total distance, payout, waypoints) and clicks "Approve & Dispatch" or adjusts waypoints.
  4. **Live Geodetic Map Feed**: Real-time tracking of dispatched drivers and store delivery radii using OpenFreeMap tiles and interactive markers.
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Utilitarian SaaS enterprise console (Dark warm slate canvas `#0f0a07`, rich amber/bronze structural surfaces, emerald success indicators).
  - *Color Palette & Mood*: Dominant deep charcoal/amber slate `#1d1008`, warm parchment cards `#faf7f0` or `#2a160b`, amber-500 accent for primary actions.
  - *Typography & Hierarchy*: Plus Jakarta Sans / Inter for clean scannability, JetBrains Mono / tabular-nums for telemetry and financial figures.
  - *Component Styling & Layout*: High-density data tables, single-elevation cards, clean unboxed metadata separators (`·`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1**: 3-Order Route Hard Cap
  - *Chosen Approach*: Enforce a strict maximum of 3 waypoints per auto-bundled route.
  - *Why*: Balances driver earnings with food/retail delivery freshness and vehicle capacity.
- **Decision 2**: Semi-Automated Approval
  - *Chosen Approach*: System auto-generates batches, but requires HQ confirmation.
  - *Why*: Prevents incorrect automated dispatches and gives logistics managers final operational control.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                 EcosystemService (Signals)                  │
│   (Orders, Drivers, DeliveryRoutes, Tenants, AuditLogs)     │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐┌─────────────────────────────┐
│   HQProDashboardComponent    ││     DriversWindowComponent  │
│  - Proximity Clustering (3)  ││  - Shift Management         │
│  - Semi-Automated Dispatch   ││  - Driver Payouts           │
│  - Live Map Feed (Leaflet)   ││  - Clock-in / Clock-off     │
└──────────────────────────────┘└─────────────────────────────┘
```

- **Data Model & State**: Extends `DeliveryRoute` and `StoreDriver` entities in `ecosystem.model.ts`. Adds auto-batching algorithms in `EcosystemService`.
- **Interactive Component & State Mapping**:
  - Auto-batch button triggers `autoClusterPendingOrders()` producing routes $\le 3$ orders.
  - Dispatch button updates route status to `accepted` or `at_store` and assigns driver.
  - Map view updates dynamically via Leaflet layers on signal changes.
