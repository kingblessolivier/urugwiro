# Urugwiro System Audit and Upgrade Plan

Audit date: 2026-10-02. Application baseline: commit `6956562`.

## Assessment

Urugwiro has a useful foundation: a Django/DRF backend, an asset/listing data model, seller and customer workflows, and a React/TypeScript frontend with shared components, query caching, and lazy routes. The production frontend builds successfully.

It is not ready for a production-readiness sign-off. Local reproduction confirmed two routes to administrative privilege escalation, exposure of private seller data, unauthorized chat-room admission, and customer-record claiming without contact verification. Important marketplace controls also disagree with the backend. A visual redesign alone would leave these failures intact.

Keep the existing stack and improve it incrementally. Establish reliable permissions, contracts, and business rules before expanding features. This report is the single active audit/upgrade document; it does not replace the project TODO tracker.

## Scope and Evidence

Reviewed authentication, permissions, public listings, seller mutations, offers, visits, proposals, verification, finance models, API serializers/routes, chat, deployment configuration, CI, frontend routing/data access, discovery, layouts, forms, themes, reports, settings, service worker, and asset/import structure. This is a broad code and local-runtime audit, not proof that every possible defect has been found.

Backend mutation probes used a new in-memory SQLite database populated with synthetic records. They used Django's API test client, reduced test-only middleware, disabled logging, and a fast test password hasher. No existing project database records were changed. Chat admission was tested directly with mocked channel operations; an actual browser-to-ASGI WebSocket session was not tested.

Browser inspection was attempted, but the available browser inventory was empty. Layout findings below are grounded in source code, not rendered screenshots. Desktop/mobile rendering, keyboard journeys, measured contrast, screen-reader behavior, and real browser timing remain acceptance work. No production service was probed, and deployed environment variables, storage, backups, and external provider behavior were not inspected.

| Check | Result | Meaning |
| --- | --- | --- |
| Django ordinary system check | Passed through test command | Startup configuration alone does not validate business behavior |
| Django tests | 0 tests discovered | No backend regression protection |
| Migration consistency | Failed | Missing migration for `Notification.notification_type` |
| Django `check --deploy` under local defaults | 127 diagnostics | Includes schema diagnostics and six development-setting security warnings; not 127 vulnerabilities or evidence of deployed settings |
| Frontend TypeScript/Vite build | Passed | Warnings for font import order and Vite `__dirname` compatibility |
| Frontend lint | 368 warnings, exit 0 | 159 unused symbols; 138 static-component warnings; 39 hook dependency warnings; 17 effect-state warnings; 15 other React warnings |
| Python `pip check` | Passed | Installed package requirements are internally compatible; this is not a vulnerability scan |
| npm dependency audit | 0 reported advisories | Registry result at audit time, not a security guarantee |
| Frontend static import traversal | 17 of 122 TS/TSX files unreachable from `main.tsx` | Cleanup/integration candidates, not automatic deletion authorization |

### Local Reproduction Results

| Probe | Observed result |
| --- | --- |
| Register with privileged role and one-character password | HTTP 201; role became `admin`; resulting token accessed admin users with HTTP 200 |
| Normal customer's self-profile update | HTTP 200; `role=owner`, `is_staff=true`, and `is_superuser=true` persisted |
| Anonymous numeric draft-detail request | HTTP 200, including draft status and seller identity/address fields |
| Existing listing requested by slug | HTTP 404 |
| Visual-search POST route | Resolved to listing detail; HTTP 405 |
| Seller self-certification | HTTP 200; publication, professional verification, and seller verification persisted |
| Invalid listing update containing location change | HTTP 400, but location change persisted |
| Anonymous public proposal submission | HTTP 401 |
| Save existing system-setting key again | First save HTTP 201; second save HTTP 400 |
| Saved-properties response | Paginated object, while discovery expects an array of listings |
| Claim an anonymous customer's phone through an offer | Customer linked to another account; that account could read both offers |
| Public listing query count | 13 queries for 1 listing; 203 for 20 listings in the synthetic fixture |
| Impossible bedroom/sector/verification filters | All 20 fixture listings still returned |
| Refresh JWT after logout | HTTP 200; refresh token remained valid |
| Authenticated outsider joining another chat room | Connection accepted and history requested |

## Findings

