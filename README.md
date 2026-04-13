# O.T.I.S. — Object, Tracking & Inventory System

A browser-based narrative game set aboard a junk-processing moon salvage station. You run the operation entirely from a single terminal console — no walking, no inventory screens. The console is the world.

**OTIS** — Object, Tracking & Inventory System — is your AI co-star, powered by the Claude Haiku API. His slow drift from cold bank machine toward something George built is the story.

**Live demo:** https://deadsignal-seven.vercel.app

---

## Phase 0.4 Feature Set

- Pure terminal aesthetic — phosphor green on near-black, CRT scanline overlay, flicker animation
- OTIS ASCII arm sidebar with status glow states (nominal / warning / alert)
- 4-module button grid with warning lights → full-screen modals
- OTIS AI terminal powered by Claude Haiku via Anthropic API
- Rolling conversation context (last 12 exchanges + seed history)
- Item economy: 21-item manifest pool, 4 rarity tiers, condition multipliers
- Declaration flow: EXAMINE / ASSESS VALUE / GEORGE ARCHIVE / SKIP → OTIS PRICE / RESERVE / NO RESERVE / KEEP / SCRAP
- Reserve sale system with 70% success rate and rarity multipliers
- Debt system: 25,000 cr loan, 28-day payment cycles, arrears with 5% daily compound
- May Finster scrap dispatch channel
- Naming tier progression (Mr. Serling → Vernon → Vern → Buddy → ...)
- Toast fires once per game day — George’s toaster, 6 credits, dedicated modal
- State persistence via `localStorage` (key: `otis_state_v1`)
- Debug panel: FORCE DROP, +DAY, +WEEK, +500cr, FORCE PAY, FAST MODE (10×)
- Mobile-first: 4-button grid, auto-opens belt modal on item arrival, arm hidden on mobile

---

## Console Modules

| Module | Contains | Light Logic |
|--------|----------|-------------|
| **BELT / ITEMS** | Drop status, bot dots, belt bar, item queue, manifest pool | Amber = item waiting; Green = drop active |
| **COMMS** | Bank/debt/payment, Sven controls, May/scrap dispatch | Red = arrears or payment ≤3 days; Amber = ≤7 days or scrap ≥75% |
| **STOREROOM** | Scrap channel, keep log, sell-back | Red = scrap ≥90%; Amber = ≥75% or keep ≥10 items |
| **SYSTEMS / BOTS** | Full system status, bot dots, diagnose | Red = missed payments or arrears >2000 cr |

---

## Project Structure

```
otis/
├── api/
│   └── otis.js       # Vercel serverless function — Anthropic API proxy
├── index.html        # Complete game shell — all CSS, GameState, and logic inline
├── otis.js           # OTIS system prompt, seed history, askOTIS() function
├── tts.js            # TTS toggle (browser speech synthesis)
├── audio.js          # AudioManager — optional CRT audio effects
├── vercel.json       # Vercel rewrite config
├── .env.example      # Environment variable template
└── README.md
```

> **Note:** `game.js`, `state.js`, and `style.css` from the prototype have been superseded. All logic is now inline in `index.html`.

---

## Local Development

1. **Clone the repo**
   ```bash
   git clone https://github.com/questforgelitrpg/otis.git
   cd otis
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env and add your Anthropic API key
   ```

3. **Install Vercel CLI** (if not already installed)
   ```bash
   npm i -g vercel
   ```

4. **Run locally**
   ```bash
   vercel dev
   ```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key — set in Vercel dashboard, never committed |

---

## Timing Constants

| Constant | Value | Controls |
|----------|-------|----------|
| `MS_PER_INGAME_DAY` | 240,000ms (4 min) | Day clock, payment pressure, toast |
| `BELT_DELIVERY_MS` | 12,000ms (12s) | Item arrival rate during drop |
| `DAYS_BETWEEN_DROPS` | 7 days | ~28 real minutes between drops |
| `PAYMENT_CYCLE_DAYS` | 28 days | ~112 real minutes per cycle |
| `RESERVE_RESOLVE_MIN` | 120,000ms (2 min) | Min wait for reserve resolution |
| `RESERVE_RESOLVE_MAX` | 480,000ms (8 min) | Max wait for reserve resolution |
| `DEBUG_SPEED_MULTIPLIER` | 10× | Fast mode divides all _MS values |

---

## Roadmap

### Phase 0 Remaining
- [ ] Sven interference events — pause belt, require dismissal
- [ ] Maintenance events — bot offline, credit cost to restore
- [ ] Breakage — condition degrades one tier based on bot status

### Phase 1
- [ ] OTIS arm CSS animation (raise/lower/point toward active module)
- [ ] Manifest pool expansion — more items, more categories
- [ ] Seasonal barge events — elevated rare/anomalous rates
- [ ] George’s archive — static lore data, declaration bonus
