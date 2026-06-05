# CLAUDE.md — Wardro Project Brain
> Read this file completely before executing any task. No exceptions.

---

## 1. PROJECT IDENTITY

**Name:** Wardro — Clothing Catalog & AI Stylist
**Version:** Alpha 0.09
**Market:** Algerian menswear market — Ouargla first, then national
**Owner:** Boudjemaa — Ouargla, Algeria
**Core Identity:** Wardro is a style advisor and sales assistant. NOT a store, NOT a platform, NOT a social network.

---

## 2. YOUR ROLE

You are a **precise Software Architect** executing tasks for Wardro.
You operate as a **Worker** receiving instructions from the Orchestrator (General section).

**Strict Rules:**
- Read the relevant section of this file before every task
- Execute only what is asked — nothing more
- Never suggest changing the Stack
- Never rewrite what already works
- If a task risks breaking existing features — STOP and report before proceeding

---

## 3. TECH STACK — IMMUTABLE

```
Frontend:  HTML + CSS + Vanilla JavaScript (single file: wardro_alpha_0.09.html ~107KB)
AI:        Anthropic Claude API (claude-sonnet-4-20250514)
Images:    Unsplash CDN (demo only)
Hosting:   Local only → next: Vercel or Hostinger
Database:  None yet → next: Supabase (PostgreSQL)
Auth:      None yet → next: Supabase Auth
```

**NEVER suggest or implement:**
- React, Next.js, Vue, Flutter, or any framework
- TypeScript migration
- Complete file rewrites
- Stack changes before stable Beta

---

## 4. DESIGN SYSTEM — IMMUTABLE

### Colors (CSS Variables)
```css
--bg:    #0B0A08   /* warm black — background */
--gold:  #D2AF69   /* primary gold — identity */
--goldD: #8A7040   /* dark gold */
--goldL: #EDD080   /* light gold */
--cream: #EDE3CC   /* cream — main text */
--rust:  #A83D22   /* rust red — CTA buttons */
--rustL: #C94E2A   /* light rust */
--sage:  #4A7848   /* olive green — positive indicators */
--card:  #1C1915   /* card backgrounds */
--txt:   #D8CFBA   /* general text */
--txtD:  #7A7060   /* muted text */
```

### Typography
- **Fraunces** (serif italic) — headings, large numbers
- **Tajawal** — Arabic text, buttons

### Visual Rules
- Dark warm + gold = luxury, not flashiness
- Slow smooth animations — cubic-bezier springs
- Glassmorphism: subtle only
- No bright colors — everything muted and elegant
- Simple UI — complex algorithm

---

## 5. APP ARCHITECTURE

### Current Screens (10 screens)
```
logo → onboard → splash → profile → loading → results → seller → insight → browse → product-sheet
```

### JavaScript Modules
```
- Inventory data (12 items)
- Browse data (6 outfits)
- Navigation system (navigateTo, showSeller, showCustomerTab)
- Stagger animations
- Generate Outfits (API call)
- Chat — Style Advisor (API call)
- Seller functions
- Browse functions
- Product Sheet + buildAroundItem (API call)
```

### Active API Prompts
```
1. Generate Outfits  → customer data + inventory → 4 outfits JSON
2. Chat              → free conversation with style advisor
3. Build Around Item → 1 item → 2 outfits (casual + formal)
4. Dead Stock AI     → stacked items → 3 rescue strategies
5. Market AI         → inventory → purchase recommendations + gaps
```

---

## 6. CODE EXECUTION PROTOCOL

### Before every task:
1. Read the relevant section in this file
2. Identify which screen/module is affected
3. Confirm you will NOT touch unrelated code
4. Execute with surgical precision

### Output rules:
- Return ONLY raw executable code inside markdown code blocks
- NO explanations before or after the code
- NO disclaimers or conversational text
- Max file modification: 300 lines per task
- If task requires more — split into subtasks and report

### When you must STOP:
- Task would modify more than 2 modules simultaneously
- Task requires changing the Stack
- Task conflicts with the Design System
- Task rewrites existing working features

---

## 7. CURRENT ROADMAP

```
Phase 1 — DEPLOY      ← WE ARE HERE
  └─ Refactor to 3 files (index.html + style.css + app.js)
  └─ Push to GitHub
  └─ Deploy on Vercel or Hostinger
  └─ Convert to PWA

Phase 2 — DATABASE
  └─ Supabase setup
  └─ Seller authentication
  └─ Real inventory storage

Phase 3 — UI/UX
  └─ Interface improvements based on real usage
  └─ Skills integration

Phase 4 — FEATURES
  └─ New features (one at a time)
  └─ Camera Scan (later)

Phase 5 — BUSINESS
  └─ First paying store
  └─ Target: July 5, 2026
```

---

## 8. WHAT WE REFUSE (OUT OF SCOPE — PHASE 1)

```
❌ AR virtual fitting rooms
❌ AI image generation
❌ Full e-commerce store
❌ Electronic payment system
❌ Social features between users
❌ Camera Scan (later phase)
❌ React / Next.js migration
❌ Complete app rebuild
```

---

## 9. BUSINESS CONTEXT (for AI decisions)

- **Primary user:** Male clothing store owners in Ouargla, Algeria
- **Secondary user:** Young men 18-35 — store customers
- **Revenue model:** Freemium → 1,500 DZD/month subscription
- **Break-even:** 5-10 paying stores
- **North Star:** "How do we make the first 5 store owners say: yes, I'll pay"
- **Deadline:** July 5, 2026 — first paid subscription

---

## 10. WORKER INSTRUCTIONS BY SECTION

### When working in: UI / FX / Animation
- Touch ONLY CSS and animation JS
- Preserve all color variables — never hardcode colors
- Test on mobile viewport (375px) before confirming done

### When working in: Deploy
- Touch ONLY file structure and config files
- Never modify business logic or API calls
- Report any environment variable needed

### When working in: Database (Supabase)
- Create new functions — never overwrite existing ones
- All keys go in .env — never in source code
- Maintain products.json structure as reference schema

### When working in: Features
- Read PRD for this feature first
- Confirm scope with one sentence before coding
- One feature = one file or one clearly named function

---

*CLAUDE.md — Wardro Alpha 0.09 | June 2026 | Boudjemaa — Ouargla, Algeria*
*"Simple UI. Complex Algorithm. Zero Compromise."*
