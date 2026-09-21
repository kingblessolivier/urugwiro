# Urugwiro Enterprise System Blueprint & Architectural Specification

## 1. Executive Vision & Architecture Philosophy

Urugwiro is a **Multi-Asset Discovery & Trust Operating System** built for high-trust digital transactions across Rwanda and global diaspora investors. It unifies four core asset categories:
1. **Houses & Living Spaces** (Villas, Apartments, Modest Homes, Commercial Buildings, Hotels/Guest Houses)
2. **Lands & Plots** (Residential, Commercial, Agricultural, Industrial with UPI Cadastral Intelligence)
3. **Cars** (Sale & Daily/Monthly Rental)
4. **Motorbikes** (Sale & Commercial/Private Rental)

### The Core Architectural Principle: Asset vs. Listing
- **The Asset (`Asset`)**: The immutable physical source of truth (the land parcel, the building, the vehicle). It retains historical ownership, geolocation, UPI, and physical specifications.
- **The Listing (`Listing`)**: The marketing offer layer. It defines transaction purpose (**SALE** vs. **RENT**), pricing, terms, media, and visibility.
- **The Specification (`Spec`)**: Polymorphic detail entities attached to the Asset (`HouseSpec`, `LandSpec`, `VehicleSpec`, `CommercialHotelSpec`).

---

## 2. Complete Data Model Specification

```mermaid
classDiagram
    class User {
        +UUID id
        +string username
        +string email
        +string phone_number
        +string role: "Buyer" | "Seller" | "Agent" | "Admin" | "RentalManager"
        +bool is_verified
        +string national_id_or_passport
    }

    class Asset {
        +UUID id
        +UUID parent_id (Self-referencing for units/rooms)
        +string asset_type: "HOUSE" | "LAND" | "CAR" | "MOTORBIKE" | "HOTEL"
        +string name
        +decimal latitude
        +decimal longitude
        +string province / district / sector / cell / village
        +string full_address
        +decimal total_area_sqm
        +datetime created_at
    }

    class HouseSpec {
        +string sub_type: "VILLA" | "APARTMENT" | "MODEST_HOUSE" | "TOWNHOUSE"
        +int bedrooms
        +int bathrooms
        +decimal built_up_area_sqm
        +decimal compound_size_sqm
        +int year_built
        +bool is_furnished
        +bool has_swimming_pool
        +bool has_staff_quarters
        +bool has_water_tank
        +bool has_solar_water_heater
        +bool has_backup_generator
        +string security_type: "Gated" | "Electric Fence" | "Perimeter Wall" | "Standard"
        +string electricity_meter: "Cash Power Dedicated" | "Shared Meter"
        +string road_access_type: "Tarmac" | "Cobblestone" | "Murram" | "Pedestrian"
        +int floor_number (if apartment)
        +bool has_elevator (if apartment)
        +decimal monthly_service_charge (if apartment)
    }

    class LandSpec {
        +string upi_number (Unique Parcel Identifier e.g. 1/03/05/02/1234)
        +string zoning_code (e.g. R1, R2, R3, C1, Industrial, Agricultural)
        +decimal plot_size_sqm
        +string terrain: "Flat" | "Gentle Slope" | "Steep" | "Valley"
        +string soil_type
        +string road_type: "Asphalt" | "Cobblestone" | "Dirt" | "Path"
        +bool water_onsite
        +int water_line_distance_meters
        +bool electricity_onsite
        +int power_pole_distance_meters
        +string drainage_system: "Covered" | "Open" | "Natural"
        +bool is_in_wetland_buffer_zone
        +string title_deed_document (File)
        +string cadastral_sketch_image (File)
        +JSON boundary_geojson (Beacon polygon coordinates)
    }

    class VehicleSpec {
        +string vehicle_type: "CAR" | "MOTORBIKE"
        +string make
        +string model
        +int year
        +int mileage
        +string fuel_type: "PETROL" | "DIESEL" | "HYBRID" | "ELECTRIC"
        +string transmission: "MANUAL" | "AUTOMATIC"
        +string condition: "Brand New" | "Used Foreign" | "Used Local"
        +string engine_cc (e.g. "125cc", "2000cc")
        +string body_type (SUV, Sedan, Pickup, Minibus, Sportbike, Cruiser)
        +int seating_capacity
        +string plate_type: "Private (RAx)" | "Commercial Taxi (Yellow)" | "Temporary"
        +date controle_technique_expiry
        +date insurance_expiry
        +bool includes_driver (for rentals)
        +bool includes_helmet (for motorbikes)
        +bool has_delivery_rack (for motorbikes)
    }

    class CommercialHotelSpec {
        +int total_rooms
        +int conference_halls
        +int star_rating
        +bool has_restaurant_bar
        +bool has_commercial_license
        +int parking_bays
        +decimal power_capacity_kva
        +int foot_traffic_score
    }

    class Listing {
        +UUID id
        +FK asset
        +FK owner (User)
        +string title
        +string description
        +string purpose: "SALE" | "RENT"
        +decimal price
        +string currency: "RWF" | "USD"
        +string rental_frequency: "PER_DAY" | "PER_MONTH" | "PER_YEAR"
        +decimal security_deposit
        +string status: "listed" | "under_negotiation" | "sold" | "rented" | "withdrawn"
        +string verification_level: "none" | "submitted" | "verified" | "professional"
        +bool is_featured
        +int views_count
        +string slug
    }

    class ListingMedia {
        +UUID id
        +FK listing
        +File file (.jpg, .png, .mp4, .glb, .gltf, .splat)
        +string media_type: "image" | "video" | "panorama_360" | "model_3d" | "cadastral_sketch"
        +string room_or_angle_name (e.g. "Living Room", "Front 3/4 Exterior")
        +decimal initial_yaw
        +decimal initial_pitch
        +JSON hotspot_links (Linking Room A to Room B)
        +int order
    }

    Asset --> HouseSpec
    Asset --> LandSpec
    Asset --> VehicleSpec
    Asset --> CommercialHotelSpec
    Listing --> Asset
    Listing --> ListingMedia
```

