# Urugwiro Frontend — Audit Remediation Plan

> **Purpose:** Every issue found in the audit, organized into a clear, executable plan.  
> **Rule:** Work top-to-bottom. Do not skip phases. Check off items as they are completed.  
> **Last Updated:** 2026-09-30

---

## How to Use This Plan

- Each phase is **self-contained** — you can hand it to any developer (or AI) and they can execute it.
- Each task has a **unique ID** (e.g., `P0-01`) for tracking.
- Tasks are ordered by **dependency** — later tasks may depend on earlier ones being done.
- Estimates are in **hours** for a single experienced developer.

---

## Phase 0: Cleanup & Dead Code Removal ✅ COMPLETE

> **Why first:** Removing dead code reduces confusion, bundle size, and prevents future developers from importing orphaned components by mistake.

### P0-01 — Remove orphaned Discovery components ✅ DONE
- **Files to delete:**
  - `frontend/src/features/discovery/components/TechnicalSpecs.tsx` — *temporarily; will be re-wired in P1-01*
  - `frontend/src/features/discovery/components/listing-detail-styles.css` — *temporarily; will be imported in P1-02*
  - `frontend/src/features/discovery/components/ListingSectionEditModal.tsx`
  - `frontend/src/features/discovery/components/AddDiscoveryModal.tsx`
- **Action:** Delete `ListingSectionEditModal.tsx` and `AddDiscoveryModal.tsx` permanently. Move `TechnicalSpecs.tsx` and `listing-detail-styles.css` to a `_deprecated/` folder for now (they will be wired in Phase 1).
- **Verify:** `grep -r "ListingSectionEditModal\|AddDiscoveryModal" frontend/src/` returns nothing.
- **Est:** 0.5h

### P0-02 — Remove dead Seller components ✅ DONE
- **Files to delete:**
  - `frontend/src/features/seller/SellerLaunchpad.tsx` (369 lines, not imported anywhere)
  - `frontend/src/features/seller/SellerInquiryManager.tsx` (not imported by SellerDashboard)
  - `frontend/src/features/seller/components/PropertyEditModal.tsx` (not imported by SellerDashboard)
- **Action:** Confirm no imports exist, then delete.
- **Verify:** `grep -r "SellerLaunchpad\|SellerInquiryManager\|PropertyEditModal" frontend/src/` returns nothing.
- **Est:** 0.5h

### P0-03 — Remove orphaned theme file ✅ DONE
- **File:** `frontend/src/theme/tokens.ts` — nothing imports it.
- **Action:** Delete it. The real design tokens live in `frontend/src/index.css`.
- **Verify:** `grep -r "theme/tokens" frontend/src/` returns nothing.
- **Est:** 0.25h

### P0-04 — Fix incomplete barrel exports ✅ DONE
- **File:** `frontend/src/components/ui/index.ts`
- **Current:** Only exports 5 of 14 modules.
- **Action:** Add exports for: `StatusBadge`, `Toast`, `Timeline`, `EmptyState`, `CalendarView`, `AdminToastSystem`, `types`.
- **Caution:** `EmptyState` exists in both `EmptyState.tsx` and `Dashboard.tsx` — resolve the duplicate before exporting.
- **Est:** 0.5h

### P0-05 — Fix StatusBadge type collapse ✅ DONE
- **File:** `frontend/src/components/ui/StatusBadge.tsx`
- **Issue:** `StatusVariant` type includes `| string`, which collapses the entire union to `string`.
- **Action:** Remove `| string` from the union. Add proper variant literals.
- **Est:** 0.25h

---

## Phase 1: Discovery Engine (Module A) ✅ COMPLETE

> **Goal:** Deliver the plan's "Triple-Pane Layout", "Zero-Reload Filtering", "Luxury Gallery", "Spec-Sheet", and "Conversion Hub".

### P1-01 — Wire TechnicalSpecs into ListingDetail ✅ DONE
- **Files:**
  - `frontend/src/features/discovery/components/TechnicalSpecs.tsx` (un-deprecate)
  - `frontend/src/features/discovery/ListingDetail.tsx`
