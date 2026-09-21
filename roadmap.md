# Urugwiro: The Revolution Detailed Roadmap

This roadmap defines the precise technical execution for transforming Urugwiro into a world-class **Property Discovery Experience**. It focuses on moving from "pages" to "tools," ensuring that the system empowers its users (Admins, Agents, Sellers, Buyers) to work with maximum efficiency.

---

## Phase 1: The Architectural Foundation (Month 1)
**Goal**: Decouple the frontend and establish the API contract to eliminate full-page reloads and enable "Tool-based" interactions.

### 1.1 DRF Migration (Headless Transition)
*   **What**: Replace traditional Django views with a high-performance REST API.
*   **How**:
    *   **Serializers**: Create a dynamic serializer system in `serializers.py` that detects `listing_type` and automatically includes the corresponding extension data (`SaleExtension`, `RentalExtension`, etc.) in the JSON response.
    *   **ViewSets**: Implement `ListingViewSet` and `UserViewSet` in `api_views.py` using `ModelViewSet` for full CRUD capabilities.
    *   **Filtering**: Integrate `django-filter` to handle complex discovery queries (e.g., `?min_price=1000&city=Kigali&type=sale`) directly at the database level.
    *   **Engagement API**: Build endpoints for liking assets (`/api/listings/<id>/like/`) and requesting visits.
*   **Files**: `urugwiro/serializers.py`, `urugwiro/api_views.py`, `urugwiro/urls.py`.

### 1.2 Core React Integration & State Management
*   **What**: Establish the modern frontend shell.
*   **How**:
    *   **App Shell**: Build a layout with a persistent "Black Edition" navigation bar and footer.
    *   **Data Fetching**: Implement **TanStack Query** (React Query) for all API interactions to enable caching, background refetching, and optimistic updates.
    *   **Routing**: Use `react-router-dom` for seamless client-side navigation.
*   **Files**: `frontend/src/App.tsx`, `frontend/src/api/client.ts`.

### 1.3 The Discovery Engine (High-Performance UX)
*   **What**: A zero-reload exploration experience.
*   **How**:
    *   **Triple-Pane Layout**: Implement a responsive grid: **Filters** (collapsible sidebar) | **Results** (Masonry-style grid) | **Map** (Interactive Mapbox/Google Maps view).
    *   **Instant Filtering**: Bind filter inputs to the API query. As a user changes a slider, the results grid updates in real-time.
    *   **Skeleton Loading**: Replace spinners with structural skeleton loaders to improve perceived performance.
*   **Files**: `frontend/src/features/discovery/DiscoveryPage.tsx`, `frontend/src/features/discovery/FilterPane.tsx`.

### 1.4 Immersive Detail View (The "Showroom")
*   **What**: An asset page that feels like a luxury brochure.
*   **How**:
    *   **Dynamic Spec-Sheets**: Create a component that renders different data based on asset type.
    *   **Luxury Gallery**: Implement a high-res image carousel with a "Full Screen" mode and integrated video support.
    *   **Conversion Hub**: A sticky sidebar with a "Make Offer" form, "Schedule Visit" calendar, and direct agent chat.
    *   **SEO Intelligence**: Inject JSON-LD structured data into the head for Google Rich Snippets.
*   **Files**: `frontend/src/features/discovery/ListingDetail.tsx`.

### 1.5 Role-Based Launchpads (The "My Day" Experience)
*   **What**: Transform the homepage from a marketing site into a dynamic start-page for logged-in users.
*   **How**:
    *   **Dynamic Routing**: Detect user role on login and serve a specific "Launchpad" component.
    *   **Admin Launchpad**: Quick-links to the Verification Queue and a high-level "System Health" summary.
    *   **Agent Launchpad**: Today's schedule of visits and urgent lead follow-ups.
    *   **Seller Launchpad**: Listing performance at a glance and "Action Required" alerts (e.g., "Document Expired").
*   **Files**: `frontend/src/pages/Home.tsx`, `frontend/src/features/launchpad/*.tsx`.

---

## Phase 2: The Seller's Professional Journey (Month 2)
**Goal**: Replace static forms with a professional, guided listing experience.

