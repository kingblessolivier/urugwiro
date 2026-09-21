# Urugwiro: Architectural Redesign & Entity Blueprint

This document defines the high-level structural redesign of Urugwiro. To transition from a "website" to a "Professional Real Estate Operating System," we must move from a flat listing model to a **Hierarchical Asset Model**.

## 1. The Core Philosophy: Asset vs. Listing
The fundamental flaw in most real estate systems is treating a "Listing" as the "Property." In a professional system:
- **The Asset**: Is the physical reality (The Land, The Building, The Room). It exists regardless of whether it is for sale.
- **The Listing**: Is the marketing layer. It is an "Offer" to sell or rent a specific Asset (or part of an Asset) at a specific price.

**Why this matters**: A hotel is one **Asset**, but it can have 50 **Listings** (one for each room for rent) AND one **Listing** for the entire business (for sale).

---

## 2. Entity Relationship Map

### 2.1 The User Ecosystem
We move beyond basic roles to a **Permission-Based Capability** model.

| Role | Primary Goal | Key "Tool" Needed |
| :--- | :--- | :--- |
| **System Admin** | Platform Integrity | Verification Workspace & System Telemetry |
| **Super Agent** | Portfolio Growth | Visit Kanban & Client Lead Intelligence |
| **Asset Owner** | Value Maximization | Performance Diagnostics & ROI Calculator |
| **Professional** | Service Delivery | Lead Generation & Certification Profile |
| **Investor/Buyer**| Asset Acquisition | Comparison Matrix & Investment Suite |
| **Tenant** | Living/Working | Maintenance Portal & Digital Lease Management |

### 2.2 The Asset Hierarchy (The "Tree")
To support Hotels, Apartments, and Malls, we implement a recursive hierarchy.

**Entity: `Asset`**
- `id` (UUID)
- `parent_asset` (FK to `Asset`, null for top-level) $\rightarrow$ *Allows: Building $\rightarrow$ Floor $\rightarrow$ Room*
- `asset_type` (Building, Floor, Unit, Land, Vehicle)
- `name` (e.g., "Kigali Heights", "Room 402")
- `area_sqm` (Decimal)
- `location_geometry` (GIS Point/Polygon)
- `address_details` (Province $\rightarrow$ District $\rightarrow$ Sector $\rightarrow$ Cell $\rightarrow$ Village)
- `is_active` (Boolean)

**Entity: `AssetSpec` (Polymorphic Specifications)**
Depending on the `asset_type`, the system loads different specs:
- **ResidentialSpec**: Bedrooms, Bathrooms, Balcony, Furnished (Bool).
- **CommercialSpec**: Zoning Type, Power Capacity (KVA), Loading Bay (Bool), Foot Traffic Score.
- **LandSpec**: Terrain, Road Access, Topography, Soil Type.
- **HotelSpec**: Star Rating, Total Rooms, Amenities (Pool, Gym, Spa), Occupancy Rate.
- **VehicleSpec**: Make, Model, Year, Mileage, Fuel Type, Transmission.

### 2.3 The Listing Layer (The "Offer")
**Entity: `Listing`**
- `asset` (FK to `Asset`)
- `owner` (FK to `User`)
- `listing_type` (Sale, Rent, Lease, Fractional)
- `price` (Decimal)
- `currency` (Default: RWF)
- `status` (Listed, Negotiation, Sold, Rented, Withdrawn)
- `description` (Text)
- `verification_level` (None $\rightarrow$ Submitted $\rightarrow$ Verified $\rightarrow$ Professional)
- `is_featured` (Boolean)

**Entity: `ListingMedia`**
- `listing` (FK)
- `file` (Image/Video/3D)
- `media_type` (Hero, Interior, Exterior, Drone, 360_Tour)
- `order` (Integer)

### 2.4 The Trust & Finance Engine
**Entity: `VerificationDocument`**
- `asset` (FK)
- `file` (PDF/Image)
- `doc_type` (Title Deed, ID, Business License, Tax Clearance)
- `status` (Pending, Approved, Rejected)

**Entity: `AuditLog`**
- `asset` (FK)
- `field` (e.g., "Price")
- `old_value` / `new_value`
- `changed_by` (User)
- `timestamp`

**Entity: `Lease` / `Contract`**
- `listing` (FK)
- `tenant` (User)
- `start_date` / `end_date`
- `rent_amount`
- `deposit`
- `contract_pdf` (File)
- `digital_signature` (Hash)

---

## 3. Visual Representation Strategy
To make the system intuitive for a user in Rwanda or a global investor:

1.  **The Asset Tree**: A visual hierarchy map. If you click "Kigali Heights (Building)", it expands to show "Floor 1", "Floor 2", and under "Floor 1", it shows "Unit 101", "Unit 102".
2.  **The Floor Plan Overlay**: For hotels/apartments, integrate a 2D/3D SVG map. Rooms change color based on status (Green = Available, Red = Rented, Blue = Sold).
3.  **The Trust Badge**: A gold-certified seal that, when hovered, shows exactly which documents were verified (e.g., "Title Deed verified by RLM").

---

## 4. Operational Endpoints Plan

### 4.1 Asset Management (Internal)
- `POST /api/assets/create`: Create a physical asset.
- `PATCH /api/assets/<id>/hierarchy`: Move a unit to a different floor/building.
- `GET /api/assets/<id>/tree`: Get the full hierarchy of an asset.

### 4.2 Discovery & Marketing (Public)
- `GET /api/listings/discover`: The Triple-Pane search engine.
- `GET /api/listings/<slug>/intelligence`: Returns the listing + AI valuation + local area insights.
- `POST /api/listings/<id>/offer`: Submit a professional offer.

### 4.3 Trust & Verification (Admin)
- `GET /api/trust/queue`: Get all pending verification documents.
- `POST /api/trust/review/<doc_id>`: Approve/Reject a document and trigger a `verification_level` update.
- `GET /api/trust/audit/<asset_id>`: Get the immutable history of an asset.

### 4.4 Command Center (Operational)
- `GET /api/ops/launchpad/<role>`: Get the personalized "My Day" data.
- `GET /api/ops/agent/pipeline`: Get the Visit Kanban data.
- `GET /api/ops/seller/diagnostics`: Get AI-driven listing improvement tips.

---

## 5. Monitoring & System Health
To ensure professional stability, we implement:
1.  **Event Stream**: A `SystemLog` model capturing every API call, Auth failure, and Critical change.
2.  **Performance Tracking**: Monitoring API response times for the Discovery Engine.
3.  **Trust Telemetry**: Tracking the time it takes from "Document Submitted" to "Verified" to optimize admin performance.