- **Action:**
  1. Move `TechnicalSpecs.tsx` back from `_deprecated/`.
  2. Import `TechnicalMetric` and `SpecDomain` in `ListingDetail.tsx`.
  3. Replace the inline fact chips (lines 236–253) with `<SpecDomain>` groupings.
  4. Pass listing data as properly typed props.
- **Verify:** Listing detail page shows grouped spec domains with friendly labels and tooltips.
- **Est:** 2h

### P1-02 — Import luxury CSS for ListingDetail ✅ DONE
- **Files:**
  - `frontend/src/features/discovery/components/listing-detail-styles.css` (un-deprecate)
  - `frontend/src/features/discovery/ListingDetail.tsx`
- **Action:**
  1. Move `listing-detail-styles.css` back from `_deprecated/`.
  2. Import it in `ListingDetail.tsx`: `import './components/listing-detail-styles.css'`.
  3. Verify glassmorphism, ken-burns, grain cloak classes are applied.
  4. Remove any conflicting inline styles that override the CSS classes.
- **Verify:** Detail page has luxury glassmorphism effects.
- **Est:** 1h

### P1-03 — Refactor DiscoveryPage to use TanStack Query ✅ DONE
- **File:** `frontend/src/features/discovery/DiscoveryPage.tsx`
- **Current:** Manual `useEffect` + `useState` for main listing fetch (lines 252–287).
- **Action:**
  1. Replace with `useQuery({ queryKey: ['listings', filters], queryFn: () => api.listings.list(cleanedParams) })`.
  2. Add `staleTime: 30_000` (30 seconds).
  3. Add `placeholderData: keepPreviousData` for smooth filter transitions.
  4. Remove manual `loading` and `listings` state — use `isPending` and `data` from the query.
  5. Remove the hacky `_retry: Date.now()` mechanism (line 543) — use `refetch()` instead.
  6. Add proper error state with retry button.
- **Verify:** Filter changes show stale data immediately, then update in background. No full loading spinner.
- **Est:** 3h

### P1-04 — Add error handling to ListingDetail queries ✅ DONE
- **File:** `frontend/src/features/discovery/ListingDetail.tsx`
- **Current:** `useQuery` calls (lines 100–109) have no error handling.
- **Action:**
  1. Destructure `error` from both queries.
  2. Show an error state with retry button when `error` is truthy.
  3. Add skeleton loaders (not just spinner) for the loading state.
- **Verify:** Simulate API failure — user sees error message, not infinite spinner.
- **Est:** 1h

### P1-05 — Implement persistent triple-pane layout ✅ DONE
- **File:** `frontend/src/features/discovery/DiscoveryPage.tsx`
- **Current:** 2-pane by default; map only in "map mode" as 58%/42% split.
- **Action:**
  1. Default view: FilterPane (left, 310px) | ResultsGrid (center, flex-1) | DiscoveryMap (right, 380px).
  2. On screens `< lg`: hide FilterPane (drawer), show ResultsGrid + Map toggle.
  3. On screens `< md`: show either Grid or Map (toggle), not both.
  4. Add a "Map" toggle button in the header to show/hide the map pane.
- **Verify:** Desktop shows three panes side-by-side by default.
- **Est:** 3h

### P1-06 — Add bidirectional map-grid linking ✅ DONE
- **Files:**
  - `frontend/src/features/discovery/components/DiscoveryMap.tsx`
  - `frontend/src/features/discovery/components/ResultsGrid.tsx`
- **Action:**
  1. Lift `hoveredListingId` state to `DiscoveryPage`.
  2. On map marker hover -> highlight corresponding card in grid (scroll into view + ring).
  3. On grid card hover -> highlight corresponding map marker (pulse animation).
  4. On map marker click -> scroll grid card into view.
- **Verify:** Hovering a map marker highlights the grid card and vice versa.
- **Est:** 2h

### P1-07 — Fix visual search filter bypass ✅ DONE
- **File:** `frontend/src/features/discovery/DiscoveryPage.tsx`
- **Current:** `handleVisualSearch` (lines 341–356) directly calls `setListings()`, bypassing filter/URL state.
- **Action:**
  1. Instead of `setListings()`, update the filter state to reflect visual search results.
  2. Or: add a `visualSearchIds` state that the main query uses as an additional filter.
  3. Ensure URL params update so visual search results are shareable.