Priority definitions: **P0** release blocker requiring immediate remediation; **P1** high-impact security, integrity, or primary-workflow failure; **P2** important usability, quality, or maintainability problem. Evidence is marked **reproduced**, **source-confirmed**, or **needs browser/deployment validation**.

### A01 - P0: Public Registration Grants Administrative Roles

**Reproduced.** `urugwiro/api_views.py:948` passes client input to `User.objects.create_user(role=role.lower())`. `check_admin_permission` at line 49 accepts that stored role. Registration also bypasses the configured password validators: a one-character password was accepted.

Fix: use a dedicated registration serializer with a server-owned public role, validate passwords explicitly, and separate customer intent (buy/rent) from staff privileges. Seller access should follow an explicit onboarding policy. Add tests for every privileged role, mixed casing, extra fields, and weak passwords.

### A02 - P0: Self-Profile Updates Can Create Superusers

**Reproduced.** `urugwiro/api_views.py:992` uses `UserSerializer` for self-service updates. `urugwiro/serializers.py:583` exposes writable `role`, `is_staff`, `is_superuser`, and `is_active` fields. A normal customer became a superuser through this endpoint.

Fix: separate public profile, self-edit, administrative read, and privileged mutation serializers. Explicitly allow self-editable fields. Centralize privileged changes under narrowly authorized actions and record an audit event. Review existing privileged accounts after the fix; this audit does not establish whether exploitation occurred.

### A03 - P1: Chat Rooms Do Not Enforce Participant Membership

**Admission reproduced; history exposure source-confirmed.** `urugwiro/consumers.py:55` checks authentication but joins the requested room without verifying that the current user is either participant. `get_history` queries the two IDs from the room name. A mocked outsider connection was accepted and requested history. `config/asgi.py` also lacks WebSocket origin validation.

Fix: parse and validate room identifiers, authorize membership before joining or loading history, scope every action to that conversation, bound message sizes, and handle malformed messages. Add explicit origin validation and a documented session/JWT strategy. The current Channels authentication stack is session-based; frontend API tokens do not automatically authenticate sockets.

### A04 - P1: Public Responses Expose Drafts and Private Seller Fields

**Reproduced.** `urugwiro/api_views.py:860` allows public detail access to all listing states. `urugwiro/serializers.py:86` includes national ID/passport number, address, email, and commission-rule reference in the seller serializer nested into public listings at line 112. Published list responses use the same serializer.

Fix: public list/detail serializers must explicitly allow only approved public fields and public states. Use separate owner/staff detail endpoints. Define which contact information a seller consents to publish. Ownership and verification documents require private storage and authorized downloads, not the same access policy as listing photographs.

### A05 - P1: Seller Mutations Bypass Verification and Ownership Boundaries

**Self-certification reproduced; reassignment source-confirmed.** Seller creation/update shares `ListingCreateSerializer`, which accepts publication, verification, featured status, asset, and attribution fields (`serializers.py:153`). The status action accepts arbitrary values (`api_views.py:1307`). The shared update helper accepts seller reassignment and changes to the reassigned seller's details (`api_views.py:243`, seller section near line 694). Auto-provisioning sets sellers approved and verified (`api_views.py:65`).

Fix: role-specific write serializers, explicit allowed transitions, server-owned verification fields, and administrative-only reassignment. Check seller suspension/approval as well as role. Recompute listing trust after approvals and rejections: `signals.py` currently approves a listing after one approved document but does not downgrade listing verification when a document is rejected.

### A06 - P1: Customer Records Can Be Claimed Through Unverified Contact Details

**Reproduced for offers.** `urugwiro/api_views.py:1800` matches a customer by submitted phone/email and links an unclaimed record to the authenticated requester without proving ownership. The requester can then read historical offers through the customer dashboard. The default phone `0780000000` can also merge unrelated customers. Booking has similar identity-matching logic at line 1550 and needs the same review.

Fix: do not attach existing guest records using an unverified claim. Require a contact-verification flow or explicit reviewed merge. Normalize contact identifiers, preserve provenance, avoid dummy identifiers, and test that one account cannot inherit another customer's offers, visits, or conversations.

### A07 - P1: Authentication Lifecycle and Role Policies Are Inconsistent

**Logout reproduced; remaining issues source-confirmed.** `api_views.py:1012` logs out the Django session but does not invalidate the supplied refresh token. Rotation/blacklisting settings exist without the blacklist app (`config/settings.py:183`). `frontend/src/api/client.ts` saves refreshed access tokens but discards rotated refresh tokens and has no shared refresh operation for concurrent failures. It clears storage without reliably updating React auth state or private query caches.

