# 3EATCRU Enterprise Architecture Specification (Tripartite Model)

**Author**: Senior Software Engineering & Architecture Team  
**System**: 3EATCRU Multi-Sphere Gastronomic Ecosystem  
**Version**: 5.0.0-PREMIUM  

---

## 1. The Tripartite Governance Model

The system is architected into three strictly isolated spheres. This separation is non-negotiable and ensures that administrative complexity at the platform level does not interfere with store operations or the consumer experience.

### Sphere 1: HQ Central (The App Owner / Platform Founder)
*   **User**: The SaaS Developer / App Owner.
*   **Objective**: Manage the platform as a business.
*   **Core Features**:
    *   **Tenant Provisioning**: Real-time creation of new store database entries and license keys.
    *   **MDM (Mobile Device Management)**: Remote heartbeat monitoring, locking, and updating of physical POS hardware.
    *   **Economic Governance**: Monitoring the 8% ecosystem split and managing global payout ledgers.
    *   **Global Broadcast**: High-priority alert system that pushes notifications to all active OS terminals simultaneously.

### Sphere 2: Store OS (The Merchant / Registered Store)
*   **User**: The Store Owner and their employees.
*   **Objective**: Day-to-day operations and unit administration.
*   **Core Features**:
    *   **Gabinete do Proprietário (Admin Hub)**: A dedicated executive module for the merchant to manage *their* unit. This includes local security (biometrics), subscription status, and terminal fleet overview.
    *   **Operational Suite**: Mission-critical tools like PDV (POS), KDS (Kitchen Display), and Inventory ERP.
    *   **Omnichannel Hub**: Centralized intake for WhatsApp, iFood, and Instagram orders.

### Sphere 3: Public Marketplace (The Consumer)
*   **User**: End Consumers.
*   **Objective**: Frictionless discovery and ordering.
*   **Core Features**:
    *   **Regional Discovery**: Proximity-based search using Haversine geodetic distance calculations.
    *   **Custom Vitrines**: Each store maintains a customizable public presence ("Minha Loja") managed directly from their Store OS.

---

## 2. Infrastructure & Real-time Simulation

The system simulates a high-performance distributed architecture:
-   **Zoneless Signal State**: All spheres react in real-time to changes in the `EcosystemService`.
-   **Maintenance Lockout**: A global flag in HQ Central can instantly transition all OS terminals to a "System Update" state for critical maintenance.
-   **Telemetria Global**: The HQ monitors API latency, DB throughput, and active user sessions to ensure platform stability.

---

## 3. Security & Audit Integrity

Every interaction across all three spheres is logged in the **Master Audit Ledger**. 
-   **Level 1 (Info)**: Operational logs (Order created, Product updated).
-   **Level 2 (Warning)**: Sensitive actions (Admin login, Commission change, Manual stock override).
-   **Level 3 (Critical)**: Security events (Device locked, License revoked, Global broadcast).

---

## 4. Visual Identity & UX Principles

-   **Artistic Tailwind**: Use of carbon textures, parchment/leather themes for OS, and high-tech glow for HQ.
-   **Premium Assets**: Mission-critical admin modules use high-fidelity generated icons to distinguish them from standard operational tools.

