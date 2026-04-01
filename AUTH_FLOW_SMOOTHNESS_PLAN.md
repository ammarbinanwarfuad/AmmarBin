# Auth Flow Smoothness Plan (Merged and Updated)

This version compares both plans and merges them into one implementation path.

## Implementation Tracker

- [x] Phase 1 implemented
- [x] Phase 2 implemented
- [x] Phase 3 implemented
- [x] Phase 4 implemented
- [x] Phase 5 implemented
- [x] Phase 6 implemented
- [x] Phase 7 verification completed

### Change Log

1. Phase 1 complete:
  - Updated login callback to use sanitized callbackUrl from query params.
  - Fallback remains /admin/dashboard.
2. Phase 6 complete:
  - Wrapped signIn in try/catch/finally and always reset isSubmitting.
3. Phase 5 partial:
  - Reduced first-paint swap by setting login motion initial to false.
  - Suspense fallback now matches login card layout more closely.
4. Phase 4 complete:
  - Replaced localStorage.clear with targeted removeItem cleanup in admin logout and auto-logout.
  - Preserved theme and avoided nuking unrelated local storage.
5. Phase 3 complete:
  - Replaced normal unauthenticated client redirect with router.replace for smoother transitions.
  - Kept hard navigation only as fallback in AdminLayout logout error path.
6. Phase 2 complete:
  - Upgraded edge auth gate in proxy to validate NextAuth token instead of checking cookie existence only.
  - Unified admin guard UI into one stable Checking session state to reduce double flicker.
7. Phase 5 complete:
  - Removed login page Suspense boundary to avoid first-paint spinner-to-card swap.
  - Replaced useSearchParams dependency with one-time client URL parsing.
  - Kept motion initial false for smoother first render.
8. Phase 7 complete:
  - Ran npm run lint and npm run build successfully.
  - Verified no compile or lint regressions from auth-flow changes.

## Comparison Summary

What to adopt from the suggested plan:
1. Respect callbackUrl during login.
2. Reduce client-side redirect jank.
3. Replace full localStorage clear with targeted cleanup.
4. Refine login first paint by reducing competing loading/animation layers.
5. Add robust try/catch/finally around sign-in.

What to adjust from the suggested plan:
1. Do not fully remove hard redirects everywhere. Keep them only as last-resort fallback for stale session edge cases.
2. Edge should not rely on cookie existence alone. Either validate JWT at edge or keep server-side session checks authoritative and simplify client visual states.

## Goals

- Remove redirect hops and auth flicker.
- Keep login/logout deterministic across edge, server, and client.
- Preserve security while improving UX smoothness.

## Scope (Issues 1-6)

1. Callback URL ignored on login.
2. Edge cookie check vs client session mismatch causing jank.
3. Hard navigation redirects causing rough transitions.
4. Heavy localStorage clear usage on logout.
5. Login Suspense and motion first-paint swap.
6. Missing resilient error handling in sign-in submit flow.

---

## Phase 0: Baseline and Safety

### Step 0.1: Capture baseline behavior
- Visit /admin/login directly.
- Visit protected admin route while logged out (example: /admin/projects).
- Login from protected-route redirect flow.
- Logout from sidebar.
- Trigger auto-logout (shorten timeout in local test if needed).

### Step 0.2: Baseline expectations
- No loop.
- No extra hop to dashboard when callbackUrl exists.
- No stuck signing-in state.

---

## Phase 1: Fix Redirect Target (Issue 1)

### Step 1.1: Honor callbackUrl on login
- File: app/admin/login/page.tsx
- Replace hardcoded callback with:
  - callbackUrl from search params
  - sanitize to internal path only
  - fallback to /admin/dashboard

### Step 1.2: Validation
- Open /admin/projects while logged out.
- After login, confirm direct arrival at /admin/projects.

---

## Phase 2: Align Auth Authority and Remove Visual Jank (Issue 2)

### Step 2.1: Improve edge check quality
- File: proxy.ts
- Replace plain cookie-exists gate with validated token check when feasible.
- If token validation is not adopted now, keep middleware minimal and rely on server session checks for final authority.

### Step 2.2: Simplify client guard UI
- File: app/admin/AdminLayoutClient.tsx
- Collapse Loading and Redirecting into one stable guard state to avoid double flicker.
- Keep session checks, but reduce visible state churn.

### Step 2.3: Validation
- Test with expired cookie and stale tab.
- Confirm no bounce loop between login and dashboard.

---

## Phase 3: Smooth Redirect Mechanics (Issue 3)

