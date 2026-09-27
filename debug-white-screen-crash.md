# Debug Session: white-screen-crash

> Session opened: 2026-09-27 00:00 UTC
> Bug: App "opens then disappears — only white screen" → React root unmounts / crashes after initial paint
> Regression window: Previous session edits on `ListingDetail.tsx` (ambient atmosphere, scroll-spy, at-a-glance, new offer modal)
> Status: `[OPEN]` Hypothesizing → Evidence Gathering → Fix → Verify

---

## 1. Hypotheses (falsifiable, ranked)

| ID | Hypothesis | Status | Evidence Log Ref |
|----|------------|--------|------------------|
| H1 | Polymorphic at-a-glance / price-intel compute reads undefined spec field → TypeError → BOUNDARY crash | PENDING | — |
| H2 | IntersectionObserver root = scrollContainerRef (maybe non-scrollable) → Chrome TypeError in construction | PENDING | — |
| H3 | timeAgo(undefined) → NaN in rendered JSX → React catches & unmounts tree | PENDING | — |
| H4 | Leaflet L.divIcon / MapContainer invoked before window ready in React 19 strict | PENDING | — |
| H5 | Ambient svg utf8 data-URI inline-style percent sign → parse error / hydration → React unmounts root | PENDING | — |

---

## 2. Instrumentation Plan (Minimal — no business logic)

1. `window.onerror` + `window.onunhandledrejection` → POST to Debug Server
2. Wrap ListingDetail return in an ErrorBoundary for named errors
3. Try/catch in atAGlance / priceIntelligence blocks (error tags → Debug Server)
4. Try/catch around IntersectionObserver construction + observer.observe()

---

## 3. Evidence Log

### Session Server
- Debug Server URL:
- Log file: `trae-debug-log-white-screen-crash.ndjson`

### Error 001
- Timestamp:
- Type: window.onerror / promise / boundary
- Message:
- Stack:
- Status: Pending

---

## 4. Fix Plan

PENDING EVIDENCE

## 5. Post-fix Verification

PENDING FIX APPLIED + LOG CONFIRMED ZERO CRASH

---

## Session Closure Gate

User must confirm **A (Fixed)** before cleanup. Options:
- A. Fixed / No white screen — proceed cleanup
- B. Still reproducible — iterate
- C. Symptoms changed — re-hypothesize
- D. Abort — cleanup + summary