### 2.1 The Listing Wizard (Progressive Disclosure)
*   **What**: A multi-step React flow to guide sellers through listing creation.
*   **How**:
    *   **Step 1 (Category)** $\rightarrow$ **Step 2 (Specs)** $\rightarrow$ **Step 3 (Media)** $\rightarrow$ **Step 4 (Trust)** $\rightarrow$ **Step 5 (Preview)**.
    *   **Dynamic Fields**: Load the correct extension fields based on the category selected in Step 1.
*   **Files**: `frontend/src/features/listing/ListingWizard.tsx`, `frontend/src/features/listing/steps/*.tsx`.

### 2.2 Drafts & Persistence
*   **What**: Ensure sellers never lose progress.
*   **How**:
    *   **Auto-Save**: Implement background sync to save wizard state to the backend.
    *   **Recovery**: Detect unfinished drafts on return and offer to resume.
*   **Files**: `urugwiro/models.py`, `frontend/src/features/listing/ListingWizardContext.tsx`.

### 2.3 AI-Assistant (Narrative Generation)
*   **What**: Help sellers write "luxury" descriptions.
*   **How**:
    *   **Prompt Engineering**: Use an LLM to generate "Professional", "Luxury", and "Concise" versions of the description based on basic specs.
    *   **Integration**: A "Generate with AI" button inside the description field.
*   **Files**: `frontend/src/features/listing/components/AIDescriptionGenerator.tsx`.

---

## Phase 3: The Trust & Verification Engine (Month 3)
**Goal**: Establish Urugwiro as the "Source of Truth" in the real estate market.

### 3.1 Verification Pipeline & Workspace
*   **What**: A formal process to move assets from "Seller Claimed" to "Urugwiro Verified".
*   **How**:
    *   **Submission Portal**: Integrated in the Listing Wizard for document uploads.
    *   **Verification Workspace (Admin Tool)**: A split-screen interface for rapid review (Document View $\rightarrow$ Decision Action) to minimize admin fatigue.
    *   **Promotion**: Automated promotion of `verification_level` upon document approval.
*   **Files**: `urugwiro/models.py`, `urugwiro/api_views.py`, `frontend/src/features/admin/VerificationWorkspace.tsx`.

### 3.2 Immutable Audit Log
*   **What**: Track every change to "Verified" assets to prevent fraud.
*   **How**:
    *   **Signal-Based Logging**: Use Django `post_save` signals to log changes in critical fields.
    *   **Transparency**: Provide a "Verification History" view on the listing detail page for buyers.
*   **Files**: `urugwiro/models.py`, `urugwiro/signals.py`.

### 3.3 Trust UI/UX
*   **What**: Visual indicators of trust.
*   **How**:
    *   **Dynamic Badging**: Gold/Silver badges based on `verification_level`.
    *   **Source Labels**: Clear labels in the spec-sheet: "Seller Provided" vs "Urugwiro Verified".
*   **Files**: `frontend/src/features/discovery/ListingCard.tsx`, `frontend/src/features/discovery/ListingDetail.tsx`.

---

## Phase 4: Operational Command Centers (Month 4)
**Goal**: Move from "reporting" to "operating".

### 4.1 The Admin "Orchestrator" Hub
*   **What**: A central hub for managing the platform's daily rhythm.
*   **How**:
    *   **Operational Feed**: A real-time, chronological event stream (e.g., "New Offer on Villa X", "Listing #102 Verified").
    *   **System Telemetry**: High-level charts on market trends, user growth, and verification bottlenecks.
*   **Files**: `frontend/src/features/admin/AdminHub.tsx`.

### 4.2 The Agent "Closer" Toolkit
*   **What**: Tools to manage the lead-to-closing pipeline.
*   **How**:
    *   **Visit Kanban**: A visual board (Lead $\rightarrow$ Scheduled $\rightarrow$ Negotiation $\rightarrow$ Closed) to manage property visits.
    *   **Quick-Share Studio**: Generate professional, branded PDF/Web asset briefs in one click for WhatsApp/Email.
    *   **Lead Intelligence**: Contextual data on interested buyers when viewing a property.