### Step 3.1: Use soft navigation for normal paths
- Files:
  - app/admin/AdminLayoutClient.tsx
  - components/AutoLogout.tsx
- Prefer NextAuth redirect behavior and router navigation in normal flow.
- Keep hard navigation only in catch/fallback paths when session cache is inconsistent.

### Step 3.2: Validation
- Login and logout should not feel like full page refresh in healthy path.
- Recovery path still works under error conditions.

---

## Phase 4: Surgical Storage Cleanup (Issue 4)

### Step 4.1: Remove localStorage clear nuke
- Files:
  - app/admin/AdminLayoutClient.tsx
  - components/AutoLogout.tsx
- Replace localStorage.clear with explicit removeItem list.
- Preserve theme key.
- Add comment documenting managed keys.

### Step 4.2: Validation
- Theme persists through logout.
- Unrelated local storage data remains intact.

---

## Phase 5: Login First-Paint Stability (Issue 5)

### Step 5.1: Reduce competing first-paint layers
- File: app/admin/login/page.tsx
- Preferred: remove page-level Suspense if not required.
- Alternative: keep Suspense but make fallback layout match final card container exactly.

### Step 5.2: Motion refinement
- File: app/admin/login/page.tsx
- Use initial false or mount-guard for first paint.
- Reduce entrance distance and duration if motion remains.

### Step 5.3: Validation
- Fresh tab load on /admin/login has no obvious visual swap.

---

## Phase 6: Harden Sign-In Error Path (Issue 6)

### Step 6.1: Add resilient submit flow
- File: app/admin/login/page.tsx
- Wrap signIn in try/catch/finally.
- Always reset isSubmitting in finally.
- Show toast for unexpected exceptions.

### Step 6.2: Validation
- Simulate API/network failure.
- Confirm button exits Signing in state and form remains usable.

---

## Phase 7: Verification Matrix

### Step 7.1: Automated checks
- npm run lint
- npm run build

### Step 7.2: Manual flow checks
- Logged out -> protected admin route.
- Login with callbackUrl.
- Direct login page open.
- Logout from sidebar.
- Auto-logout trigger.
- Browser back button after logout.

### Step 7.3: Production checks
- Test cold browser and warm browser sessions.
- Verify no loops, no stuck loading, and no first-paint auth flicker.

---

## Rollout Strategy

1. Ship Phase 1 + Phase 6 first (quick win, low risk).
2. Ship Phase 4 next (safe UX improvement).
3. Ship Phase 2 + Phase 3 together (auth gate consistency).
4. Ship Phase 5 last with visual QA.

---

## Acceptance Criteria

- callbackUrl is respected and sanitized.
- No login/logout redirect loops.
- Admin auth guard does not show double loading/redirect flicker.
- Logout preserves theme and does not wipe unrelated storage.
- Login page first paint is stable.
- No stuck Signing in state on failure.
- Lint and build pass cleanly.

---

## Runtime QA Checklist

This section records a focused pass/fail style checklist for the live flows.

| Flow | Status | Notes |
| --- | --- | --- |
| Login with callbackUrl | PASS for implementation, LIVE QA PENDING | Login page now reads a sanitized internal callbackUrl and uses it in signIn. Verified by lint/build, but a real browser login with admin credentials is still needed to confirm end-to-end redirect behavior. |
| Logout from admin shell | PASS for implementation, LIVE QA PENDING | Admin and auto-logout flows now use targeted localStorage cleanup and smoother router-based navigation. Needs a live browser session to confirm visual smoothness and no theme flash. |
| Auto-logout timeout | PASS for implementation, LIVE QA PENDING | The timeout path now uses the same targeted cleanup + redirect handling as manual logout. Needs a timed browser session to confirm toast/redirect UX. |
| Stale-cookie / expired-session case | PASS for implementation, LIVE QA PENDING | Proxy now validates the NextAuth token at the edge and the client guard shows one stable checking state. Needs a real stale-cookie browser test to confirm no bounce loop. |

### Runtime QA Result Summary

- Code-path verification: PASS.
- Lint/build verification: PASS.
- Live credentialed browser verification: PENDING.

### Manual Follow-Up To Run In Browser

1. Open /admin/login with a callbackUrl from a protected route.
2. Log in and verify the final destination matches the callback.
3. Log out from the admin shell and confirm no white flash or theme reset.
4. Wait for auto-logout and confirm the warning, redirect, and cleanup path.
5. Test an expired/stale admin cookie and confirm no redirect loop.
