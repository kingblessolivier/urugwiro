# Urugwiro Luxury Design System & Advanced Architecture
**Standard**: Ultra-High-Net-Worth Individual (HNWI), Sovereign Investor & Private Wealth Interface  
**Version**: 2.0 (Executive Edition)

---

## 1. Advanced Color Tokens: The Psychology of High-Value Assets

Elite platforms do not use generic saturated primaries or flat washed-out grays. Instead, they leverage **metamorphic mineral tones**, **sovereign gold**, and **high-density contrast** that signal capital preservation, trust, and luxury.

### Core Mineral & Surface Tokens
| Token | Hex Code | Visual Sensation | Purpose / Application |
| :--- | :--- | :--- | :--- |
| `--color-obsidian-deep` | `#08090C` | Deep void charcoal (not harsh `#000`) | Global executive dark canvas, sidebar backdrop |
| `--color-obsidian-surface`| `#0E1117` | Smoked graphite | Primary dashboard cards, elevated panels |
| `--color-obsidian-card` | `#141822` | Polished onyx | Interactive cards, modal dialogs, data tables |
| `--color-obsidian-bevel` | `rgba(255, 255, 255, 0.07)` | Hairline crystal edge | 1px luxury container borders |
| `--color-alabaster-white` | `#FBFBF9` | Warm silk milk | High-net-worth public daylight showroom background |
| `--color-platinum-pure` | `#FFFFFF` | Flawless titanium | High-visibility text headings & luminous highlights |

### Prestige Accents: "Colors That Sell Themselves"
| Accent | Hex Code | Psychology | Application |
| :--- | :--- | :--- | :--- |
| **Champagne Gold** | `#C5A880` | Subtle wealth, private banking, discretion | Escrow verified badges, VIP client indicators, gold leaf borders |
| **Burnished Brass** | `#D4AF37` | Heritage, prestige, sovereign title deeds | High-priority actions, luxury badges, ROI metrics |
| **Imperial Emerald** | `#059669` / `#10B981` | Growth, Rwanda's 1000 hills, cryptographic trust | Verification clearance, active listings, positive telemetry |
| **Deep Forest Jade**| `#083324` | Sovereign stability, institutional vault | Soft background glows behind gold and emerald metrics |
| **Escrow Sapphire** | `#2563EB` / `#3B82F6` | Legal escrow fidelity, banking clearance | Escrow deposits, legal document sign-offs, wire settlements |
| **Titanium Slate** | `#64748B` / `#94A3B8` | Aerospace precision | Secondary metadata, labels, technical specifications |

---

## 2. Strict Iconography Standards: Zero Emojis Policy

> [!IMPORTANT]
> **Zero Emojis Mandate**: Emojis (e.g. 🏠, 🚗, 💰) degrade high-end platforms to amateur or spammy classifieds.
> All UI indicators must strictly use precision **geometric vector iconography** (Lucide React) styled with fine strokes.

### Iconography Rules:
1. **Stroke Weight**: Always use `strokeWidth={1.5}` for navigation and headers, and `strokeWidth={1.75}` for micro-badges.
2. **Sizing Hierarchy**:
   - Navigation: `size={18}` to `size={20}`
   - Data Table Actions / Status: `size={14}` to `size={16}`
   - Hero Stat Badges: `size={22}` to `size={24}`
3. **Paired Micro-Typography**: Icons must be paired with uppercase, tracked captions (`tracking-[0.18em] text-[10px] font-bold text-zinc-400 uppercase`).

---

## 3. Admin Command Center ("Wealth & Asset Cockpit") Architecture

The Admin Dashboard is designed not as a generic CMS table, but as a **Sovereign Operations & Escrow Cockpit**:

```
+------------------------------------------------------------------------------------------------+
|  URUGWIRO COMMAND  |  Kigali Central UTC+2  |  Total Under Custody: $28.4M USD  |  [Super Admin]  |
+------------------------------------------------------------------------------------------------+
|  SIDEBAR           |  EXECUTIVE TELEMETRY                                                      |
|  - Operations      |  +--------------------+  +--------------------+  +--------------------+   |
|  - Registry        |  | TOTAL ASSET VALUE  |  | ESCROW LOCKED      |  | SOVEREIGN TITLES   |   |
|  - Escrow & Offers |  | $28,450,000 USD    |  | $3,210,000 USD     |  | 48 UPIs Verified   |   |
|  - Trust Audit     |  | +14.2% MoM         |  | 12 Vault Holds     |  | 3 Pending RDB      |   |
|  - Inquiries       |  +--------------------+  +--------------------+  +--------------------+   |
|  - Concierge       |                                                                           |
|  - Intelligence    |  ASSET DISCOVERY & AUDIT REGISTRY               TRUST AUDIT LAUNCHPAD     |
|  - Config          |  +--------------------------------------------+  +----------------------+ |
|                    |  | Asset | Category | UPI / VIN | Price (USD) |  | RDB Land Deed Audit  | |
|  [Public Site]     |  | Nyarutarama Villa | House | Verified       |  | 3 Pending Approval   | |
|  [Lock Terminal]   |  | Bugesera Lakeside | Land  | UPI 1/02/...   |  | [Open Audit Deck ->] | |
|                    |  +--------------------------------------------+  +----------------------+ |
+------------------------------------------------------------------------------------------------+
```

### Key Functional Zones:
1. **Global Executive Header**: Real-time asset valuation, search with `⌘K`, instant link to Public Luxury Showroom, active admin session security badge.
2. **Four Telemetry Stacks**:
   - **Total Asset Value Under Management (AUM)**: Dual currency ($ USD / RWF) with month-over-month growth.
   - **Escrow Vault In-Transit**: Active deposits held securely in escrow awaiting title transfer.
   - **Sovereign Title Deed Pipeline**: Rwandan UPI land registrations and vehicle chassis validations.
   - **High-Net-Worth Diaspora Inquiries**: Direct private showings requested with concierge.
3. **Asset Registry Ledger**:
   - Monospaced numeric financial display (`font-mono`).
   - Category badges with distinct color indicators (House: Emerald; Land: Champagne Gold; Vehicle: Sapphire Blue).
   - Instant document inspection drawer for titles and 3D digital twins.