Backend roles are customer/seller/staff/admin/finance/owner, while frontend types and registration include Buyer/Tenant/Agent. `types/navigation.ts` grants administrative UI access to usernames `admin` and `admin1`; backend checks differ between `api_views.py` and `views.py`. Staff/finance currently share broad administrative powers.

Fix: define one capability matrix, remove username exceptions, align enums, implement refresh rotation and revocation together, clear user-specific caches on account changes, and show an auth-loading state before route decisions. Decide how long already-issued access tokens may remain valid after logout. Prefer a same-origin browser session arrangement or protected refresh-cookie design with CSRF controls over long-lived refresh tokens in local storage.

### A08 - P1: Deployment Security Defaults and Abuse Controls Are Weak

**Source-confirmed; production configuration not inspected.** `config/settings.py:19` has a known fallback signing key and defaults to debug mode. `Dockerfile:7` places a build-only signing key in runtime environment defaults unless overridden. Trusted origins accept arbitrary Vercel/Railway subdomains. Global DRF permission defaults are empty. Rate-limit helpers exist but are not applied to views; cache storage is process-local even when Redis is configured for Channels.

Fix: fail startup in production without a strong supplied secret, restrict exact trusted origins, default API permissions to authenticated access with explicit public exceptions, and add shared-store throttles to login, registration, contact, offer, booking, upload, and provider-backed endpoints. Add server-side file-type/content/size validation and quotas. `ListingMedia` and verification documents use generic file fields without application-specific upload validation.

### A09 - P1: Rejected Updates Can Still Change the Database

**Reproduced.** `api_views.py:1286` calls `update_listing_asset_and_specs` before validating the listing serializer. A request with invalid price returned HTTP 400 while its district change persisted. Multi-record creation, verification, proposal conversion, and financial updates also lack an explicit transaction boundary in the reviewed paths.

Fix: validate the complete command first, then perform related writes in one atomic transaction. Dispatch notifications after commit. Add rollback tests and concurrency/idempotency tests for transitions that create deals or payouts. Ensure partial media-upload failure produces a recoverable draft rather than ambiguous success.

### A10 - P1: Public Asset Intake Cannot Complete

**Authorization failure reproduced; contract drift source-confirmed.** `api_views.py:2251` requires administrative access for both GET and POST, but `AssetProposalPage.tsx:111` is a public form. It sends `full_name`, `title`, and `proposed_price`, while the model serializer expects the proposal model's fields. The frontend update method is PATCH while the backend accepts PUT. The success screen can invent a random proposal reference instead of displaying a server-issued one.

Fix: separate public creation from administrative review, define one request/response contract, validate ownership/contact inputs, add spam controls, return the stored proposal code, and make conversion preserve the actual seller and asset category. Verify the entire submit-review-convert journey.

### A11 - P1: Search Controls Do Not Match Search Behavior

**Ignored filters reproduced; frontend failures source-confirmed.** `ListingListView` at `api_views.py:822` supports only a subset of the filters emitted by `DiscoveryPage.tsx:87`. Bedrooms, bathrooms, province, sector, furnishing, verification, and sorting are ignored. Search checks title/description, despite location-oriented copy. `DiscoveryPage` initializes from the URL then its `initialQuery=''` effect overwrites the search, breaking homepage search/deep links.

The semantic-search helper (`api/endpoints.ts:32`) calls the ordinary listings endpoint but its consumer expects `{filters}`. It can dereference an undefined filters object. Visual search has a separate route defect in A12.

Fix: establish a validated search schema shared by URL state, filter UI, backend queries, and response types. Use router-supported URL updates. Test every filter and sort option against distinguishing fixtures. Implement real intent parsing with a confirmed filter preview, or remove that control until supported. Map and list views should represent the same result set; account for map bounding boxes and pagination explicitly.

### A12 - P1: Slug Lookup and Visual-Search Routing Are Broken

**Reproduced.** The slug route captures `slug` in `urugwiro/urls.py`, but `ListingDetailView.get_object` reads only `pk`, so an existing slug returns 404. The earlier catch-all slug route captures `visual-search`, so POST `/api/listings/visual-search/` returns 405 before reaching its view.

Fix: order literal/action routes before dynamic routes, use the actual slug argument, preserve published-state filtering, and add route-resolution tests. Increment view counters atomically, outside incidental repeated detail reads where possible.

