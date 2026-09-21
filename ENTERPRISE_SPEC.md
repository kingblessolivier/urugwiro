# Urugwiro: Enterprise Architectural Specification (v1.0)

This document serves as the definitive technical authority for the Urugwiro platform. It moves beyond conceptual design into **Engineering Specifications**, defining the exact data structures, state transitions, and API contracts required for a world-class real estate operating system.

---

## 1. Core Data Architecture: The Asset-Centric Model

To support complex assets (Hotels, Malls, Apartments), we implement a **Recursive Hierarchical Asset Tree**.

### 1.1 The Asset Entity (`Asset`)
The `Asset` is the physical "Source of Truth." It is decoupled from the marketing layer.

| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Primary Key | Unique identifier for the physical entity. |
| `parent_id` | `UUID` | FK (`Asset`), Nullable | Self-referencing FK for hierarchy (Building $\rightarrow$ Floor $\rightarrow$ Unit). |
| `asset_type` | `Enum` | `[LAND, BUILDING, UNIT, VEHICLE, SERVICE]` | Defines the nature of the asset. |
| `name` | `String(255)` | Not Null | Human-readable name (e.g., "Kigali Heights Tower"). |
| `geo_location` | `Geography(Point)` | PostGIS/Spatial | Precise longitude/latitude for map rendering. |
| `boundary` | `Geography(Polygon)` | PostGIS/Spatial | Precise plot boundaries for land assets. |
| `address_level_1` | `String` | Not Null | Province (e.g., Kigali City). |
| `address_level_2` | `String` | Not Null | District (e.g., Gasabo). |
| `address_level_3` | `String` | Not Null | Sector (e.g., Kacyiru). |
| `address_level_4` | `String` | Not Null | Cell (Umudugudu). |
| `village` | `String` | Not Null | Village name. |
| `total_area` | `Decimal(15,2)` | Not Null | Total area in $\text{m}^2$. |
| `created_at` | `Timestamp` | Auto-now | Audit timestamp. |

### 1.2 Polymorphic Specifications (`AssetSpec`)
We use a **Table-per-Type (TPT)** approach. `AssetSpec` is the base, with specialized tables for different asset classes.

#### `ResidentialSpec` (Linked to `Asset` via 1:1)
- `bedrooms`: `Int`
- `bathrooms`: `Int`
- `kitchen_type`: `Enum` (`Open`, `Closed`, `American`)
- `balcony`: `Boolean`
- `is_furnished`: `Boolean`
- `year_built`: `Int`

#### `CommercialSpec` (Linked to `Asset` via 1:1)
- `zoning_type`: `Enum` (`Retail`, `Office`, `Industrial`, `Mixed`)
- `power_capacity`: `Decimal` (KVA)
- `loading_bays`: `Int`
- `parking_spaces`: `Int`
- `foot_traffic_score`: `Int` (1-10)

#### `LandSpec` (Linked to `Asset` via 1:1)
- `terrain`: `Enum` (`Flat`, `Sloped`, `Hilly`, `Rocky`)
- `road_access`: `Boolean`
- `soil_type`: `String`
- `topography`: `String`
- `title_deed_number`: `String` (UPT Number - Essential for Rwanda)

#### `HotelSpec` (Linked to `Asset` via 1:1)
- `star_rating`: `Int` (1-5)
- `total_rooms`: `Int`
- `amenities`: `JSONB` (e.g., `{"pool": true, "gym": true, "spa": false}`)
- `occupancy_rate`: `Decimal`
- `management_type`: `Enum` (`Owner-Managed`, `Franchise`, `Corporate`)

---

## 2. The Listing Layer: The Marketing Engine

A `Listing` is a temporary "Offer" to sell or rent an `Asset`.

### 2.1 `Listing` Entity
| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Primary Key | Unique identifier for the listing. |
| `asset_id` | `UUID` | FK (`Asset`) | The physical asset being offered. |
| `owner_id` | `UUID` | FK (`User`) | The person/agent listing the asset. |
| `listing_type` | `Enum` | `[SALE, RENT, LEASE, FRACTIONAL]` | The nature of the offer. |
| `listing_status` | `Enum` | `[DRAFT, LISTED, NEGOTIATION, SOLD, RENTED]` | Lifecycle state. |
| `price` | `Decimal(18,2)` | Not Null | Asking price. |
| `currency` | `String(3)` | Default: `RWF` | ISO Currency code. |
| `title` | `String(255)` | Not Null | Marketing title. |
| `description` | `Text` | Not Null | Full marketing copy. |
| `verification_level`| `Enum` | `[NONE, SUBMITTED, VERIFIED, PROFESSIONAL]` | Trust level. |
| `is_featured` | `Boolean` | Default: `False` | Priority visibility. |

