# Urugwiro - Project Memory & Technical Blueprint

## Project Overview
Urugwiro is evolving from a traditional real estate marketplace into a world-class **Property Discovery Experience**. It connects buyers, sellers, agents, and tenants through a high-trust, immersive platform.

**Core Mission**: Replace traditional "classifieds" with a "digital showroom" featuring spatial intelligence, AI-driven insights, and a rigorous trust verification engine.

## Architecture
### Stack
- **Backend**: Django 5.1 / Django REST Framework (DRF)
- **Frontend**: React (TypeScript), Tailwind CSS, TanStack Query (Zero-reload data fetching)
- **Database**: SQLite (Dev) / PostgreSQL (Prod)
- **AI/Intelligence**: NVIDIA AI APIs (Visual Search, Automated Valuation, Lifestyle Matching)
- **Spatial**: Three.js (3D Digital Twins), GIS (Land Mapping)

### Data Model: Unified Listing Architecture
To handle diverse assets (Houses, Land, Cars, Services) without model fragmentation, Urugwiro uses a **Base $\rightarrow$ Extension** pattern:
- **`Listing` (Base)**: Common attributes (Title, Price, Location, Status, Owner, Verification Level).
- **`ListingMedia`**: Unified media system supporting Images, Videos, and 360 Tours.
- **Specialized Extensions**:
    - `RentalExtension`: Units, Lease Terms.
    - `SaleExtension`: Bedrooms, Bathrooms, Year Built, Title Deed status.
    - `LandExtension`: Plot Size, Terrain, Road Access.
    - `VehicleExtension`: Make, Model, Mileage, Fuel Type.
    - `ServiceExtension`: Category, Experience, Certifications.

### Trust Engine
Moving beyond "Seller Claims" to "Verified Truth":
- **`VerificationDocument`**: Uploads for Title Deeds, IDs, and Registration.
- **`VerificationReview`**: Admin-led approval/rejection pipeline.
- **`ListingAuditLog`**: Immutable history of all critical attribute changes.
- **Verification Levels**: `None` $\rightarrow$ `Submitted` $\rightarrow$ `Verified` $\rightarrow$ `Professional`.

## Core Workflows
### 1. The Buyer Journey
- **Discovery**: High-performance React grid with instant filtering $\rightarrow$ **Listing Detail** (Immersive view with JSON-LD SEO) $\rightarrow$ **Conversion** (Offer, Inquiry, or Schedule Visit).
### 2. The Seller Journey
- **Listing Wizard**: Multi-step progressive disclosure (Category $\rightarrow$ Specs $\rightarrow$ Media $\rightarrow$ Verification $\rightarrow$ Publish).
### 3. The Admin Command Center
- **Verification Queue**: Reviewing submitted docs and promoting listing trust levels.
- **User Management**: Role assignment (Buyer, Seller, Agent, Admin).
- **System Health**: Audit logs and system-wide telemetry.

## Design System: "Black Edition"
- **Visual Identity**: Ultra-luxury, high-contrast dark mode.
- **Experience**: Fluid animations, skeleton loaders for perceived performance, "Digital Showroom" aesthetics.
- **UX Principles**: Zero-reload transitions, mobile-first "App-like" feel.

## Key API Endpoints (DRF)
- `/api/listings/`: Discovery feed.
- `/api/listings/<slug>/`: Full asset intelligence.
- `/api/listings/<id>/like/`: Engagement.
- `/api/verification/`: Document submission and review.
- `/api/land-info/`: Educational hub content.


# Task Management & TODO Guidelines
- When viewing, querying, adding, updating, or deleting project tasks or TODOs, ALWAYS use the TODO MCP tools (`todo_get_tasks`, `todo_add_tasks`, `todo_update_tasks`, `todo_delete_tasks`, `todo_clear_category`, `todo_move_category`) on server `todo-mcp` or `todo-extension`.
- NEVER edit the `.todo` file directly with file modification tools.