- **Verify:** Visual search results appear in the filter UI and URL.
- **Est:** 1.5h

### P1-08 — Implement server-side pagination ✅ DONE
- **Files:**
  - `frontend/src/features/discovery/components/ResultsGrid.tsx`
  - `frontend/src/api/endpoints.ts`
- **Current:** Client-side `listings.slice()` — all data loaded into memory.
- **Action:**
  1. Update `api.listings.list()` to accept `page` and `page_size` params.
  2. Update `ResultsGrid` to use server-side pagination via TanStack Query's `keepPreviousData`.
  3. Show "Loading more..." indicator at bottom during page fetch.
  4. Keep client-side pagination as fallback for small datasets.
- **Verify:** Only 20 listings loaded at a time; pagination triggers new API call.
- **Est:** 2h

---

## Phase 2: Seller's Professional Wizard (Module B) ✅ COMPLETE

> **Goal:** Align the wizard with the plan's 5-step model, add Trust Submission and visual Live Preview.

### P2-01 — Restructure wizard to 5 steps ✅ DONE
- **File:** `frontend/src/components/listing-wizard/UnifiedListingWizard.tsx`
- **Current:** 7 steps (Category, Type, Location, Specs, Pricing, Media, Review).
- **Target:** 5 steps per plan:
  1. **Category Selection** — merge Category + Type into one step
  2. **Technical Specs** — merge Specs + Pricing into one step
  3. **Media Studio** — keep as-is
  4. **Trust Submission** — NEW (see P2-02)
  5. **Live Preview** — visual preview (see P2-03)
- **Action:**
  1. Merge `CategorySelector` + `SubtypeSelector` into a single step with a two-column layout.
  2. Merge `SpecsForm` + Pricing fields into a single step.
  3. Update `STAGE_LABELS` and `TOTAL_STAGES`.
  4. Update `StageProgressBar` to show 5 steps.
  5. Adjust `isStageValid()` logic for merged steps.
- **Verify:** Wizard shows 5 steps in the progress bar.
- **Est:** 3h

### P2-02 — Add Trust Submission step ✅ DONE
- **File:** `frontend/src/components/listing-wizard/UnifiedListingWizard.tsx`
- **Action:**
  1. Create `components/listing-wizard/TrustSubmission.tsx`.
  2. Add file upload inputs for: Title Deed, ID Document, Proof of Ownership.
  3. Show upload progress and preview thumbnails.
  4. Add "Skip for now" option (listing will be "Seller-Claimed" until verified).
  5. Store uploaded files in the wizard's FormData.
- **Verify:** Sellers can upload trust documents during the wizard.
- **Est:** 3h

### P2-03 — Add visual Live Preview to Review step ✅ DONE
- **File:** `frontend/src/components/listing-wizard/UnifiedListingWizard.tsx`
- **Current:** Review stage shows a text summary.
- **Action:**
  1. Create a `ListingPreviewCard` component that renders the listing exactly as it will appear in `ListingCard`.
  2. Show it in the Review stage with all entered data.
  3. Add a "Preview as Buyer" toggle that shows the full `ListingDetail` layout.
- **Verify:** Sellers see a visual preview before publishing.
- **Est:** 2.5h

### P2-04 — Fix engagement rate calculation ✅ DONE
- **Files:**
  - `frontend/src/features/seller/SellerPropertyDetail.tsx` (line 449)
  - `frontend/src/features/seller/components/SellerPropertyEditor.tsx` (line 493)
- **Current:** `(visits_count / inquiries_count) * 100` — inverted.
- **Fix:** Change to `(inquiries_count / visits_count) * 100`.
- **Add:** Guard against division by zero.
- **Verify:** Engagement rate shows correct percentage.
- **Est:** 0.5h

### P2-05 — Fix SellerPropertyDetail delete no-op ✅ DONE
- **File:** `frontend/src/features/seller/SellerPropertyDetail.tsx` (line 77)
- **Current:** Delete button shows confirm but logic is commented out.
- **Action:**
  1. Uncomment and implement the delete API call.
  2. Add loading state to the button during deletion.
  3. Navigate back to listings table after successful delete.
  4. Show toast notification on success/failure.
- **Verify:** Delete button actually deletes the listing.
- **Est:** 1h