### A13 - P1: Financial State and Reporting Are Not Reliable

**Source-confirmed.** `ensure_transaction_for_sold_listing` (`api_views.py:741`) is defined but never called. Status updates therefore do not establish the transaction/payout behavior described by that helper. `Transaction.save` (`models.py`, Transaction class) calculates amounts only when both existing totals are zero, so later agreed-price changes can leave stale commission and seller amounts. The helper suppresses payout-creation exceptions.

Reports aggregate only fetched pages. `AdminReports.tsx:106` checks legacy `current_stage`/`escrow_status` fields that `TransactionSerializer` does not return, so its revenue chart does not include normal completed transactions. Seller/owner aggregates combine currencies while reporting RWF, and seller paid totals exclude partial payments. Backend models lack the financial consistency constraints needed to prevent negative or contradictory amounts and unrelated seller/listing/transaction combinations.

Fix: define whether accepting an offer creates a pending deal and which authorized action completes it. Use atomic, idempotent transitions, commission snapshots, explicit currency grouping, reconciled payout balances, and server-side aggregate endpoints. Record paid amounts independently from a payment's final status. Protect historical finance records from destructive listing/seller cascades. Add accounting identity and concurrency tests before exposing financial figures as authoritative.

### A14 - P1: Production Media and Static Delivery Are Incomplete

**Source-confirmed and URL resolution checked; hosting infrastructure not inspected.** The checked-in container runs Daphne and collects static files, but no production static/media server, storage backend, or persistent media volume is configured. With debug false, neither `/static/admin/css/base.css` nor `/media/...` resolves in Django. Vercel's media rewrite points back to that backend; it does not itself supply missing storage.

The Docker build copies the workspace, while `.dockerignore` omits exclusions for `.git-corrupt-backup`, logs, local agent directories, and `.todo`. These exist locally and can enter a local Docker build context; a clean remote Git build may not contain them.

Fix: configure deliberate static delivery and durable public/private media storage, protect private documents, tighten the build context, validate runtime environment variables, and add backup/restore checks. Separate migration execution from concurrent web-worker startup. Add readiness checks for required database/cache dependencies instead of relying only on a constant healthy response.

### A15 - P1: CI and Tests Do Not Protect the Application

**Source-confirmed and checks reproduced.** `urugwiro/tests.py` is empty. No frontend test script exists. `.github/workflows/python-app.yml:30` still optionally installs deleted `requirements.txt`, so it skips application dependency installation after the cleanup. It runs generic pytest instead of a configured Django test suite and has no frontend gate. CI Python 3.10 also differs from Docker's 3.12. Migration drift is present.

Fix: repair CI before large refactoring; install the maintained dependency manifests, align supported runtimes, execute Django tests and migration checks, and run frontend type/build/tests. Add meaningful API authorization and contract tests first, then end-to-end core journeys. Turn relevant lint warnings into ratcheted failures instead of accepting an indefinitely growing baseline. Lock or constrain backend dependencies reproducibly and provide explicit development dependencies.

### A16 - P1: Cached HTML Can Prevent Users Receiving New Releases

**Source-confirmed.** `frontend/public/sw.js:82` returns cached responses first, including `/` and `/index.html`, under a fixed cache name. If application bundles change without changing this service-worker script, returning users can remain on old HTML and bundle references.

Fix: use network-first navigation with a controlled offline fallback, versioned immutable assets, explicit cache ownership, and an update lifecycle. Test deployment of version B over cached version A. Do not cache private documents or user-specific content. Offline support should explicitly distinguish read-only cached data from pending writes.

### A17 - P1: Operational Screens and Trust Claims Can Mislead Users

**Source-confirmed.** `SystemLogsPage.tsx:27` displays hard-coded log entries and has no real log fetch. `ServicesPage.tsx:19` contains hard-coded providers, ratings, and verified flags; these were not verified as real business data. `SystemSettings.tsx:82` marks a nonempty key active after reading local settings, not after contacting the provider. `api/endpoints.ts:253` also contains an unconditional successful AI-test helper.

Homepage slide copy (`HomePage.tsx:58`) promises registry/cadastre verification for every asset, while publication can occur with no verification. Seller layout always labels the user a verified seller. Discovery labels all results verified regardless of their level.

