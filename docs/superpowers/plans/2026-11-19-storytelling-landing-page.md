# Storytelling Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a beautiful, cinematic storytelling scroll landing page for Problematic illustrating its mission, mental/tech/physical problem sharing, and active moderation/verification architecture.

**Architecture:** A modular React landing page component (`StoryLandingPage.jsx`) structured in 5 narrative scroll acts with an interactive IntersectionObserver animation trigger system, standalone bespoke CSS (`LandingPage.css`), and seamless routing integration in `App.jsx` allowing users to tour the story and launch the live app.

**Tech Stack:** React 18, Vite, Lucide Icons, CSS3 animations / custom transitions.

**Spec:** [2026-11-19-storytelling-landing-page-design.md](file:///c:/Users/Unified/.gemini/antigravity/scratch/problematic/docs/superpowers/specs/2026-11-19-storytelling-landing-page-design.md)

## Global Constraints

- Respect `prefers-reduced-motion` for accessibility.
- Zero extra heavy dependencies; use pure CSS + React + native `IntersectionObserver`.
- Fully responsive across desktop (1440px+), tablet (768px - 1024px), and mobile (375px - 430px).
- Must connect smoothly to the existing app state without disrupting existing feed/auth features.

## Review Focus

1. Rapid or continuous scrolling without animation hitching or stuck trigger states.
2. Viewport resize behavior (ensuring no horizontal overflow or clipped story cards at mobile/tablet).
3. Switching between the landing page and the live app without losing user state or session.
4. Interactive category tabs in Act II updating live preview cards accurately.
5. Verification & moderation pipeline visualization rendering clearly on small touch devices.

---

### Task 1: Narrative Data & Category Content Model

**Files:**
- Create: `src/components/landing/landingData.js`
- Test: `verify_data.mjs`

**Interfaces:**
- Produces: `HERO_WHISPERS`, `PROBLEM_CATEGORIES`, `MODERATION_STEPS`, `COMMUNITY_STORIES`, `STATS_HIGHLIGHTS`

- [ ] **Step 1: Write verification script for landing data structure**
Verify exported arrays and objects have required fields (category id, title, subtitle, icon, example questions, moderation badge).
- [ ] **Step 2: Implement `src/components/landing/landingData.js`**
Define real, empathetic sample problems across Mental Health, Technology, Physical Health, and Life, along with moderation workflow details.
- [ ] **Step 3: Run node verification script**
Run: `node verify_data.mjs`
Expected: PASS
- [ ] **Step 4: Commit**
`git add src/components/landing/landingData.js verify_data.mjs`
`git commit -m "feat(landing): add storytelling and problem categories data"`

---

### Task 2: Narrative Sub-Components & Story Framework

**Files:**
- Create: `src/components/landing/ActHero.jsx`
- Create: `src/components/landing/ActPillars.jsx`
- Create: `src/components/landing/ActModeration.jsx`
- Create: `src/components/landing/ActResonance.jsx`
- Create: `src/components/landing/ActFooterCta.jsx`
- Create: `src/components/landing/StoryLandingPage.jsx`

**Interfaces:**
- Consumes: `landingData.js`
- Produces: `StoryLandingPage({ onEnterApp, onOpenLogin })`

- [ ] **Step 1: Implement `ActHero.jsx`**
Cinematic hero with floating whispers, pulsing heartbeat ambient aura, and headline introducing the silence of unspoken problems.
- [ ] **Step 2: Implement `ActPillars.jsx`**
Interactive 3-pillar category switcher (Mental Health, Technology, Physical Health) with live problem cards, tag badges, and empathy counts.
- [ ] **Step 3: Implement `ActModeration.jsx`**
Step-by-step interactive moderation & verification pipeline visual: from Raw Post -> Automated Safety -> Human Moderator Review -> Domain Verification Badge.
- [ ] **Step 4: Implement `ActResonance.jsx`**
Showcases verified resolutions and real peer support dialogues.
- [ ] **Step 5: Implement `ActFooterCta.jsx`**
Closing chapter with primary calls to action ("Launch App", "Browse Problems", "Community Values").
- [ ] **Step 6: Combine in `StoryLandingPage.jsx`**
Assemble acts with scroll tracking, header navigation bar (with "Back to App" / "Launch App" button), and ambient progress indicator.
- [ ] **Step 7: Commit**
`git add src/components/landing/`
`git commit -m "feat(landing): create storytelling scroll component acts"`

---

### Task 3: Cinematic Styling & Animation System

**Files:**
- Create: `src/components/landing/LandingPage.css`

**Interfaces:**
- Consumes: Scoped CSS class names (`.story-landing`, `.story-act`, `.story-card`, etc.)
- Produces: Responsive styling, glassmorphism, glowing accents, scroll transitions, and keyframe animations.

- [ ] **Step 1: Write core typography, color variables, and container layout**
Set up dark aesthetic with emerald, violet, and cyan accent tones representing the three pillars.
- [ ] **Step 2: Add scroll animations & observer reveal classes**
Implement `.in-view` fade-in, float-up, and scale-in keyframes with `prefers-reduced-motion` fallbacks.
- [ ] **Step 3: Add responsive styles for 1440px desktop, tablet, and mobile**
Ensure full-width elegance on desktop and compact card flows on mobile screens.
- [ ] **Step 4: Commit**
`git add src/components/landing/LandingPage.css`
`git commit -m "feat(landing): add cinematic scroll animations and responsive styles"`

---

### Task 4: App Integration & Navigation

**Files:**
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `StoryLandingPage`
- Produces: State `viewMode` ('app' | 'story'), persistent or toggleable header entry point to revisit the story.

- [ ] **Step 1: Update `App.jsx` to support landing page view**
Add `showLanding` state (defaulting to landing page for first-time visitors / public preview, with toggle to enter app).
- [ ] **Step 2: Add "Explore Story / About" button in App navigation**
Allow users inside the app feed or profile to open the Story Landing Page at any time.
- [ ] **Step 3: Wire "Launch App" and "Login" buttons from landing page into App state**
- [ ] **Step 4: Commit**
`git add src/App.jsx`
`git commit -m "feat(app): integrate story landing page with seamless app launch"`

---

### Task 5: Build Verification & Visual Validation

**Files:**
- Create: `capture_landing.mjs`
- Test: `npm run build`

- [ ] **Step 1: Run Vite production build**
Run: `npm run build`
Expected: SUCCESS with zero syntax/bundling errors.
- [ ] **Step 2: Create headless browser screenshot verification script**
Write `capture_landing.mjs` to capture hero, pillars, moderation pipeline, and mobile viewport views.
- [ ] **Step 3: Run screenshot capture**
Run: `node capture_landing.mjs`
Expected: Screenshots saved and visually verified.
- [ ] **Step 4: Final commit**
`git add capture_landing.mjs`
`git commit -m "chore(landing): add verification and screenshot script"`