### P2-06 — Add form validation to wizard ✅ DONE
- **File:** `frontend/src/components/listing-wizard/UnifiedListingWizard.tsx`
- **Action:**
  1. Price: must be > 0, must be a valid number.
  2. Location: province, district, sector required for real estate.
  3. Media: at least 1 image required; max 10 images; max 1 video.
  4. Title: min 10 characters, max 100 characters.
  5. Description: min 50 characters.
  6. Show inline error messages on each field.
  7. Block "Next" button until current stage is valid.
- **Verify:** Cannot proceed with invalid data; clear error messages shown.
- **Est:** 3h

### P2-07 — Replace AI stubs with real integration ✅ DONE
- **Files:**
  - `frontend/src/features/seller/SellerOfferManager.tsx` — `handleAiAnalyze()`
  - `frontend/src/api/endpoints.ts` — `ai.analyzeOffer`, `ai.testConnection`
- **Action:**
  1. Wire `ai.analyzeOffer` to a real backend endpoint (or NVIDIA AI service).
  2. Show loading state during AI analysis.
  3. Display AI recommendation in a modal with accept/reject actions.
  4. If no AI backend exists, hide the AI button with a "Coming Soon" tooltip.
- **Verify:** AI analysis returns real data or is hidden gracefully.
- **Est:** 2h

---

## Phase 3: Design System — "Black Edition" ✅ COMPLETE

> **Goal:** Transform "Institutional Clean" into the plan's "Black Edition" luxury aesthetic.

### P3-01 — Decide on accent color strategy ✅ DONE
- **Options:**
  - **A:** Implement gold/electric accent as the plan describes.
  - **B:** Update the plan to match the current emerald accent.
- **Recommendation:** Option A (gold accent for CTAs, emerald for success/status).
- **Action:**
  1. Add `--color-accent: #d4af37` (gold) for CTAs.
  2. Add `--color-accent-hover: #e5c158`.
  3. Keep emerald for success/status only.
  4. Update `Button` component: primary variant uses gold.
  5. Update `DarkModeToggle` and other accent-colored elements.
- **Verify:** CTAs are gold; success messages are emerald.
- **Est:** 2h

### P3-02 — Add glassmorphism to cards ✅ DONE
- **Files:**
  - `frontend/src/components/ui/ListingCard.tsx`
  - `frontend/src/components/ui/Dashboard.tsx`
  - `frontend/src/index.css`
- **Action:**
  1. Add `.glass-card` utility class: `backdrop-blur-xl bg-white/5 border border-white/10`.
  2. Apply to ListingCard, Dashboard cards, and other elevated surfaces.
  3. Add subtle gradient border effect.
- **Verify:** Cards have frosted-glass effect in dark mode.
- **Est:** 1.5h

### P3-03 — Increase border radius for luxury feel ✅ DONE
- **File:** `frontend/src/index.css`
- **Action:**
  1. Add `--radius-luxury: 1.25rem` (20px).
  2. Add `--radius-luxury-lg: 1.5rem` (24px).
  3. Apply to hero cards, modals, and feature cards.
  4. Keep `--radius-control` at 0.5rem for inputs.
- **Verify:** Feature cards have noticeably larger corner radius.
- **Est:** 0.5h

### P3-04 — Increase border contrast ✅ DONE
- **File:** `frontend/src/index.css`
- **Action:**
  1. Dark mode: change `--color-border` from `rgba(255,255,255,0.10)` to `rgba(255,255,255,0.15)`.
  2. Add `--color-border-strong: rgba(255,255,255,0.25)` for elevated cards.
  3. Apply border-strong to cards that need more definition.
- **Verify:** Card borders are more visible in dark mode.
- **Est:** 0.5h

### P3-05 — Add luxury typography ✅ DONE
- **File:** `frontend/src/index.css`
- **Action:**
  1. Add Google Fonts import: `Inter` (body) + `Playfair Display` (headings).
  2. Set `--font-heading: 'Playfair Display', serif`.
  3. Set `--font-body: 'Inter', sans-serif`.
  4. Apply heading font to all `h1`, `h2`, `h3` and `PageHero` titles.
  5. Add `letter-spacing: -0.02em` to headings for tighter luxury feel.