Fix: replace operational fixtures with real authorized data or explicitly disable the feature. Render trust badges from reviewed evidence and distinguish seller claims, document review, and professional inspection. Validate public claims with the actual business process. Provider tests must perform a bounded server-side check without returning secrets, and report unavailable/error states honestly.

### A18 - P2: Pagination and Response Shapes Break Saved Items and Other Views

**Saved-response mismatch reproduced; callers source-confirmed.** `api_views.py:1662` returns paginated `SavedPropertySerializer` records. Discovery expects a flat array of listing-shaped records and can confuse saved-record IDs with listing IDs. Saved IDs and query keys are not user-scoped and cached state is merged rather than reconciled. Several dashboards calculate counts from the first page. Frontend API typings claim plain arrays or review summaries where backend responses use pagination.

Fix: standardize pagination/envelopes, generate API types from an accurate schema, normalize saved-listing data explicitly, paginate all operational lists, and use backend aggregates for totals. Scope private query keys and local storage by user; clear them on logout. Validate review, like, booking, offer, and error response contracts as part of the same inventory.

### A19 - P2: Navigation Exposes Incomplete or Wrong Destinations

**Source-confirmed; selected missing API routes resolved.** `App.tsx:279` maps seller analytics/documents/profile to overview. Customer routes render user-account management rather than the customer CRM. Transactions, payouts, expenses, and documents all render the same reports page. `AdminLayout.tsx:73` emits `admin-announcements`, which is not a valid mapped view, falling back to `/`.

Announcement creation, review deletion, and seller/admin agent-assignment client methods target routes that do not exist. The announcement reader calls the public updates endpoint and its component expects an array of announcement fields. Compare selections render chips, but the existing comparison matrix is not imported into the running application.

Fix: maintain one typed route/navigation registry, replace unsafe view casts, give each shipped workflow its real view, and remove unfinished destinations from navigation until delivered. Separate customers from accounts. Add navigation, route-resolution, and HTTP-method contract tests.

### A20 - P2: System Settings Cannot Update Existing Keys and Expose Secret Values

**Duplicate-key failure reproduced; disclosure source-confirmed.** `api_views.py:2412` creates a new `SystemSetting` on every POST instead of updating the unique key. GET returns every setting value, including provider secrets, to the broad admin-role group. The frontend fetches the stored secret back into its input.

Fix: provide an authorized update/upsert contract, distinguish public configuration from secrets, keep secrets write-only to clients, and restrict secret administration to an explicit capability. Record who changed a setting without recording its value. Update related settings atomically where partial saves would be misleading.

### A21 - P2: Listing Serialization Scales Poorly

**Reproduced.** Public-list query count grew from 13 for one listing to 203 for 20. Nested asset specs, seller user/count fields, likes, inquiries, and conversations trigger repeated reads (`api_views.py:822`, `serializers.py:112`). The detail serializer also sends operational data unnecessary for discovery cards.

Fix: create a small public-card serializer, select related specs/users as needed, annotate counts and saved state, and keep list payloads separate from full detail. Establish a query-count budget that does not grow per listing. Add indexes based on measured query plans for common status/category/location/price searches.

### A22 - P2: Theme and Typography Are Inconsistent

**Source-confirmed; rendered review pending.** `AssetProposalPage.tsx:179` follows the light page background but hard-codes white headings, pale labels, transparent white controls, and dark-theme shadows. The light canvas token is `#f4f6f9` (`index.css:46`), so this combination has predictably poor contrast. Comparison chips have similar dark-only styles.

`index.html` loads three font families while `index.css` declares two different ones through an incorrectly ordered import. The build warns about that import. Typography, corner radii, shadows, and surfaces mix several historical visual styles; settings and operational screens use large decorative framed sections and very small uppercase labels.

Fix: choose one body/UI family and at most one restrained public display family; remove unused font requests. Apply semantic tokens to all light/dark surfaces. Use consistent spacing, compact operational headings, readable field labels, and a small radius scale. Preserve recognizable Urugwiro branding with neutral surfaces, green primary actions, and distinct functional status colors.

### A23 - P2: Mobile Layout and Accessibility Need a Consistent Shell

**Source-confirmed risks; browser validation required.** Public layout has a 64/72px header spacer while discovery subtracts 72/80px from viewport height. Discovery nests scroll containers inside public content with a fixed mobile tab bar and extra bottom padding. `html/body` and layouts hide horizontal overflow, which can conceal rather than solve oversized content. The homepage adds a full-height desktop hero below the header, pushing the actual catalog below the first viewport.