---

## 3. 3D Virtual Navigation Architecture

To deliver fluid 3D experiences in React with Three.js (`@react-three/fiber` & `@react-three/drei`):

### 3.1 Supported 3D Formats & Pipelines
1. **360° Equirectangular Panoramas**:
   - **Resolution**: 4096×2048 or 6000×3000 JPG/PNG.
   - **Capture Device**: Insta360, Ricoh Theta, or smartphone panorama.
   - **Interactive Viewer**: Three.js inverted sphere geometry with interactive raycasted pins linking adjacent rooms.
2. **GLTF / GLB 3D Models (Digital Twins)**:
   - **Resolution**: Compressed binary GLB files (< 25MB) using Draco mesh compression.
   - **Capture Device**: iPhone Pro LiDAR scans (Polycam), drone photogrammetry, or architectural CAD models.
   - **Viewer**: Interactive 3D OrbitControls with dollhouse cutaway and floor-plan switching.
3. **3D Gaussian Splatting / NeRF**:
   - **Resolution**: `.splat` point cloud files for photorealistic rendering of cars and luxury compounds.

---

## 4. Land UPI Cadastral & Spatial Intelligence

Every land asset in Rwanda is grounded in the official cadastral registry:
1. **UPI Verification Engine**: Real-time format validation of the 14-digit Rwandan UPI (`P/DD/SS/CC/NNNN`).
2. **Interactive Cadastral Viewer**:
   - Leaflet / Mapbox satellite view rendering the exact beacon polygon coordinates (`boundary_geojson`).
   - Comparison with adjacent plot UPI numbers.
3. **Master Plan 2050 Overlay**:
   - Displays permitted zoning (R1, R2, R3, Commercial, Industrial).
   - Shows infrastructure proximity (distance to nearest tarmac road, hospital, water mains, power grid).

---

## 5. End-to-End Business Operations

### 5.1 Payments & Escrow (`Transaction`, `EscrowDeposit`)
- **Supported Gateways**: MTN MoMo API, Airtel Money, Bank Transfer, Visa/Mastercard.
- **Transaction Types**:
  - `RENT_PAYMENT`: Recurring tenant payments with automated digital receipts.
  - `EARNEST_DEPOSIT`: Escrow deposit to lock a house/land deal during title transfer.
  - `VEHICLE_PURCHASE` / `VEHICLE_RENTAL_FEE`: Daily rental hold or full purchase payment.
  - `VERIFICATION_FEE`: Professional site inspection fee.
- **Escrow Safeguard**: Funds are locked in escrow and only released upon bilateral verification (buyer confirms inspection + admin verifies title/car transfer).

### 5.2 Contextual Real-Time Messaging (`Conversation`, `ChatMessage`)
- **Listing Context**: Every conversation thread is bound to a specific `Listing`, showing price, photos, and quick-action buttons at the top.
- **Deal Actions**: Integrated *"Make an Offer"*, *"Counter Offer"*, and *"Schedule Visit"* triggers inside the chat interface.
- **Live Communication**: Real-time delivery via Django Channels WebSockets.

