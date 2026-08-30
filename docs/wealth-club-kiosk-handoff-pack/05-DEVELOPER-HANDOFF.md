# 05 — DEVELOPER HANDOFF & IMPLEMENTATION CHECKLIST
## Wealth Club Touchscreen — Build Guide

---

# 1. Build Goal

این پروژه یک وب‌سایت معمولی نیست.

Build target:

```text
Interactive Kiosk App
```

Main priority:

```text
Speed + Touch UX + Reliability + Lead Conversion
```

---

# 2. Recommended Stack

Preferred:

```text
Next.js
TypeScript
Tailwind
PWA
Local Storage / IndexedDB
Analytics
QR generation library
```

Backend optional for MVP if lead capture can post to existing endpoint.

---

# 3. Suggested Folder Structure

```text
src/
  app/
    attract/
    home/
    audience/
    financial-test/
    courses/
    collaboration/
    festival-offer/
    lead/
    qr/
    success/

  components/
    kiosk/
    quiz/
    products/
    lead/
    ui/

  content/
    courses.json
    workshops.json
    quiz.json
    results.json
    offers.json

  lib/
    scoring.ts
    recommendation.ts
    analytics.ts
    idle.ts
    qr.ts
    offline.ts

  store/
    session.ts
```

---

# 4. Config-first Architecture

Hard-code نکنید:

```ts
export const kioskConfig = {
  idleTimeoutMs: 75000,
  successResetMs: 9000,
  qrResetMs: 25000,
  festivalOfferEnabled: true,
  leadCaptureMode: "qr-first"
}
```

---

# 5. Content Type Definitions

```ts
type Course = {
  id: string
  title: string
  heroTitle: string
  heroSubtitle?: string
  targetAge?: string
  duration?: string
  priceRegular?: number
  priceFestival?: number
  registrationUrl?: string
  active: boolean
}
```

```ts
type Workshop = {
  id: string
  title: string
  shortDescription?: string
  date?: string
  startTime?: string
  duration?: string
  teacher?: string
  targetAge?: string
  priceRegular?: number
  priceFestival?: number
  capacity?: number
  registrationUrl?: string
  active: boolean
}
```

---

# 6. Session Store

Suggested:

```ts
type KioskSession = {
  id: string
  startedAt: number
  audience?: string
  ageGroup?: string
  answers: Record<string, string>
  rawScore?: number
  score?: number
  resultType?: string
  recommendedProducts: string[]
  leadSubmitted: boolean
}
```

---

# 7. Idle Reset Logic

Trigger reset when:

- no pointer/touch/keyboard interaction
- timeout 60–90 sec
- success screen timeout
- explicit reset button

Reset should:
- clear session
- clear form fields
- clear quiz answers
- route to `/attract`

---

# 8. Lead Submission

Preferred flow:

```text
TV → QR → Mobile Landing Page → Form → CRM
```

Fallback:
TV form.

If TV form:
- only name + mobile
- sanitize inputs
- local queue if offline
- retry sync later

---

# 9. Offline

Cache:
- app shell
- fonts
- logos
- quiz
- product content
- essential images

Offline lead queue:
IndexedDB

On reconnect:
sync unsent leads

---

# 10. QR

QR should include UTM.

Example:

```text
?utm_source=bagheketab
&utm_medium=kiosk
&utm_campaign=science_festival
&utm_content=plus18
```

Dynamic QR recommended.

---

# 11. Analytics

At minimum:

- session_start
- attract_touch
- audience_selected
- quiz_started
- quiz_completed
- result_viewed
- product_viewed
- qr_viewed
- lead_submitted
- registration_click
- session_reset

Each with:
- timestamp
- sessionId
- audience
- screen
- source

---

# 12. Event Day Dashboard — Optional

Even a simple local counter can help:

```text
Sessions: 184
Quiz completed: 96
QR shown: 73
Leads: 41
School interest: 7
Organization interest: 4
```

---

# 13. Kiosk Hardening

- disable context menu
- prevent accidental text selection
- prevent pinch zoom if problematic
- full screen
- no browser chrome
- no external navigation
- recover after refresh
- auto route to attract
- graceful network failure
- watchdog optional

---

# 14. QA Checklist

## Device
- [ ] Touch works accurately
- [ ] Portrait tested
- [ ] Landscape tested
- [ ] Chrome fullscreen tested
- [ ] Windows scaling tested
- [ ] Persian font renders correctly

## UX
- [ ] No tiny buttons
- [ ] No hidden CTA
- [ ] No excessive scroll
- [ ] Back works
- [ ] Reset works

## Quiz
- [ ] Score correct
- [ ] Result correct
- [ ] Recommendation correct
- [ ] Double taps don't skip questions

## Offline
- [ ] UI works with Wi-Fi disabled
- [ ] lead queue stores locally
- [ ] data syncs after reconnect

## QR
- [ ] Android scans
- [ ] iPhone scans
- [ ] each QR destination correct
- [ ] UTM correct

---

# 15. Suggested Implementation Order

## Day / Sprint 1
- shell
- RTL
- routing
- attract
- home
- idle reset

## Day / Sprint 2
- quiz engine
- scoring
- result
- recommendation

## Day / Sprint 3
- +18
- Business School
- workshops
- school
- organization

## Day / Sprint 4
- QR
- lead
- analytics
- offline
- polish

---

# 16. Acceptance Criteria

MVP is ready when:

- user can start from attract
- identify audience
- complete quiz
- receive result
- see relevant product
- scan QR
- leave lead
- app resets automatically
- no previous user data remains
- basic experience survives internet loss

---

# 17. Inputs Developer Should Request From Wealth Club

Use this exact list:

```text
1. Logo files
2. Brand colors
3. Font
4. +18 course info
5. Business School info
6. Workshop list
7. Festival offer
8. Registration links
9. QR links
10. School collaboration text
11. Organization collaboration text
12. Contact info
13. Photos/videos
14. Lead destination/API
15. Analytics preference
```

---

# 18. What Developer Should NOT Wait For

Do not block on:
- final photos
- final price
- final workshop list
- final wording

Use JSON placeholders and swap later.

---

# 19. Emergency Fallback

If backend, internet, CRM, or payment fail at event:

App must still be able to:
- run quiz
- show courses
- show contact QR
- collect local lead
- reset session

This is non-negotiable.

# END
