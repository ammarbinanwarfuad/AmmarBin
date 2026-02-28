# Authentication Flow — AmmarBin Portfolio

A complete technical reference for the login and logout system.

---

## Tech Stack

| Piece | What it is |
|---|---|
| **NextAuth v4** | Auth library — handles credentials, JWT signing, session cookies, CSRF |
| **JWT (JSON Web Token)** | Session is stored as a signed token, not in a database |
| **`proxy.ts`** | Next.js edge middleware — runs before every `/admin/*` request |
| **`lib/auth.ts`** | NextAuth configuration — providers, callbacks, session rules |
| **`AdminLayoutClient.tsx`** | Client-side admin shell — secondary auth guard + logout button |
| **`AutoLogout.tsx`** | Inactivity timer — auto-signs out after 30 min of no activity |
| **MongoDB Atlas** | Stores admin `User` documents (email, hashed password, login attempts) |
| **bcryptjs** | Password hashing and verification |

---

## Environment Variables Required

```env
NEXTAUTH_SECRET=<random-string>   # Used to sign/verify JWTs
NEXTAUTH_URL=https://your-domain  # Must exactly match production URL
MONGODB_URI=mongodb+srv://...     # Must allow 0.0.0.0/0 on Atlas for Vercel
```

> **Critical:** `NEXTAUTH_URL` with a wrong value or trailing slash breaks callback redirects.
> **Critical:** Never add a custom `cookies:` block to `authOptions` — it breaks `getServerSession()`.

---

## Session Cookie

NextAuth automatically manages the session cookie name:

| Environment | Cookie name |
|---|---|
| Development (`localhost`) | `next-auth.session-token` |
| Production (HTTPS) | `__Secure-next-auth.session-token` |

The cookie contains a **signed JWT** (not a session ID). The JWT holds:
- `email`
- `id` (MongoDB `_id`)
- `role`
- `iat` (issued at), `exp` (expires at)

The cookie is `HttpOnly` (JavaScript cannot read it) and `SameSite=Lax`. On production it is also `Secure` (HTTPS only).

---

## Login Flow — Step by Step

### 1. User visits `/admin/dashboard` (not logged in)

```
Browser → GET /admin/dashboard
         ↓
      proxy.ts runs (edge middleware)
         ↓
      Checks: req.cookies.get('__Secure-next-auth.session-token')
              || req.cookies.get('next-auth.session-token')
         ↓
      Cookie not found → hasSession = false
         ↓
      NextResponse.redirect('/admin/login?callbackUrl=/admin/dashboard')
```

The user is sent to the login page before any page React code runs.

---

### 2. Login page renders (`/admin/login`)

File: `app/admin/login/page.tsx`

- `proxy.ts` always lets `/admin/login` through (no redirect, no cookie check).
- The page renders a simple email + password form.
- If NextAuth redirected back here with `?error=CredentialsSignin`, a toast is shown.

---

### 3. User submits credentials

```tsx
await signIn("credentials", {
  email,
  password,
  callbackUrl: "/admin/dashboard",
});
```

**What `signIn()` does internally:**

```
Browser → POST /api/auth/csrf         (get a CSRF token)
        → POST /api/auth/callback/credentials
               { email, password, csrfToken, callbackUrl }
                    ↓
             NextAuth calls authorize() in lib/auth.ts
```

---

### 4. `authorize()` in `lib/auth.ts`

This runs **server-side** (Node.js, not edge). Steps:

1. **Check inputs** — throw if email or password is missing.
2. **Rate limit** — in-memory check: max 5 attempts per 15 minutes. If exceeded, throw with lockout time.
3. **Connect to MongoDB** — `connectDB()` with error handling for Atlas network issues.
4. **Find user** — `User.findOne({ email })`. Throw "Invalid credentials" if not found (same message as wrong password — intentionally vague to prevent user enumeration).
5. **Check account lock** — if `user.lockUntil > now`, throw with minutes remaining.
6. **Verify password** — `bcrypt.compare(inputPassword, user.password)`.
7. **Wrong password** — increment `user.loginAttempts`; lock account if ≥ 5; save; throw.
8. **Correct password** — reset `loginAttempts = 0`, clear `lockUntil`, update `lastLogin` + `lastLoginIp`; save; reset rate limit.
9. **Return user object** — `{ id, email, name, role }` — NextAuth receives this and continues.

---

