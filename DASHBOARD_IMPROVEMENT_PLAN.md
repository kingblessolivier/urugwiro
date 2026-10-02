# Urugwiro Dashboard — International Best-Practice Improvement Plan

> **Goal:** Transform the dashboard system to match world-class standards (Linear, Vercel, Stripe).
> **Date:** 2026-10-02
> **Rule:** Work top-to-bottom. Check off items as completed.

---

## How to Use This Plan

- Each phase is **self-contained** — can be handed to any developer or AI.
- Each task has a **unique ID** (e.g., `A-01`) for tracking.
- Tasks are ordered by **dependency** — later tasks may depend on earlier ones.
- Estimates are in **hours** for a single experienced developer.

---

## Phase A: Quick Wins (High Impact, Low Effort) ✅ COMPLETE

> **Goal:** Fix the most visible inconsistencies immediately. These are small changes that make a big visual difference.

### A-01 — Use StatusBadge component everywhere ✅ DONE
- **Files:** SellerOfferManager, AdminOffers, AdminEnquiries, AdminSellerManager, AdminListingsPage, SellerListingsTable
- **Action:** Replace all inline chip variations with `<StatusBadge status={...} size="sm" />`
- **Est:** 2h

### A-02 — Use SkeletonCard/SkeletonGrid for loading states ✅ DONE
- **Files:** SellerListingsTable, AdminListingsPage, SellerOfferManager, AdminOffers, AdminSellerManager, AdminEnquiries
- **Action:** Replace "Loading..." text with `<SkeletonGrid count={6} />`
- **Est:** 1.5h

### A-03 — Use EmptyState/ErrorState for empty/error states ✅ DONE
- **Files:** All table components
- **Action:** Replace `p-12 text-center` with `<EmptyState />` and add `<ErrorState />` where missing
- **Est:** 2h

### A-04 — Standardize backdrop opacity ✅ DONE
- **Files:** All drawer/modal components
- **Action:** Change all `bg-black/60`, `bg-black/80` to `bg-black/50`
- **Est:** 0.5h

### A-05 — Standardize icon sizes ✅ DONE
- **Files:** All components
- **Action:** 16px for sidebar/table/buttons, 18px for header/cards, 20px for empty states
- **Est:** 1h

### A-06 — Add sticky table headers ✅ DONE
- **Files:** components/ui/Dashboard.tsx (tableHead constant)
- **Action:** Add `sticky top-0 z-10` to `tableHead`
- **Est:** 0.25h

### A-07 — Add zebra striping to tables ✅ DONE
- **Files:** components/ui/Dashboard.tsx (tableBody constant)
- **Action:** Add `even:bg-[var(--color-bg-surface)]` to `tableBody`
- **Est:** 0.25h

### A-08 — Standardize close button in modals ✅ DONE
- **Files:** ModalProvider, all modal components
- **Action:** Use Lucide `X` icon, `size={16}`, `p-1.5 rounded-lg hover:bg-[var(--color-bg-elevated)]`
- **Est:** 0.5h

---

## Phase B: Component Unification ✅ COMPLETE

> **Goal:** Create shared components to eliminate duplication and ensure consistency.

### B-01 — Create shared Sidebar component ✅ DONE
- **File:** components/layout/Sidebar.tsx (new)
- **Props:** `sections`, `items`, `badges`, `collapsible`, `activeView`, `onNavigate`, `user`
- **Action:** Unify SellerLayout, AdminLayout, SellerDashboard sidebars into one component
- **Est:** 4h

### B-02 — Create shared Topbar component ✅ DONE
- **File:** components/layout/Topbar.tsx (new)
- **Props:** `breadcrumbs`, `search`, `actions`, `user`, `onMenuToggle`
- **Action:** Unify all header implementations
- **Est:** 3h

### B-03 — Create shared Badge component ✅ DONE
- **File:** components/ui/Badge.tsx (new)
- **Props:** `count`, `variant`, `dot`
- **Action:** Unify all badge styles across sidebars
- **Est:** 1h

### B-04 — Create shared PageHeader component ✅ DONE
- **File:** components/ui/PageHeader.tsx (new)
- **Props:** `title`, `description`, `actions`
- **Action:** Replace repeated page title + description pattern
- **Est:** 1h

### B-05 — Create shared StatCard component ✅ DONE
- **File:** components/ui/StatCard.tsx (new)
- **Props:** `label`, `value`, `icon`, `tone`, `trend`
- **Action:** Replace all KPICard variants (AdminHub, OwnerLaunchpad, SellerDashboard)
- **Est:** 1.5h

### B-06 — Standardize border radius and shadows ✅ DONE
- **Files:** index.css, all components
- **Action:** Replace `rounded-lg/xl/2xl` with CSS variables, replace `shadow-sm/lg/xl` with CSS variables
- **Est:** 2h

---

## Phase C: Advanced Features ✅ COMPLETE

> **Goal:** Add world-class features that power users expect.