Many spec labels are adjacent to inputs without an associated ID/`htmlFor` (`SpecsForm.tsx:147`). Small uppercase labels, custom drawers, icon controls, and browser `alert`/`confirm`/`prompt` flows need keyboard and screen-reader review. There is useful existing work to reuse: public/admin skip links and a modal provider with dialog semantics and a focus trap.

Fix: use one header/bottom-navigation sizing contract and dynamic viewport sizing, account for safe areas, establish one primary scroll owner per view, associate form labels/errors, and reuse the accessible dialog infrastructure. Verify 360/390/768/1280/1440px layouts, 200% zoom, keyboard-only flows, both themes, mobile virtual keyboard, and long titles/currency amounts. Do not mark this complete until screenshots and interaction checks exist.

### A24 - P2: Listing Wizard Validation and Form Structure Drift

**Source-confirmed.** `UnifiedListingWizard.tsx:135` defines detailed validation but navigation uses a second, weaker `isStageValid` function at line 182. This duplicates rules and leaves detailed errors unused. `SpecsForm` declares components inside render, contributing many static-component lint warnings; these remount unnecessarily. File selection accepts files before meaningful content/size validation.

Fix: one validation schema per stage with server enforcement, stable module-level input components, accessible inline errors and error summaries, draft recovery, upload progress/retry, and protection against accidental duplicate submission. Use a backend draft identifier so interrupted uploads can resume safely.

### A25 - P2: Valuation Is an Unqualified Average of Incompatible Comparables

**Source-confirmed.** `urugwiro/services.py:12` ignores size and does not partition comparables by sale/rent purpose, currency, or rental frequency. The endpoint labels the result RWF regardless of the stored currencies. A sector search does not also constrain its district. Confidence depends only on the number of records, not comparable quality.

Fix: first make the tool a transparent comparable-listings summary with consistent units, currency, purpose, locality, and freshness. Show the source sample and limitations. Do not claim a dependable market valuation until data quality, methodology, and error have been evaluated. Keep suggested asking prices separate from verified valuations.

### A26 - P2: Observability and API Documentation Are Incomplete

**Source-confirmed and schema check reproduced.** `log_service.py:15` logs to `propertyhub.system`, while settings configure `urugwiro.system`. The health endpoint always reports success. Schema generation cannot infer many function-view request/response serializers and reports operation-ID collisions, weakening automated clients and contract tests. Silent exception handling often turns operational failures into empty lists or successful-looking fallbacks.

Fix: align logging names, add request/correlation IDs and secret/PII redaction, implement real operational logging, distinguish unavailable data from zero results, and document schemas/errors/permissions explicitly. Publish health and readiness separately. Add error monitoring, performance metrics, and alerts for auth failures, upload failures, background jobs, and external-provider failures.

### A27 - P2: Maintainability and Asset Delivery Still Carry Legacy Debt

**Source-confirmed and import traversal performed.** Backend business logic is concentrated in roughly 2,500 lines of `api_views.py`; assets/specs/seller changes share a permissive helper. Frontend contains repeated DTO mappings, weak `any` contracts, and alternate components. The built main JS is 266.42 kB and `vendor-react` is 742.71 kB before gzip; broad chunk matching groups multiple React-related dependencies. The favicon PNG alone is about 0.59 MiB. `App.css` still contains starter-demo CSS and is not imported from the active entry graph.

Static TS import traversal found these unreachable candidates: `AgentCalendar`, `Breadcrumb`, `HelpCenter`, the root `components/ListingWizard`, `PrintSpecSheet`, `ReportListing`, `SellerAnalytics`, `SellerSelfRegistration`, `TaskList`, `performance/ImageOptimizer`, `performance/LazyComponent`, `ui/PageHeader`, `ui/StatCard`, `ComparisonMatrix`, `ListingGallery`, `ListingLocationMap`, and `SellerPropertyDetail`. Some represent missing features worth integrating. Confirm references and product intent before removal; no files were deleted during this audit.

Fix: split backend modules by business responsibility while retaining one deployable service; centralize public/private DTOs and shared validation; consolidate components after characterization tests. Lazy-load heavy map/chart/detail functionality based on measured initial-route cost, generate correctly sized logo/icons and responsive images, and verify image loading and bundle budgets.

## Upgrade Direction

### Product and Navigation

