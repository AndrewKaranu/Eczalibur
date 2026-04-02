# ECZCALIBUR — Fighting Eczema
## Software Requirements Document
**Version 1.1** | CBC McGill Hackathon 2026 | April 4, 2026  
**Team:** 2 members | **Stack:** Expo React Native, Clerk, Claude API, Open-Meteo

> **v1.1 change note:** Platform changed from Next.js web app to Expo React Native mobile app. All web-specific references (localStorage, Tailwind, Next.js API routes, browser APIs) have been updated to their React Native equivalents.

---

## 1. Overview

Eczcalibur is a two-interface **React Native mobile application** (iOS, Android, and web via Expo) that turns eczema self-management into an engaging quest for children aged 7–14. Inspired by the legend of Excalibur, the child "pulls the sword" and claims agency over their condition, becoming the fighter. The parent maintains an administrative dashboard that generates clinical summaries for dermatologist appointments.

The app is grounded in the National Eczema Association's evidence-based Written Action Plan (WAP) framework and targets a documented gap: 80% of families with a child with eczema have never received a personalized action plan (Children's Hospital Boston, PMC3328408).

---

## 2. Team & Technology Stack

### 2.1 Team
- 2 team members — full stack development via Claude Code
- Pre-build period: April 1–3, 2026
- Hackathon day: April 4, 2026 (10:00 AM – 4:00 PM submission deadline)

### 2.2 Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| Framework | **Expo SDK 54** + Expo Router v6 | File-based routing, iOS/Android/Web from one codebase |
| Language | TypeScript | Type safety across the whole app |
| Auth | **`@clerk/clerk-expo`** | Multi-role (parent/child) out of the box, native OAuth flows |
| AI | **Claude API** (`claude-sonnet-4-6`) | Action plan generation, chat, summaries |
| Weather | Open-Meteo API | Free, no API key, location-based eczema triggers |
| Storage | **AsyncStorage** (`@react-native-async-storage/async-storage`) | Privacy-first; all data stays on device |
| State | **Zustand** | In-memory cache hydrated from AsyncStorage on launch |
| Styling | React Native StyleSheet | Native styling; NativeWind available if needed |
| Photos | **`expo-image-picker`** + expo-file-system | Native camera access + local file storage |
| Server logic | **Expo API Routes** (`app/api/+server.ts`) | Server-side Claude calls; API key never in client bundle |

---

## 3. User Roles

### 3.1 Parent (Admin Role)
- Creates the Clerk account and sets up the child's profile
- Completes onboarding to generate the child's action plan
- Receives flare alerts and reviews the child's log data
- Sets prizes and manages the points redemption bank
- Uses the Claude chat interface to explore patterns in logged data
- Reviews pre-appointment summaries before dermatologist visits

### 3.2 Child (Player Role, ages 7–14)
- Accesses the child view via PIN (simplified, gamified interface)
- Views their personalized Green/Yellow/Red action plan
- Taps the emergency flare button during a flare episode
- Completes post-flare check-ins to earn points
- Takes photos of monitored skin areas using the device camera
- Views their points balance and redeemable prizes in the Store

---

## 4. Authentication (Clerk)

- Single Clerk account per family using **`@clerk/clerk-expo`**
- Parent creates account → role: `'parent'`
- Parent adds child profile → role: `'child'` with `parent_id` reference
- **Expo Router layouts** enforce role-based routing: `(parent)/` and `(child)/` route groups
- Child login is PIN-based (4-digit, set by parent during onboarding) — no email required
- Session persistence: parent stays logged in on their device; child view accessible via PIN within the same app session

---

## 5. Parent Onboarding Flow

Onboarding is a multi-step wizard completed once by the parent before the child can use the app. All data is stored locally on the device via AsyncStorage.

### 5.1 Onboarding Steps