### 5. JWT is created

After `authorize()` returns the user object, NextAuth calls the `jwt` callback:

```typescript
async jwt({ token, user }) {
  if (user) {
    token.id   = user.id;
    token.role = user.role;
    token.email = user.email;
  }
  return token;
}
```

NextAuth signs this token with `NEXTAUTH_SECRET` and sets it as an `HttpOnly` cookie on the response.

Session config:
```typescript
session: {
  strategy: "jwt",
  maxAge: 2 * 60 * 60,    // Cookie expires in 2 hours
  updateAge: 30 * 60,      // JWT refreshed every 30 minutes of activity
}
```

---

### 6. Browser is redirected to dashboard

NextAuth reads `callbackUrl` from the POST body and issues a `302 Found` response pointing to `/admin/dashboard`. The browser follows it. The session cookie is now set.

---

### 7. Dashboard renders

```
Browser → GET /admin/dashboard
         ↓
      proxy.ts: cookie found → hasSession = true → NextResponse.next()
         ↓
      Server component (app/admin/dashboard/page.tsx) renders
         ↓
      AdminLayoutClient mounts → useSession() → status = "authenticated"
         ↓
      Full dashboard UI shown
```

---

### 8. How `useSession()` works on subsequent requests

`SessionProvider` (in `app/providers.tsx`) wraps the whole app. It is configured with:

```tsx
<SessionProvider
  refetchInterval={0}          // Don't poll for session changes
  refetchOnWindowFocus={false} // Don't re-fetch when tab is refocused
  refetchWhenOffline={false}
>
```

When a page mounts, `useSession()` calls `GET /api/auth/session`. NextAuth reads the cookie, verifies the JWT signature with `NEXTAUTH_SECRET`, calls the `session` callback to attach `id` and `role`, and returns the session object to the client.

---

## Logout Flow — Step by Step

### Manual logout (Logout button)

File: `app/admin/AdminLayoutClient.tsx`

```typescript
const handleLogout = async () => {
  if (isLoggingOut) return;       // Prevent double-click
  setIsLoggingOut(true);

  const savedTheme = localStorage.getItem('theme');
  localStorage.clear();            // Clear all local storage
  if (savedTheme) localStorage.setItem('theme', savedTheme); // Restore theme

  await signOut({ callbackUrl: '/admin/login' });
};
```

**What `signOut({ callbackUrl })` does:**

```
Browser → POST /api/auth/signout   (with CSRF token)
               ↓
         NextAuth deletes the session cookie server-side
         (sets it to an empty string with maxAge=0)
               ↓
         302 redirect → /admin/login
               ↓
         Browser follows redirect, cookie is gone
               ↓
         proxy.ts: no cookie → NextResponse.next() → login page renders
```

---

### Auto-logout (Inactivity timer)

File: `components/AutoLogout.tsx`

Only active on `/admin/*` routes when `status === "authenticated"`.

| Timer | Duration | What happens |
|---|---|---|
| Warning | 25 minutes of inactivity | Toast shown: "You will be logged out in 5 minutes" with a "Stay Logged In" button |
| Logout | 30 minutes of inactivity | `signOut({ callbackUrl: '/admin/login' })` called automatically |

Activity events that reset the timer: `mousedown`, `mousemove`, `keypress`, `scroll`, `touchstart`, `click`.

Clicking "Stay Logged In" in the warning toast calls `resetTimer()`, restarting both timers.

---

## Route Protection Summary

| Route | Protected by |
|---|---|
| `/admin/login` | Nothing — always accessible |
| `/admin/*` (all other admin routes) | `proxy.ts` edge middleware (first line of defence) |
| `/admin/*` (client-side fallback) | `AdminLayoutClient.tsx` — if `useSession()` returns `"unauthenticated"`, hard-navigates to login |

### Why two guards?

- **`proxy.ts`** runs at the edge (before any server or client code). It blocks unauthenticated requests immediately using the cookie presence check. This is fast but can only check if the cookie *exists*, not if the JWT is valid.
- **`AdminLayoutClient`** runs on the client after hydration. It calls `/api/auth/session` which fully verifies the JWT. If the JWT is expired or tampered, `useSession()` returns `"unauthenticated"` and the client redirects to login.

---

## Security Features