- **Verify:** Headings use serif font; body uses sans-serif.
- **Est:** 1h

---

## Phase 4: TypeScript & API Layer ✅ COMPLETE

> **Goal:** Eliminate `any` from the API layer and create shared types.

### P4-01 — Create shared Listing type ✅ DONE
- **File:** `frontend/src/types/listing.ts` (new)
- **Action:**
  1. Define `Listing` interface with all fields from the backend model.
  2. Define `ListingCategory` union type.
  3. Define `ListingPurpose` type.
  4. Define `VerificationLevel` type.
  5. Export from `frontend/src/types/index.ts`.
- **Est:** 1.5h

### P4-02 — Create PaginatedResponse generic ✅ DONE
- **File:** `frontend/src/types/api.ts` (new)
- **Action:**
  1. Define `PaginatedResponse<T>` with `count`, `next`, `previous`, `results`.
  2. Define `ApiResponse<T>` wrapper.
  3. Define `ApiError` type.
- **Est:** 0.5h

### P4-03 — Type the API endpoints ✅ DONE
- **File:** `frontend/src/api/endpoints.ts`
- **Action:**
  1. Replace all `any` with proper types.
  2. Use `Listing` type for listing endpoints.
  3. Use `PaginatedResponse<Listing>` for list endpoints.
  4. Add request body types for create/update endpoints.
  5. Add response types for all endpoints.
- **Verify:** `tsc --noEmit` passes with no `any` warnings in the API layer.
- **Est:** 4h

### P4-04 — Fix navigation type assertions ✅ DONE
- **File:** `frontend/src/types/navigation.ts`
- **Issue:** Uses `(user as any).username` and `(user as any).is_superuser`.
- **Action:**
  1. Add `username` and `is_superuser` to `UserRoleLike` interface.
  2. Remove all `as any` assertions.
- **Est:** 0.5h

### P4-05 — Fix imageUrl typing ✅ DONE
- **File:** `frontend/src/lib/imageUrl.ts`
- **Issue:** `getListingImage(listing: any)`.
- **Action:** Change parameter type to `Listing`.
- **Est:** 0.25h

---

## Phase 5: Missing Plan Deliverables ✅ COMPLETE

> **Goal:** Implement features that are in the plan but completely missing from the frontend.

### P5-01 — Land Information Center ✅ DONE
- **Route:** `/land-info`
- **Plan:** "An educational hub with categorized articles on registration and ownership."
- **Action:**
  1. Create `frontend/src/features/public/LandInfoPage.tsx`.
  2. Create `frontend/src/features/public/components/ArticleCard.tsx`.
  3. Add route in `App.tsx`.
  4. Add navigation link in `PublicHeader` or `PublicFooter`.
  5. Fetch articles from `api.public.articles()` (or create endpoint).
  6. Categories: Registration, Ownership, Land Use, Disputes, Taxes.
- **Verify:** `/land-info` shows categorized articles.
- **Est:** 4h

### P5-02 — Professional Services Marketplace ✅ DONE
- **Route:** `/services`
- **Plan:** "A directory of verified surveyors, valuers, and legal experts."
- **Action:**
  1. Create `frontend/src/features/public/ServicesPage.tsx`.
  2. Create `frontend/src/features/public/components/ServiceProviderCard.tsx`.
  3. Add route in `App.tsx`.
  4. Add navigation link.
  5. Filter by: service type (surveyor/valuer/legal), location, verification status.
  6. Provider profile modal with contact info.
- **Verify:** `/services` shows filterable directory of professionals.
- **Est:** 4h

### P5-03 — Buyer Investment Calculator ✅ DONE
- **Route:** `/tools/calculator` or embedded in DiscoveryPage
- **Plan:** "Built-in tool to calculate potential Rental Yield and ROI."
- **Action:**
  1. Create `frontend/src/features/public/InvestmentCalculator.tsx`.
  2. Inputs: property price, monthly rent, down payment %, interest rate, loan term.
  3. Outputs: monthly mortgage, net rental yield, cash-on-cash ROI, total ROI.
  4. Visual chart (Chart.js) showing equity growth over time.
  5. Add link from DiscoveryPage header or ListingDetail sidebar.
- **Verify:** Calculator shows accurate yield and ROI projections.
- **Est:** 3h