### C-01 — Adopt TanStack Table for data tables ✅ DONE
- **Files:** SellerListingsTable, AdminListingsPage, AdminOffers, AdminEnquiries, AdminSellerManager
- **Action:** Replace hand-rolled HTML tables with TanStack Table (sorting, filtering, pagination)
- **Est:** 6h

### C-02 — Add focus trap to modals ✅ DONE
- **File:** components/modal/ModalProvider.tsx
- **Action:** Implement focus trap (tab/shift+tab cycle within modal)
- **Est:** 2h

### C-03 — Add exit animations ✅ DONE
- **Files:** All modal/drawer components
- **Action:** Add 150ms fade-out before unmount
- **Est:** 1.5h

### C-04 — Add prefers-reduced-motion support ✅ DONE
- **File:** index.css
- **Action:** Add `@media (prefers-reduced-motion: reduce)` to disable animations
- **Est:** 0.5h

### C-05 — Add table density toggle ✅ DONE
- **Files:** components/ui/Dashboard.tsx
- **Action:** Compact (py-2) / Comfortable (py-3) / Relaxed (py-4)
- **Est:** 1.5h

### C-06 — Add column visibility toggle ✅ DONE
- **Files:** SellerListingsTable, AdminListingsPage
- **Action:** Dropdown in table header to show/hide columns
- **Est:** 2h

### C-07 — Add bulk actions bar ✅ DONE
- **Files:** SellerListingsTable, AdminListingsPage
- **Action:** Floating bar when rows selected (Delete, Export, Change Status)
- **Est:** 2h

---

## Phase D: Mobile & Polish ✅ COMPLETE

> **Goal:** Match world-class mobile experience.

### D-01 — Remove bottom tab bars, use FAB + drawer ✅ DONE
- **Files:** SellerLayout, PublicLayout
- **Action:** Replace MobileTabBar with floating action button + drawer navigation
- **Est:** 3h

### D-02 — Standardize drawer width to 288px ✅ DONE
- **Files:** All drawer components
- **Action:** Change all drawer widths to `w-72` (288px)
- **Est:** 0.5h

### D-03 — Add swipe-to-close on mobile drawers ✅ DONE
- **Files:** All drawer components
- **Action:** Add touch gesture handler for swipe-right-to-close
- **Est:** 2h

### D-04 — Add safe-area-inset-bottom ✅ DONE
- **Files:** All mobile components
- **Action:** Add `pb-[env(safe-area-inset-bottom)]` for notched devices
- **Est:** 0.5h

### D-05 — Add page transition animations ✅ DONE
- **File:** App.tsx
- **Action:** Add subtle `fade-in 150ms` on route change
- **Est:** 1h

### D-06 — Add keyboard navigation to sidebars ✅ DONE
- **Files:** components/layout/Sidebar.tsx
- **Action:** Arrow keys to navigate, Enter to select
- **Est:** 1.5h

---

## Summary

| Phase | Tasks | Est. Hours | Priority |
|-------|-------|-----------|----------|
| A: Quick Wins | 8 | 8.5h | P0 |
| B: Component Unification | 6 | 13h | P1 |
| C: Advanced Features | 7 | 15.5h | P1-P2 |
| D: Mobile & Polish | 6 | 9h | P2 |
| **Total** | **27** | **46h** | |

---

## Quick Reference: All Task IDs

| ID | Task | Phase | Est. |
|----|------|-------|------|
| A-01 | Use StatusBadge everywhere | A | 2h |
| A-02 | Use SkeletonCard/SkeletonGrid | A | 1.5h |
| A-03 | Use EmptyState/ErrorState | A | 2h |
| A-04 | Standardize backdrop opacity | A | 0.5h |
| A-05 | Standardize icon sizes | A | 1h |
| A-06 | Add sticky table headers | A | 0.25h |
| A-07 | Add zebra striping | A | 0.25h |
| A-08 | Standardize close button | A | 0.5h |
| B-01 | Create shared Sidebar | B | 4h |
| B-02 | Create shared Topbar | B | 3h |
| B-03 | Create shared Badge | B | 1h |
| B-04 | Create shared PageHeader | B | 1h |
| B-05 | Create shared StatCard | B | 1.5h |
| B-06 | Standardize radius/shadows | B | 2h |
| C-01 | Adopt TanStack Table | C | 6h |
| C-02 | Add focus trap to modals | C | 2h |
| C-03 | Add exit animations | C | 1.5h |
| C-04 | Add prefers-reduced-motion | C | 0.5h |
| C-05 | Add table density toggle | C | 1.5h |
| C-06 | Add column visibility toggle | C | 2h |
| C-07 | Add bulk actions bar | C | 2h |
| D-01 | Remove bottom tab bars | D | 3h |
| D-02 | Standardize drawer width | D | 0.5h |
| D-03 | Add swipe-to-close | D | 2h |
| D-04 | Add safe-area-inset | D | 0.5h |
| D-05 | Add page transitions | D | 1h |
| D-06 | Add keyboard nav to sidebar | D | 1.5h |