| Feature | Implementation |
|---|---|
| Password hashing | `bcryptjs` — passwords never stored in plain text |
| Brute force protection | In-memory rate limit: 5 attempts / 15 min window |
| Account lockout | MongoDB: after 5 wrong passwords, account locked for 30 min |
| JWT signing | `NEXTAUTH_SECRET` — HS256 by default |
| HttpOnly cookie | JavaScript (XSS) cannot read the session token |
| CSRF protection | NextAuth requires a CSRF token on all `POST /api/auth/*` requests |
| Hard navigation on logout | `signOut({ callbackUrl })` triggers a full browser navigation, resetting the `SessionProvider` cache — prevents stale session from lingering |
| Theme preservation | `localStorage` is cleared on logout but `theme` key is saved and restored first |

---

## Known Design Decisions & Why

### Why `proxy.ts` and not `middleware.ts`?

This project uses **Next.js 16**, which requires the edge middleware export to be named `proxy` (exported from `proxy.ts`). The standard `middleware.ts` file is not used by this version.

### Why does `proxy.ts` NOT redirect authenticated users away from `/admin/login`?

The edge middleware can only check if the cookie **exists**, not if the JWT inside it is **valid**. After logout, `signOut` clears the cookie server-side but the browser may still have the old cookie in its jar during the redirect chain. If the middleware bounced users to `/admin/dashboard` on cookie existence, the dashboard would load, `useSession()` would verify the JWT (invalid after logout), get `"unauthenticated"`, and hard-navigate back to `/admin/login` — which would trigger the bounce again. **Infinite loop.** So `/admin/login` is always allowed through unconditionally.

### Why `window.location.href` instead of `router.push()`?

`router.push()` is Next.js soft navigation — it reuses the current React tree including `SessionProvider`. The stale session cache (`status = "authenticated"`) survives a soft nav, causing a brief bounce. `window.location.href` is a full browser navigation — it destroys the entire React tree, all caches, and starts fresh. This is essential for correct auth state after logout.

### Why not `redirect: false` on `signIn`?

Using `signIn({ redirect: false })` returns a result object to JavaScript. The JS code then calls `window.location.href = '/admin/dashboard'`. This is a **two-step** operation: (1) NextAuth sets the cookie, (2) JS navigates. On Vercel (edge latency + cold starts), there was a race condition where the browser navigated before the `Set-Cookie` header was fully committed to the browser's cookie jar. The native `signIn({ callbackUrl })` approach is **atomic** — the server returns a `302` with `Set-Cookie` in the same response, so the cookie is always committed before the redirect is followed.

---

## Flow Diagrams

### Login

```
User fills form
      │
      ▼
signIn("credentials", { callbackUrl: "/admin/dashboard" })
      │
      ▼
POST /api/auth/callback/credentials
      │
      ├─ Rate limit exceeded? → redirect back to /admin/login?error=...
      ├─ User not found?      → redirect back to /admin/login?error=CredentialsSignin
      ├─ Account locked?      → redirect back to /admin/login?error=CredentialsSignin
      ├─ Wrong password?      → increment attempts → redirect back to /admin/login?error=CredentialsSignin
      │
      └─ Correct password ✓
            │
            ▼
         jwt() callback → sign JWT → Set-Cookie: next-auth.session-token
            │
            ▼
         302 → /admin/dashboard
            │
            ▼
         proxy.ts: cookie present → allow through
            │
            ▼
         Dashboard renders
```

### Logout

```
User clicks Logout button
      │
      ▼
localStorage.clear() (preserve theme)
      │
      ▼
signOut({ callbackUrl: '/admin/login' })
      │
      ▼
POST /api/auth/signout  (CSRF verified)
      │
      ▼
NextAuth: Set-Cookie: next-auth.session-token=; maxAge=0  (delete cookie)
      │
      ▼
302 → /admin/login
      │
      ▼
proxy.ts: no cookie → NextResponse.next() → login page renders
```

### Session expiry / token invalid

```
User is on /admin/dashboard
JWT expires (after 2 hours) or cookie is tampered
      │
      ▼
useSession() polls /api/auth/session
      │
      ▼
NextAuth: JWT verification fails → returns empty session
      │
      ▼
useSession() → status = "unauthenticated"
      │
      ▼
AdminLayoutClient useEffect fires
      │
      ▼
window.location.href = "/admin/login"   (hard nav, full browser reset)
      │
      ▼
proxy.ts: no valid cookie → NextResponse.next() → login page renders
```