### P5-04 — Buyer Comparison Matrix ✅ DONE
- **Route:** `/compare` or modal from DiscoveryPage
- **Plan:** "A side-by-side technical comparison tool for 3+ assets."
- **Action:**
  1. Create `frontend/src/features/discovery/ComparisonMatrix.tsx`.
  2. Allow selecting 3+ listings from discovery (checkbox on cards).
  3. Side-by-side table: price, size, location, specs, features, rating.
  4. Highlight best value in each row (green text).
  5. Add "Compare" button in DiscoveryPage header.
- **Verify:** Can compare 3 listings side-by-side with best-value highlighting.
- **Est:** 3h

### P5-05 — Agent Visit Kanban ✅ DONE
- **Route:** `/agent/visits` or embedded in AdminHub
- **Plan:** "A visual pipeline for managing the buyer journey (Lead -> Scheduled Visit -> Negotiation -> Closing)."
- **Action:**
  1. Create `frontend/src/features/agent/VisitKanban.tsx`.
  2. Four columns: Lead, Scheduled, Negotiation, Closing.
  3. Drag-and-drop cards between columns (use `@dnd-kit/core`).
  4. Card shows: buyer name, property, date, notes.
  5. Add route and navigation for agent role.
- **Verify:** Can drag visits between pipeline stages.
- **Est:** 4h

---

## Phase 6: Accessibility & Polish ✅ COMPLETE

### P6-01 — Add aria-labels to icon buttons ✅ DONE
- **Files:** All components with icon-only buttons
- **Action:**
  1. Add `aria-label` to every icon-only button.
  2. Add `aria-expanded` to dropdown toggles.
  3. Add `aria-current="page"` to active nav items.
- **Est:** 2h

### P6-02 — Make map markers keyboard-accessible ✅ DONE
- **File:** `frontend/src/features/discovery/components/DiscoveryMap.tsx`
- **Action:**
  1. Add `tabIndex={0}` to marker popups.
  2. Add keyboard handler: Enter opens listing detail.
  3. Add `role="button"` and `aria-label` to markers.
- **Est:** 1h

### P6-03 — Add skeleton loaders to all loading states ✅ DONE
- **Files:** All components with loading spinners
- **Action:**
  1. Replace bare spinners with contextual skeletons.
  2. ListingDetail: skeleton for image, title, specs, description.
  3. SellerDashboard: skeleton for stat cards and table rows.
  4. AdminListings: skeleton for table rows.
- **Est:** 2h

### P6-04 — Add focus-visible styles ✅ DONE
- **File:** `frontend/src/index.css`
- **Action:**
  1. Add `:focus-visible` outline style: `2px solid var(--color-accent)`.
  2. Apply to all interactive elements.
  3. Remove default outline only when `:focus-visible` is supported.
- **Est:** 0.5h

---

## Phase 7: Testing & Verification

### P7-01 — Verify TypeScript compiles cleanly
- **Command:** `cd frontend && npx tsc --noEmit`
- **Target:** 0 errors.
- **Est:** 0.5h

### P7-02 — Verify production build succeeds
- **Command:** `cd frontend && npm run build`
- **Target:** Build completes with no errors.
- **Est:** 0.5h

### P7-03 — Manual smoke test — Discovery flow
- **Steps:**
  1. Visit `/discover` — verify triple-pane layout.
  2. Change filters — verify zero-reload (stale-while-revalidate).
  3. Click a listing — verify detail page with spec-sheet.
  4. Open lightbox — verify zoom/pan/keyboard nav.
  5. Make an offer — verify modal flow.
  6. Toggle map — verify bidirectional linking.
- **Est:** 1h

### P7-04 — Manual smoke test — Seller flow
- **Steps:**
  1. Login as seller.
  2. Open Listing Wizard — verify 5 steps.
  3. Complete all steps including Trust Submission.
  4. Verify Live Preview shows visual card.
  5. Publish listing.
  6. Verify it appears in SellerDashboard.
  7. Test delete flow.
- **Est:** 1h

### P7-05 — Manual smoke test — Admin flow
- **Steps:**
  1. Login as admin.
  2. Visit `/admin/verification` — verify workspace.
  3. Visit `/admin/properties` — verify listings table.
  4. Visit `/admin/reports` — verify charts render.
  5. Visit `/admin/settings` — verify settings save.
