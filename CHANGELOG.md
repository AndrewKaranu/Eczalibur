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

## Phases 2–5 — Types, Prompts, Storage, API Routes (2026-04-02)

**Files created:**
- `lib/types.ts` — all TypeScript interfaces (Zone, ActionPlan, ChildProfile, FlareLog, Prize, etc.)
- `lib/prompts.ts` — 3 Claude system prompts with ethical guardrails
- `lib/storage.ts` — AsyncStorage typed helpers + hydrateAll()
- `lib/weather.ts` — Open-Meteo geocoding + weather fetch
- `store/useAppStore.ts` — Zustand store with hydration bootstrap
- `app/api/generate-plan+server.ts` — Claude Opus 4.6 action plan generation
- `app/api/chat+server.ts` — Claude streaming parent chat
- `app/api/appointment-summary+server.ts` — Claude pre-appointment summary

**Status:** TypeScript clean. API routes server-side only (Anthropic client inside handlers).

---

## Phase 6 — Parent Onboarding Wizard (2026-04-02)

**Files created/modified:**
- `app/(parent)/onboarding.tsx` — 8-step wizard (consent, child details, body areas, medications, triggers, generate plan, plan review, prizes)
- `components/parent/OnboardingStep.tsx` — progress dots + step header component
- `components/parent/BodyMap.tsx` — interactive SVG front/back body silhouette (react-native-svg)
- `app/(auth)/sign-in.tsx` — fixed: needs_first_factor + needs_second_factor handling; otp/otp2 stages
- `app/(parent)/dashboard.tsx` — hydration guard + onboarding redirect

**Dependencies installed:** `react-native-svg`

**Fixes applied:**
- Anthropic client moved inside POST handlers (browser bundling error)
- SVG body map: onPress on shape elements directly (Pressable can't be child of Svg)
- Clerk sign-in: username is the correct identifier (not email)
- Clerk 2FA: dynamic strategy detection from supportedSecondFactors

**Visual verification:** Onboarding steps 1–8 confirmed working in browser. Body map renders with red highlight on tap.

---

## Phase 7 — Child Home + Emergency + Red Zone (2026-04-02)

*(in progress)*

---
