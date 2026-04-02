# Eczcalibur — Build Changelog

## Phase 1 — Clerk Auth + Routing (2026-04-02)

**Files created/modified:**
- `app/_layout.tsx` — ClerkProvider + ClerkLoaded root wrapper
- `app/index.tsx` — role-based redirect (signed-in → parent dashboard, else → sign-in)
- `app/(auth)/_layout.tsx` — auth group layout
- `app/(auth)/sign-in.tsx` — email/password sign-in with error handling
- `app/(parent)/_layout.tsx` — Clerk auth guard
- `app/(parent)/dashboard.tsx` — stub with "Switch to Child View" button
- `app/(child)/_layout.tsx` — Clerk auth guard + PIN gate
- `app/(child)/home.tsx` — stub child home screen
- `lib/auth/PinGate.tsx` — 4-digit PIN overlay (set + verify, expo-secure-store)
- `DECISIONS.md` — created (D-001 through D-005)

**Dependencies installed:**
- `@clerk/clerk-expo` v2.19.31
- `@anthropic-ai/sdk`
- `@react-native-async-storage/async-storage`
- `zustand`
- `expo-image-picker`
- `expo-file-system`
- `expo-sharing`
- `expo-secure-store`

**Deleted:**
- `app/(tabs)/` (boilerplate)
- `app/modal.tsx` (boilerplate)

**Status:** TypeScript check passes (0 errors). Auth flow complete.

---
