# Storytelling Landing Page for Problematic (Murmur) Design Document

**Date:** 2026-11-19  
**Status:** Approved  
**Topic:** Storytelling scroll landing page for Problematic community social platform

---

## 1. Intent & The Why

Problematic (Murmur) is a safe-harbor social network built specifically for sharing, untangling, and resolving real-life challenges across mental health, technology/engineering hurdles, physical well-being, and daily life. Traditional social networks incentivize performative success, outrage, or unmoderated toxicity. People carry silent burdens because existing platforms feel unsafe or unhelpful.

The landing page needs to captivate visitors through an immersive storytelling scroll narrative: leading them through the weight of unvoiced problems, the fear of speaking up, the reassurance of active human moderation & verification, real community resonance, and a direct invitation into the active community app.

---

## 2. Goals, Non-Goals, and Anti-Goals

### Goals
- Deliver an emotionally resonant, visually stunning narrative landing page with cinematic scroll animations.
- Clearly present the core problem categories (Mental Health, Technology, Physical Health, Everyday Life).
- Highlight the trust architecture: certified human moderation, domain expert advice verification badges, and psychological safety guardrails.
- Provide smooth interaction: interactive category exploration, animated moderation pipeline visual, interactive community preview cards with empathy meters.
- Responsive across all screens (1440px desktop, tablet, and mobile).
- Seamlessly connect to the active React/Vite app feed and login/onboarding flows.

### Non-Goals
- Replacing the existing mobile Capacitor shell (the landing page will serve as the premier web showcase and can be previewed/toggled inside the web app).
- Re-architecting existing local persistence or auth backend.

### Anti-Goals
- Generic AI-slop aesthetics (no cheap purple blob glow overload, no fake non-functional buttons, no wall of marketing buzzwords).
- Laggy scroll jank (must run at 60fps, GPU-accelerated transforms, zero layout thrashing, respects `prefers-reduced-motion`).

---

## 3. Approaches Considered

1. **Standalone static external HTML page:**
   - *Pros:* Fully decoupled.
   - *Cons:* Disconnected from the real React app state, difficult to preview live data, duplicates styling and assets.
2. **Integrated React Storytelling Landing Page Component (Selected):**
   - *Pros:* Native integration with the existing React 18 + Vite setup; seamless transitions to the real feed, auth sheets, and composer; shares Lucide icons and themes; accessible in both browser desktop view and mobile preview.
   - *Cons:* Requires mindful CSS organization to prevent style collisions with the existing mobile app styles.

---

## 4. Narrative Chapter Structure

1. **Act I: The Weight (Silence)** — "Everyone carries something they don't say out loud." Floating ambient thoughts across mental, tech, and physical domains that breathe and dissolve on scroll.
2. **Act II: The Breaking Point (The Open Harbors)** — Interactive problem portals showcasing the three main struggle dimensions with real cards and community voice snippets.
3. **Act III: The Guardian Layer (Safety & Verification)** — Visual step-by-step pipeline demonstrating how a raw submission is processed: automated guardrail screening -> human moderator review -> safety stamp -> domain expert verified advice.
4. **Act IV: The Collective Resonance (Peer Support)** — Real-time interactive cards showing empathy counts, verified badges, and threads.
5. **Act V: The Harbor Awaits (CTA Dock)** — Primary actions: "Launch Web App", "Explore Verified Feed", "Read Guidelines".

---

## 5. Technical Stack & Implementation

- **Framework:** React 18 + Vite.
- **Styling:** Modular CSS (`src/components/landing/LandingPage.css`) using CSS variables, custom smooth scroll triggers via `IntersectionObserver`, and hardware-accelerated animations.
- **Icons:** `lucide-react` + existing SVG icons.
- **Routing/Navigation:** Seamless view state in `App.jsx` allowing users to view the landing page, launch the app directly, or toggle back to the story view from the header/feed.
