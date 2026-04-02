# Eczcalibur — Architectural Decisions

## Phase 1 — Auth & Routing

### D-001: Single Clerk account (parent only), child access via PIN
**Decision:** Only the parent creates a Clerk account. Child access is implemented as a PIN-gated route group within the parent's session — not a separate Clerk account or role.

**Rationale:** SRD specifies "child login is PIN-based — no email required" and "session persistence: parent stays logged in; child view accessible via PIN within the same app session." A second Clerk account for the child would add unnecessary complexity for a hackathon build.

**Impact:** `/(child)` routes are guarded by `PinGate` (expo-secure-store), not a Clerk role check. `/(parent)` routes are guarded by Clerk `isSignedIn`.

---

### D-002: Env var prefix is EXPO_PUBLIC_, not NEXT_PUBLIC_
**Decision:** Clerk publishable key is stored as `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` in `.env`.

**Rationale:** Expo's Metro bundler only inlines env vars prefixed with `EXPO_PUBLIC_`. `NEXT_PUBLIC_` is a Next.js convention and does not work in Expo.

---

### D-003: ClerkLoaded at root, no isLoaded checks in screens
**Decision:** Root layout wraps entire app in `<ClerkLoaded>`. Individual screens do not check `isLoaded`.

**Rationale:** `ClerkLoaded` guarantees Clerk is initialized before any child renders, eliminating flash-of-wrong-state and scattered `if (!isLoaded) return null` guards.

---

### D-004: tokenCache from @clerk/clerk-expo/token-cache
**Decision:** Using the built-in `tokenCache` export from `@clerk/clerk-expo/token-cache` (v2.x pattern).

**Rationale:** `@clerk/clerk-expo` v2+ ships a built-in token cache backed by expo-secure-store. The older manual adapter pattern is deprecated.

---

### D-005: Child PIN stored in expo-secure-store, not AsyncStorage
**Decision:** The child PIN is stored via `expo-secure-store` (encrypted), not AsyncStorage.

**Rationale:** The PIN is a secret credential. AsyncStorage is unencrypted. expo-secure-store uses the device keychain/keystore.