| Step | Screen Title | Fields / Notes |
|---|---|---|
| 1 | Welcome & Consent | Checkbox: "I confirm I have parental authority to collect and store information and images for this child." Required to proceed. |
| 2 | Child Profile | Child's first name, age, biological sex (affects eczema presentation), child's PIN (4-digit) |
| 3 | Location | City/country (used for weather context only). Fetches current season + humidity via Open-Meteo. NOT stored remotely. |
| 4 | Diagnosis | Free text: "Diagnosis as given by your doctor (e.g. mild atopic dermatitis)." Helper text: This app does not provide medical diagnoses. |
| 5 | Current Medications | Medication name, type (topical/oral/biologic), dosage, frequency. Add multiple rows. |
| 6 | Current Treatment Plan | Free text: "Describe your doctor's current treatment plan." |
| 7 | Known Triggers | Multi-select + free text: dust mites, pet dander, certain soaps, food, stress, heat, sweat, synthetic fabrics, pollen, cold air, other. |
| 8 | Problem Areas to Monitor | Tap illustrated body map (front/back) to select areas to photograph regularly. |
| 9 | Plan Review | Claude generates the action plan (see Section 6). Parent reviews, edits free-text sections, approves. |
| 10 | Prize Setup | Parent creates 1–3 initial prizes with point costs. Can be edited later. |

---

## 6. Action Plan Generation (Claude API)

After onboarding Step 8, the app sends a structured prompt to Claude API (`claude-sonnet-4-6`) via an Expo API Route. Claude generates a personalized three-zone action plan using the NEA Written Action Plan framework.

### 6.1 Three Zones

- **GREEN ZONE (Baseline):** Skin is calm. Daily maintenance routine — moisturizer schedule, bath instructions, medications as prescribed.
- **YELLOW ZONE (Early Flare):** Increased redness, itchiness beginning. Step-up actions — add prescribed topical, reduce known triggers, monitor. When to step up to Red.
- **RED ZONE (Severe Flare):** Significant flare, possible infection signs. Escalation steps — apply prescribed treatment, wet wrap if indicated, contact doctor if [specific thresholds]. Emergency steps display immediately when flare button is pressed.

### 6.2 Claude Prompt Constraints

- Structural output must follow the NEA WAP framework (Green/Yellow/Red zones)
- Medications and dosages are filled from parent-entered data only — Claude never invents medication instructions
- Weather/seasonal context from Open-Meteo is injected as additional context
- Output must be in two versions: parent-language (clinical) and child-language (plain, age-appropriate)
- Claude must include `[DOCTOR TO CONFIRM]` placeholder next to any escalation threshold it cannot determine from input
- System prompt enforces: Claude does not diagnose, does not change medication dosages, does not replace the treating physician

### 6.3 Parent Review & Approval

- Generated plan is displayed in an editable form — parent can modify any section
- Plan is not activated until parent taps "Approve Plan"
- Approved plan is stored in **AsyncStorage** under the child's profile
- Parent can regenerate or edit the plan at any time from the dashboard

---

## 7. Child Interface

The child interface uses a gamified visual language with large touch targets, illustrated body maps, and emoji/icon-based inputs. No clinical language in the child view.

### 7.1 Home Screen
- Sword icon with current zone color (green/yellow/red glow)
- "How's your skin today?" zone indicator — child taps their current zone
- Points balance displayed as coin count
- Navigation: My Plan | Log | Store | Emergency

### 7.2 My Plan Screen
- Displays current zone's action steps in plain language
- Steps are illustrated with icons
- Child can tap any step to mark it done (+5 points per step)
- "What do I do right now?" shortcut — surfaces current zone steps immediately