- **Est:** 1h

---

## Summary

| Phase | Tasks | Est. Hours | Priority |
|-------|-------|-----------|----------|
| 0: Cleanup | 5 | 1.75h | P0 |
| 1: Discovery Engine | 8 | 15.5h | P0-P1 |
| 2: Seller Wizard | 7 | 15.5h | P0-P1 |
| 3: Design System | 5 | 5.5h | P1-P2 |
| 4: TypeScript | 5 | 6.75h | P1 |
| 5: Missing Features | 5 | 18h | P1-P2 |
| 6: Accessibility | 4 | 6h | P2 |
| 7: Testing | 5 | 4.5h | P0 |
| **Total** | **44** | **73.5h** | |

---

## Quick Reference: All Task IDs

| ID | Task | Phase | Est. |
|----|------|-------|------|
| P0-01 | Remove orphaned Discovery components | 0 | 0.5h |
| P0-02 | Remove dead Seller components | 0 | 0.5h |
| P0-03 | Remove orphaned theme file | 0 | 0.25h |
| P0-04 | Fix incomplete barrel exports | 0 | 0.5h |
| P0-05 | Fix StatusBadge type collapse | 0 | 0.25h |
| P1-01 | Wire TechnicalSpecs into ListingDetail | 1 | 2h |
| P1-02 | Import luxury CSS for ListingDetail | 1 | 1h |
| P1-03 | Refactor DiscoveryPage to use TanStack Query | 1 | 3h |
| P1-04 | Add error handling to ListingDetail queries | 1 | 1h |
| P1-05 | Implement persistent triple-pane layout | 1 | 3h |
| P1-06 | Add bidirectional map-grid linking | 1 | 2h |
| P1-07 | Fix visual search filter bypass | 1 | 1.5h |
| P1-08 | Implement server-side pagination | 1 | 2h |
| P2-01 | Restructure wizard to 5 steps | 2 | 3h |
| P2-02 | Add Trust Submission step | 2 | 3h |
| P2-03 | Add visual Live Preview to Review step | 2 | 2.5h |
| P2-04 | Fix engagement rate calculation | 2 | 0.5h |
| P2-05 | Fix SellerPropertyDetail delete no-op | 2 | 1h |
| P2-06 | Add form validation to wizard | 2 | 3h |
| P2-07 | Replace AI stubs with real integration | 2 | 2h |
| P3-01 | Decide on accent color strategy | 3 | 2h |
| P3-02 | Add glassmorphism to cards | 3 | 1.5h |
| P3-03 | Increase border radius for luxury feel | 3 | 0.5h |
| P3-04 | Increase border contrast | 3 | 0.5h |
| P3-05 | Add luxury typography | 3 | 1h |
| P4-01 | Create shared Listing type | 4 | 1.5h |
| P4-02 | Create PaginatedResponse generic | 4 | 0.5h |
| P4-03 | Type the API endpoints | 4 | 4h |
| P4-04 | Fix navigation type assertions | 4 | 0.5h |
| P4-05 | Fix imageUrl typing | 4 | 0.25h |
| P5-01 | Land Information Center | 5 | 4h |
| P5-02 | Professional Services Marketplace | 5 | 4h |
| P5-03 | Buyer Investment Calculator | 5 | 3h |
| P5-04 | Buyer Comparison Matrix | 5 | 3h |
| P5-05 | Agent Visit Kanban | 5 | 4h |
| P6-01 | Add aria-labels to icon buttons | 6 | 2h |
| P6-02 | Make map markers keyboard-accessible | 6 | 1h |
| P6-03 | Add skeleton loaders to all loading states | 6 | 2h |
| P6-04 | Add focus-visible styles | 6 | 0.5h |
| P7-01 | Verify TypeScript compiles cleanly | 7 | 0.5h |
| P7-02 | Verify production build succeeds | 7 | 0.5h |
| P7-03 | Manual smoke test — Discovery flow | 7 | 1h |
| P7-04 | Manual smoke test — Seller flow | 7 | 1h |
| P7-05 | Manual smoke test — Admin flow | 7 | 1h |