The first priority is a trustworthy marketplace with complete business workflows. Keep public browsing separate from operational workspaces, but use a shared visual system and the same listing truth.

| Audience | Primary navigation | Complete journey |
| --- | --- | --- |
| Visitor/customer | Discover, Saved, Compare, Visits/Offers, Messages | Search -> inspect real asset -> understand verification -> contact/book/offer -> track outcome |
| Seller | Overview, Listings, Leads/Messages, Visits, Offers, Documents, Earnings | Draft -> upload -> submit -> resolve review feedback -> publish -> manage interest -> close deal |
| Staff | Work queue, Listings, Verification, Customers, Conversations, Visits, Offers | Review assigned work -> record evidence/action -> follow up -> escalate or complete |
| Finance | Transactions, Commissions, Payouts, Expenses, Reports | Review completed deal -> reconcile amount/currency -> approve payment -> record reference -> reconcile balance |
| Owner/admin | Business overview, People/Permissions, Operations, Reports, Settings/Audit | Manage the business with separate capabilities for user privileges, secrets, and finance |

Do not expose empty feature destinations. Public discovery should prioritize actual listing photographs, price and rental period, district/sector, category-specific facts, and evidence-based verification. Detail pages should show a gallery, clear offer/contact/visit actions, relevant specifications, and a verification explanation. Sensitive owner documents remain private.

Operational pages should use compact headers, efficient filters, tables/queues, consistent detail drawers, clear empty/error/loading states, and visible next actions. Use category-specific facts and units for houses, apartments, land, commercial assets, hotels, cars, and motorbikes. Resolve the category vocabulary once across the model, API, URL filters, and form choices.

### Technical Shape

Retain a modular Django application with PostgreSQL for production, React/TypeScript for the interface, and TanStack Query for server state. Introduce modules for accounts/permissions, catalog/assets, verification, CRM/visits/offers, finance, messaging, and platform configuration as existing code is repaired. Avoid a microservice rewrite.

Use dedicated command serializers, shared authorization policies, atomic business services, documented read models, private/public storage separation, and a queue only for work that actually needs retries or background processing. Use an accurate OpenAPI schema to produce frontend DTOs and contract checks. Treat financial/audit history as durable business records.

## Implementation Sequence and Exit Criteria

Each phase should be reviewed and committed in focused changes. Work starts with the earliest unmet gate. Estimates should follow Phase 0 because scope depends on existing data and deployment state; this audit does not promise a completion date.

| Phase | Scope | Exit criteria |
| --- | --- | --- |
| 0. Contain security failures | A01-A08; private fields/documents; privileged roles; chat membership; contact claiming | Reproduction cases become negative regression tests; public/self-service requests cannot escalate, certify, reassign, or read private data; existing privileged accounts and deployed configuration reviewed |
| 1. Restore engineering controls | A15, A26; CI, tests, migration drift, API/route inventory, supported runtime/dependency setup | Fresh checkout installs and passes CI; migration check clean; auth/permission tests run; documented contracts cover critical flows; no operational screens show unlabelled fixtures |
| 2. Repair marketplace contracts | A09-A12, A18-A20, A24; listings, filters, saved items, proposals, review decisions, settings, navigation | Guest submission -> staff review -> seller draft -> verification -> publication -> discovery -> save/contact/book/offer works end to end; errors do not partially mutate data; every displayed control has a working backend contract |
| 3. Make business operations reliable | A05/A09/A13/A17; CRM assignment, deal transitions, commissions, payouts, audit history | Status transitions are authorized and idempotent; concurrency/rollback cases tested; reports match full database aggregates by currency; privacy and account-switching tests pass |
| 4. Unify design and accessibility | A22-A24; public discovery/detail, seller/admin shells, shared components and forms | Screenshots and interaction checks across defined widths/themes; no clipped or overlapping primary controls; keyboard and screen-reader journeys work; successful, empty, loading, validation, and server-error states are designed |
| 5. Harden delivery and scale | A14/A16/A21/A26/A27; storage, release cache, query/payload budgets, images, logs, backups | Upgrade from cached release A to B succeeds; production media/private-document access verified; backup restore rehearsed; listing query budget constant with page size; load/error budgets measured and enforced |
| 6. Add advanced capabilities | Capabilities below, after prior gates | Each feature has an owner, a real data source, permissions, observability, a fallback, and passing journey tests |