*   **Files**: `frontend/src/features/agent/VisitKanban.tsx`, `frontend/src/features/agent/ShareStudio.tsx`.

### 4.3 The Seller "Strategist" Center
*   **What**: AI-powered performance tools for sellers.
*   **How**:
    *   **Performance Diagnostics**: AI-driven insights (e.g., "Your listing has high views but low inquiries; consider adding 3 more interior photos").
    *   **Lead Manager**: A lightweight CRM to track conversations and status of every inquiry.
*   **Files**: `frontend/src/features/seller/SellerCenter.tsx`.

### 4.4 The Buyer "Investor" Suite
*   **What**: Professional tools for high-value asset acquisition.
*   **How**:
    *   **Comparison Matrix**: A side-by-side technical comparison tool for 3+ assets.
    *   **Investment Calculator**: Tool to calculate potential Rental Yield and ROI based on market data.
*   **Files**: `frontend/src/features/buyer/InvestmentSuite.tsx`.

---

## Phase 5: The Intelligence Layer (Month 5)
**Goal**: Integrate NVIDIA AI for "Magic" discovery.

### 5.1 Visual Search (AI Image Analysis)
*   **What**: "Find similar houses" via image upload.
*   **How**:
    *   **Feature Extraction**: Use NVIDIA AI to extract visual features from listing photos.
    *   **Vector Search**: Store features in a vector database for nearest-neighbor search.
*   **Files**: `urugwiro/ai_service.py`, `frontend/src/features/discovery/VisualSearch.tsx`.

### 5.2 AI Valuation Engine
*   **What**: Automated, data-driven price estimates.
*   **How**:
    *   **Market Analysis**: Build a model that analyzes recent sales of similar assets in the same district.
    *   **Dynamic Estimator**: Provide a "Fair Market Value" range on the listing detail page.
*   **Files**: `urugwiro/valuation_engine.py`.

### 5.3 Lifestyle Matching & NL Search
*   **What**: Moving from "Filters" to "Intent".
*   **How**:
    *   **NL-to-Filter**: Translate "Quiet home for a family of 5 in Kigali" into API filters using an LLM.
    *   **Matching**: Create a "Lifestyle Profile" for buyers and suggest assets based on preferences.
*   **Files**: `urugwiro/ai_service.py`, `frontend/src/features/discovery/Searchbar.tsx`.

---

## Phase 6: Spatial Intelligence & Digital Twins (Month 6)
**Goal**: Provide a "Visit from Home" immersive experience.

### 6.1 3D Digital Twins
*   **What**: Interactive 3D floor plans.
*   **How**:
    *   **Three.js Integration**: Build a viewer for GLTF/OBJ files of house layouts.
    *   **360 Tours**: Implement a panoramic viewer for 360° photos.
*   **Files**: `frontend/src/features/discovery/components/ThreeDViewer.tsx`.

### 6.2 GIS Land Mapping
*   **What**: Precise plot boundary visualization.
*   **How**:
    *   **Plot Overlays**: Use Mapbox GL JS to draw precise GeoJSON polygons of land plots.
    *   **Zoning Layers**: Add toggleable layers for zoning laws, utility lines, and topography maps.
*   **Files**: `frontend/src/features/discovery/components/GISMap.tsx`.

---

## Phase 7: Performance & Polish (Ongoing)
**Goal**: Reach "World-Class" luxury standards.

### 7.1 Perceived Performance
*   **What**: Eliminate all "jumps" and "waits".
*   **How**:
    *   **Skeleton Screens**: Full-site implementation of structural loading states.
    *   **Micro-Animations**: Use Framer Motion for fluid transitions.
*   **Files**: `frontend/src/features/dashboards/components/DashboardSkeleton.tsx`.

### 7.2 Next-Gen SEO & PWA
*   **What**: Dominate search and provide an app-like experience.
*   **How**:
    *   **Structured Data**: Implement dynamic JSON-LD for every asset.
    *   **PWA**: Configure service workers for offline caching and "Add to Home Screen".
*   **Files**: `frontend/vite.config.ts`, `frontend/public/manifest.json`.