---

## 3. State Machine: The Listing Lifecycle

We implement a strict state machine to prevent illegal transitions (e.g., moving from `Sold` back to `Draft` without admin approval).

**States**: `DRAFT` $\rightarrow$ `SUBMITTED` $\rightarrow$ `LISTED` $\rightarrow$ `NEGOTIATION` $\rightarrow$ `SOLD/RENTED`

| From State | Trigger | To State | Condition |
| :--- | :--- | :--- | :--- |
| `DRAFT` | `Submit()` | `SUBMITTED` | All required fields filled + Media uploaded. |
| `SUBMITTED` | `AdminApprove()` | `LISTED` | All verification documents validated. |
| `SUBMITTED` | `AdminReject()` | `DRAFT` | Return to seller with rejection notes. |
| `LISTED` | `ReceiveOffer()` | `NEGOTIATION` | Valid offer received and accepted for discussion. |
| `NEGOTIATION`| `CloseDeal()` | `SOLD/RENTED` | Final contract signed and payment confirmed. |
| `LISTED` | `Withdraw()` | `DRAFT` | Seller removes asset from market. |

---

## 4. Trust & Verification Infrastructure

### 4.1 `VerificationDocument` (The Evidence)
- `asset_id`: `UUID` (FK)
- `doc_type`: `Enum` (`TITLE_DEED`, `ID_PASSPORT`, `BUSINESS_LICENSE`, `TAX_CLEARANCE`)
- `file_url`: `String` (S3/Cloud Storage link)
- `status`: `Enum` (`PENDING, APPROVED, REJECTED`)
- `verified_by`: `UUID` (FK to `User` - Admin)
- `verification_date`: `Timestamp`

### 4.2 `ListingAuditLog` (The Immutable Chain)
To prevent fraud in a high-value market, every change to a `VERIFIED` listing is recorded.
- `asset_id`: `UUID`
- `field_name`: `String` (e.g., "price")
- `old_value`: `Text`
- `new_value`: `Text`
- `actor_id`: `UUID` (Who made the change)
- `timestamp`: `Timestamp` (Immutable)

---

## 5. Professional API Contract (OpenAPI Standard)

### 5.1 Discovery Engine (Public)
- **`GET /api/v1/discovery`**
    - **Params**: `type`, `price_range`, `location_poly`, `min_beds`, `max_beds`, `sort`.
    - **Response**: `ListingDTO[]` (Includes base listing + resolved extension data).
- **`GET /api/v1/assets/<id>/intelligence`**
    - **Response**: Returns Listing data + AI Valuation + Neighborhood stats (Avg price/sqm).

### 5.2 Trust Pipeline (Admin)
- **`GET /api/v1/admin/verification/queue`**
    - **Response**: `PendingDocumentDTO[]` sorted by submission date.
- **`POST /api/v1/admin/verification/review`**
    - **Payload**: `{ doc_id: UUID, status: Enum, notes: String }`
    - **Action**: Updates doc status $\rightarrow$ Updates `Asset.verification_level`.

### 5.3 Command Center (Operational)
- **`GET /api/v1/ops/launchpad`**
    - **Response**: Personalized data based on `User.role` (Today's tasks, urgent alerts).
- **`GET /api/v1/ops/agent/pipeline`**
    - **Response**: `KanbanBoardDTO` (List of leads categorized by state).

---

## 6. Operational Monitoring & Telemetry

### 6.1 `SystemLog` (The Black Box)
Every critical action is logged for auditing and performance tuning.
- `timestamp`: `Timestamp`
- `level`: `Enum` (`INFO, WARNING, ERROR, CRITICAL`)
- `category`: `Enum` (`AUTH, TRUST, FINANCE, API, AI`)
- `actor_id`: `UUID` (nullable)
- `event_type`: `String` (e.g., `LISTING_PRICE_CHANGE`)
- `payload`: `JSONB` (Full context of the event)

### 6.2 Business Intelligence (BI) Metrics
The system tracks:
- **TTV (Time to Verify)**: Avg time from `SUBMITTED` $\rightarrow$ `LISTED`.
- **Conversion Ratio**: `Views` $\rightarrow$ `Inquiries` $\rightarrow$ `Offers`.
- **Market Heatmap**: Geographic density of "Under Negotiation" assets.