Design exploration and contract documentation can run alongside early backend fixes. Final visual implementation should follow stable payloads so UI work is not repeatedly rebuilt.

### Advanced Capabilities, in Order

| Capability | Why it matters | Prerequisite and release proof |
| --- | --- | --- |
| Saved searches, alerts, and full comparison | Helps buyers return to relevant inventory | Correct search, user-scoped saved state, notification preferences; compare across pages and receive only opted-in matching alerts |
| Map bounds, location hierarchy, and category-aware discovery | Makes regional asset search useful | Valid coordinates and consistent categories/units; map/list synchronization and low-bandwidth testing |
| Draft autosave and resumable media processing | Reduces seller abandonment | Authorized drafts and durable storage; recover after reload, lost connection, and individual file failure |
| Verification checklist and evidence history | Makes badges defensible | Private documents and review transitions; show reviewer/time/scope and correctly revoke stale verification |
| CRM assignment, reminders, and visit calendar | Improves lead follow-through | Verified customer identity and capability rules; prevent duplicate follow-ups and conflicting appointments |
| Transaction, commission, and payout workspace | Gives the business a reliable financial process | Atomic deal model and currency-safe accounting; reconciled balances and auditable approvals |
| Document generation and controlled signing workflow | Supports complete closing records | Agreed templates, access controls, retention rules, and an appropriate signing integration; treat generated drafts separately from executed documents |
| Reporting and funnel analytics | Reveals operational bottlenecks | Real events and agreed definitions; totals reconcile and date/currency filters work |
| Assisted listing copy and intent search | Saves time without inventing facts | Server-side provider integration, bounded cost/rate limits, real health checks, consent where needed, and human review; never infer verification from generated content |
| Improved comparable-property analysis | Makes pricing evidence more useful | Clean purpose/currency/size/location data and evaluation; display comparables, uncertainty, and date rather than unsupported certainty |

### Acceptance Baseline

1. A permission matrix is tested for anonymous, customer, seller, suspended seller, staff, finance, owner, and administrator. Unauthorized object IDs are tested, not just missing login.
2. Core browser journeys cover guest search/intake, account login/logout/expiry, seller submission, staff verification, customer booking/offer, and financial completion. Switching accounts does not reveal previous private cached data.
3. API validation covers money, dates, categories, ownership, file content/size, missing fields, duplicate submissions, and invalid transitions. Rejected commands leave no partial business writes.
4. List/detail contracts, pagination, route ordering, slug lookup, sorting, and filter semantics are automatically checked. API schema validation does not silently ignore critical endpoints.
5. Responsive checks cover 360, 390, 768, 1280, and 1440px widths, both themes, long content, empty data, large datasets, and 200% zoom. Dialogs restore focus, fields have accessible names, and nondecorative images have appropriate alternatives.
6. Set measured performance targets before optimization. Suggested initial targets: public-list query count at most 15 for both 1 and 20 results; API p95 below 500ms under a documented representative load; no unexplained initial-bundle regressions. Browser targets should be measured on representative mobile hardware/network, not inferred from build success.
7. Production release validation includes exact origin/host policy, secret injection, dependency checks, private-media denial, public-media delivery, readiness, rollback, cache upgrade, and backup restoration. No deployment was performed as part of this audit.

## Remaining Validation

The audit does not establish current production exposure, historic misuse, actual traffic capacity, provider availability, or legal/compliance sufficiency. Before sign-off, inspect the deployment environment and access logs, review existing privileged users and data-state anomalies, exercise PostgreSQL concurrency, run a dedicated Python dependency vulnerability scan, test external mail/storage/AI integrations with approved test data, and complete real-browser accessibility/mobile checks.

The earlier cleanup commit remains unchanged. This audit adds documentation only; application fixes are still to be implemented according to the plan. Unrelated local files and existing user data were not removed.

## Primary References

- JWT revocation requires the blacklist app and its migrations, plus explicit token blacklisting: [Simple JWT blacklist documentation](https://django-rest-framework-simplejwt.readthedocs.io/en/stable/blacklist_app.html).
- Custom account creation must invoke password validation explicitly; model-level `create_user` does not apply these validators automatically: [Django password validation](https://docs.djangoproject.com/en/5.2/topics/auth/passwords/#password-validation).
- Cookie-authenticated WebSockets need origin restrictions in addition to application-level authorization: [Django Channels security](https://channels.readthedocs.io/en/stable/topics/security.html).