### 7.3 Log Screen (Post-Flare or Daily)
- Triggered by child or by post-flare reminder (next session after emergency button)
- Question 1: "How does your skin feel?" — 5 illustrated face options (great/okay/itchy/very itchy/painful)
- Question 2: "Where is it bothering you?" — tap body map (pre-highlighted with parent's monitored areas)
- Question 3: Take a photo using the device camera via **`expo-image-picker`** (optional but encouraged) — guide overlay shows parent's monitored areas
- Submit → points awarded (10 pts for completing log, +5 pts if photo included)
- Photos stored as file URIs via **expo-file-system** (base64 fallback for smaller images)

### 7.4 Emergency Flare Button
- Large, prominent button on home screen
- Single tap — no questions asked
- Immediate actions: (1) Display Red Zone action steps full screen, (2) Award 15 points, (3) Timestamp event in AsyncStorage log, (4) Show in-app alert for parent view
- Red Zone steps pulled from the approved action plan
- Post-flare log reminder shown at next app session

### 7.5 Store Screen
- Grid of prizes created by parent
- Each prize shows point cost and whether unlocked
- Child taps "Redeem" → sends redemption request to parent view
- Parent confirms redemption → real-world reward given
- Redeemed prizes shown as "claimed" with date

---

## 8. Parent Dashboard

The parent dashboard uses the same gamified visual theme with richer data density. Clinical data is presented in a format the parent can share with a dermatologist.

### 8.1 Dashboard Overview
- Child's current zone status (updated when child logs)
- Last log date and streak counter
- Flare alert badge — number of emergency events since last dismissed
- Upcoming appointment countdown (if date entered)

### 8.2 Flare Log & History
- Timeline view: each log entry shows date, zone, child's skin feeling, body area, photo thumbnail
- Filterable by date range, zone, and body area
- Photo timeline: strip of dated photos for each monitored body area — visual treatment response over time
- Shareable via **`expo-sharing`** (share sheet → AirDrop, Messages, email, etc.) using the pre-appointment summary

### 8.3 Points Bank & Prize Management
- Current points balance, total earned, total redeemed
- Add/edit/remove prizes — name, description, point cost
- Redemption requests queue — approve or decline
- Manual points adjustment — parent can award bonus points

### 8.4 Claude Chat Interface
- Conversational interface grounded in the child's local log data
- On chat open, app injects last 30 days of log entries as context into a server-side Claude API call via Expo API Route
- Photos are NOT automatically sent — parent must explicitly toggle "Include recent photos" before sending
- System prompt: Claude observes patterns and suggests questions for the doctor. Does not diagnose, does not recommend medication changes, does not provide clinical verdicts.
- Example queries: "Why does she flare more on weekends?" / "Is the new cream making a difference?" / "What should I bring up at the next appointment?"
- Clear disclosure shown in UI: "Your data is shared with Claude only for this conversation. It is not stored on any server."

### 8.5 Pre-Appointment Summary
- Parent enters upcoming appointment date
- Button: "Generate Appointment Summary"
- Claude receives: all logs since last appointment, current action plan, medications, flare pattern data, parent observations
- Output: structured clinical summary in dermatologist-focused language — flare frequency, severity trend, suspected trigger correlations, treatment adherence, visual progress notes, recommended discussion points
- Summary displayed in app — shareable via the native share sheet using **`expo-sharing`**

---

## 9. Data Architecture & Privacy

### 9.1 Storage Model
- All data stored on-device via **`@react-native-async-storage/async-storage`** under the parent's Clerk user ID as a namespace key
- Structure: `{ userId: { children: [...], logs: [...], photos: [...], actionPlan: {...}, prizes: [...] } }`
- Photos stored as file URIs via **expo-file-system**; base64 used only for smaller images or API submission
- **No backend database** — no server ever receives or stores the child's health data

### 9.2 Claude API Data Flow
- Data is sent to Anthropic API ONLY when the parent explicitly triggers: (a) Claude chat, (b) pre-appointment summary generation, (c) action plan generation/regeneration
- All Claude calls go through **Expo API Routes** (`app/api/+server.ts`) — `ANTHROPIC_API_KEY` is a server-side environment variable, never in the client bundle
- Each API call is stateless — Anthropic does not retain conversation history
- Photos are included in API calls only when parent explicitly enables "Include photos" toggle
- Disclosure shown every time data is sent: "This information is being shared with Claude to generate your response. Anthropic's privacy policy applies."

### 9.3 Consent
- Parental consent checkbox required at onboarding Step 1 — cannot be skipped
- Consent stored with timestamp in AsyncStorage
- Parents can delete all stored data from Settings at any time

---

## 10. Feature Priority & Build Order

Given a 2-person team with 3 pre-build days and an 8-hour hackathon day, features are prioritized strictly by demo impact and build complexity.

| Feature | Priority | Notes |
|---|---|---|
| Clerk auth (`@clerk/clerk-expo`) + role routing | MUST SHIP | Foundation for everything else |
| Parent onboarding wizard | MUST SHIP | Steps 1–8 minimum |
| Claude action plan generation | MUST SHIP | Core product value |
| Parent plan review & approval | MUST SHIP | Ethical requirement |
| Child home screen + zone view | MUST SHIP | Demo centerpiece |
| Emergency flare button + Red zone display | MUST SHIP | Most impactful child feature |
| Basic post-flare log (3 questions) | MUST SHIP | Completes the logging loop |
| Points system (award + balance) | MUST SHIP | Required for gamification story |
| Pre-appointment summary | MUST SHIP | Strongest judge moment |
| Parent flare log history view | HIGH | Shows data value |
| Store / prize redemption UI | HIGH | Gamification payoff |
| Photo capture with expo-image-picker | HIGH | Differentiator vs EczemaWise |
| Photo timeline view (parent) | HIGH | Pairs with photo capture |
| Claude chat interface (parent) | HIGH | Second-best Claude demo moment |
| Open-Meteo weather context | HIGH | Lightweight — injected into plan prompt |
| Onboarding "Meet Your Sword" moment | MEDIUM | Memorable demo beat |
| Manual points adjustment (parent) | MEDIUM | Nice to have |
| Push notifications (expo-notifications) | LOW | Simulate with in-app alerts for MVP |
| Multi-child support | FUTURE | Post-hackathon |

---

## 11. Claude Prompt Architecture

Three distinct Claude API calls, each via a dedicated Expo API Route (`app/api/+server.ts`). All calls use `claude-sonnet-4-6` with `max_tokens: 2000`.

### 11.1 Action Plan Generation
- **Triggered:** After parent completes onboarding Step 8
- **Input:** Structured JSON of all onboarding data + weather context from Open-Meteo
- **Output:** JSON with green/yellow/red zone steps in both parent-language and child-language

### 11.2 Parent Chat
- **Triggered:** Parent sends message in chat interface
- **Input:** System prompt + last 30 days of log data + optional photos + parent's message
- **Output:** Conversational response grounded in the child's specific data. Hard constraints: no diagnosis, no medication changes, always defers to treating physician.

### 11.3 Pre-Appointment Summary
- **Triggered:** Parent taps "Generate Appointment Summary"
- **Input:** All logs since last appointment + current action plan + medication list
- **Output:** Structured clinical summary. Sections: Flare Frequency & Trend, Suspected Trigger Correlations, Treatment Adherence, Visual Progress (if photos), Recommended Discussion Points.

---

## 12. UI Design Language

### Child Interface
- Gamified aesthetic — quest/adventure-themed sprites and icons
- Zone colors: Green (calm), Yellow (alert), Red (danger)
- All interactive elements: minimum 48px touch target (React Native `TouchableOpacity` / `Pressable`)
- No clinical language, no numeric scales — emoji faces, illustrated body maps, tap-to-select

### Parent Interface
- Same gamified theme with adult-appropriate data density
- Clinical data in clean card components with the game aesthetic applied lightly
- Charts: simple bar charts for flare frequency, line for severity trend
- Consistent zone color coding (green/yellow/red) throughout all data displays

---

## 13. Ethical Guardrails

Ethical alignment is 25% of the judging criteria. The following guardrails are implemented in code, not just documented.

- All Claude system prompts include explicit constraints: no diagnosis, no medication changes, defer to treating physician
- Action plan is labeled "Draft for review — confirm all medication steps with your dermatologist" until approved
- Doctor-dependent steps are marked `[DOCTOR TO CONFIRM]` in generated plan
- Points are awarded for logging and following steps — never for having more flares
- Emergency button requires no logging — removes all friction during a crisis moment
- Consent checkbox is a hard gate — app cannot be used without it
- Data disclosure shown every time any data is sent to Claude API
- "Delete all data" option available in Settings at any time
- No data is ever sent to any third party except Anthropic API on explicit parent action

---

*Eczcalibur | CBC McGill Hackathon 2026 | Biology & Health Track*