### 5.3 Leases & Maintenance Lifecycle
- **Smart Digital Lease**: Auto-fills tenant name, owner name, UPI, rent amount, and payment schedule into an enforceable digital lease with cryptographic signature.
- **Maintenance Ticket Pipeline**:
  - Tenant submits issue with photo/video.
  - Status tracking: `SUBMITTED` $\rightarrow$ `DIAGNOSED` $\rightarrow$ `IN_REPAIR` $\rightarrow$ `RESOLVED`.
  - Automatic notification to assigned landlord/manager.

### 5.4 Smart Notifications & Live Updates
- **Multi-Channel Alerts**: In-app notifications + SMS/WhatsApp alerts for high-priority events (Offer Accepted, Rent Due, Visit Booked).
- **Public Updates & Market Index**: Real-time feed of market reports, regulatory updates, and neighborhood price trends.

---

## 6. Comprehensive NVIDIA AI Integration Plan

```mermaid
flowchart LR
    subgraph Client Experience
        SellerUpload[Seller Uploads Media]
        BuyerSearch[Buyer Types / Speaks Intent]
        ChatNegotiate[Buyer/Seller Chat]
        TenantReport[Tenant Reports Fault]
    end

    subgraph NVIDIA AI Services
        NIM_Vision[NVIDIA Vision-Language NIM]
        NIM_LLM[NVIDIA Nemotron / Llama-3 NIM]
        NIM_Embedding[NVIDIA Multimodal Embedding NIM]
        NIM_NeRF[NVIDIA NeRF / 3D Reconstruction]
    end

    subgraph Platform Actions
        OCRVerify[Auto OCR Title Deed & UPI]
        AutoSpec[Auto-Detect Vehicle & House Specs]
        VisualSearch[Visual Similarity Match]
        IntentParser[Structured Filter Query]
        NegotiationCopilot[Smart Negotiation Copilot]
        DamageDiagnose[Visual Damage & Cost Estimate]
    end

    SellerUpload --> NIM_Vision --> OCRVerify
    SellerUpload --> NIM_Vision --> AutoSpec
    SellerUpload --> NIM_NeRF --> AutoSpec
    BuyerSearch --> NIM_Embedding --> VisualSearch
    BuyerSearch --> NIM_LLM --> IntentParser
    ChatNegotiate --> NIM_LLM --> NegotiationCopilot
    TenantReport --> NIM_Vision --> DamageDiagnose
```

1. **Title Deed & UPI OCR Verification (NVIDIA Vision NIM)**:
   - Scans uploaded Rwandan title deeds (*Icyangombwa*), extracts UPI, owner identity, and plot area, and compares against listing inputs to prevent fraud.
2. **Automated Spec Detection & Luxury Narrative**:
   - Car photo upload $\rightarrow$ extracts Make, Model, Color, Condition, and suggests price.
   - House photo upload $\rightarrow$ drafts a high-conversion luxury marketing description.
3. **Visual Similarity & Natural Intent Search**:
   - Buyers can upload an image of their dream villa or car to find similar inventory.
   - Voice/Text Intent: Converts *"3 bedroom house in Kibagabaga with a pool under 120M RWF"* into exact database filters.
4. **Multilingual Negotiation Assistant**:
   - Translates messages between Kinyarwanda, English, and French in real time.
   - Generates counter-offer suggestions based on historical market comparables.
5. **Visual Maintenance Diagnostics**:
   - Analyzes photos of plumbing leaks, electrical faults, or vehicle wear to classify severity and estimate repair costs.

---

## 7. Migration Plan: Decommissioning Legacy Models

| Legacy Entity | Target Architecture Entity | Migration Action |
| :--- | :--- | :--- |
| `Property` | `Asset` + `HouseSpec` | Migrate data to `Asset` + `HouseSpec`; redirect views to `/api/listings/`. |
| `SaleProperty` | `Listing` + `Asset` | Convert to unified `Listing` (purpose='SALE'); retire table. |
| `Owner`, `Seller` | `UserProfile` (role='Seller'/'Owner') | Merge into unified `UserProfile`; assign permissions dynamically. |
| `Tenant` | `UserProfile` (role='Buyer'/'Tenant') | Merge profile fields into `UserProfile`; retain `Lease` relations. |
| `ListingMedia.file` | Change `ImageField` $\rightarrow$ `FileField` | Update field definition to allow 3D `.glb` and `.splat` uploads. |
| Hardcoded Template Views | React SPA Components + DRF APIs | Replace Django HTML views with client-side zero-reload pages. |
