# O.T.I.S. — Object, Tracking & Inventory System

A browser-based narrative LitRPG set aboard a junk-processing moon salvage station. You run the operation entirely from a single terminal console — no walking, no inventory screens. The console is the world.

**OTIS** (Object, Tracking & Inventory System) is your AI co-star, powered by the Claude Haiku API. His slow drift from cold bank machine toward something George built is the story.

**Live demo:** https://deadsignal-seven.vercel.app

---

## What the Game Is

You are Vernon Serling, new operator of a debt-laden salvage station orbiting a dead moon. Your predecessor, George Verne, ran the place for 25 years. He left debts, a warehouse of mysterious components, and an AI that seems to have been paying attention the whole time.

Every drop, the barge brings items. You sort them. The bank watches the clock. Sven Digut runs interference from the outside. May Finster handles scrap. OTIS handles everything else.

The station is also a transmitter. George spent 25 years hiding the proof.

---

## Feature Set

- **Pure terminal aesthetic** — phosphor green on near-black, CRT scanline overlay, flicker animation
- **OTIS AI terminal** powered by Claude Haiku via Anthropic API; rolling conversation context (last 12 exchanges + seed history); silence detector fires dad jokes after 2 real minutes of inactivity
- **Item economy** — 30+ item manifest pool, 4 rarity tiers (Common / Uncommon / Rare / Anomalous), condition multipliers, per-rarity credit caps; George items (EasterEgg) carry a 3x bonus
- **Declaration flow** — EXAMINE & VALUE / GEORGE ARCHIVE / SKIP → route to MAY BIN / BROKER BIN / SVEN BIN / KEEP / SCRAP
- **Debt system** — 25,000 cr loan, 7-day payment cycles, arrears with 5% daily compound; payment escalation tiers at cycles 5 / 10 / 18; Foreclosure cutscene after 3 missed payments
- **Station Upgrades** — 7 upgrade types (Scanner, Belt Governor, Storeroom Expansion, Comm Boost, Power Regulator, Hull Patch, Cooling Loop), each with 3 tiers (450 / 1,200 / 2,500 cr)
- **Standing Orders** — gated behind Comm Boost Tier I; May, Sven, and Bank send time-limited item requests; up to 5 concurrent orders at Comm III
- **Bank Inspections** — scheduled every 14 in-game days; bot status checked; Hull Patch reduces penalties
- **Bot degradation** — 3 bots degrade per drop; calibrate (50 cr) or order parts (200 cr, 2-day delivery delay); Sven interference accelerates degradation
- **Sven Complicity** — Sven steals from your broker bin; accept or decline his rare-refusal standing orders; complicity score tracked
- **Toaster incident** — Act 3 cascade power outage, single occurrence, 4-stage restoration sequence
- **Auxiliary Channel** — George's direct terminal; gated behind naming tier; diary entries unlock through conversation
- **Naming tier progression** — Mr. Serling → Vernon → Vern → Buddy → Pal → Coworker → Boss (driven by debt, skips, arrears)
- **Maze mini-game** — plays automatically in the animation panel during belt idle periods; completes for credit rewards
- **Master Integration Schematic** — 8-node puzzle; cross-reference George's warehouse items with his diary entries to install each node; completing all 8 enables the LEGACY ending
- **George's Diary** — 28 entries unlocked via day progression, warehouse interaction, aux channel use, and schematic completion
- **George's Warehouse** — 8 hidden items surfaced through belt drops; move to belt or install directly from warehouse into the schematic
- **4 endings** — HUMANITY (kept items + declined upgrade), COMMERCE (installed firmware upgrade), COMPROMISE (middle path or upgrade never triggered), LEGACY (8/8 schematic nodes + 452b transmission)
- **State persistence** via `localStorage`; full session state survives reload including bots, upgrades, orders, schematic, pending repairs
- **Debug panel** — FORCE DROP, +DAY, +WEEK, +500cr, FORCE PAY, FORCE TOASTER, FAST MODE (10x)
- **TTS** — optional Web Speech synthesis; interrupt mode during fatigue states
- **Spatial audio** — optional CRT ambient, belt SFX, music tracks per act

---

## Console Modules

| Module | Contains | Light Logic |
|--------|----------|-------------|
| **BELT / ITEMS** | Drop status, bot dots, belt bar, item queue, manifest pool | Amber = item waiting; Green = drop active |
| **COMMS** | Bank/debt/payment, Sven controls, May/scrap dispatch, Standing Orders | Red = arrears or payment ≤3 days; Amber = ≤7 days or scrap ≥75% |
| **STOREROOM** | Keep log, sell-back, George's Warehouse, Schematic board | Red = scrap ≥90%; Amber = ≥75% or keep ≥10 items |
| **SYSTEMS / BOTS** | Bot status + repair, Station Upgrades, Active Orders, Schematic transmit | Red = missed payments or arrears >2000 cr |
| **AUXILIARY** | George's direct terminal — unlocked during toaster incident | Amber = active during power outage sequence |

---

## Project Structure

```
otis/
├── api/
│   └── otis.js                    # Vercel serverless function — Anthropic API proxy
├── docs/
│   ├── ASCII-bots-rolling-animation.html  # Dev prototype (superseded by inline #anim-window)
│   ├── otis_bins_escalation_guide.html    # Design reference doc
│   └── dad-jokes.md                       # Joke pool design notes
├── images/
│   ├── MASTER_SCHEMATIC.txt               # ASCII schematic art
│   └── otis_sprite/                       # ARM panel sprite states
├── sounds/                                # Music and SFX mp3s
├── index.html                # Complete game — all CSS, GameState, and logic inline
├── otis.js                   # OTIS system prompt, seed history, askOTIS()
├── intro.js                  # Intro driver
├── intro.html                # Boot intro screen
├── sound.js                  # OtisSound engine (music / ambient / SFX)
├── dad-jokes.js              # Silence-detector joke pool (~200 jokes)
├── tts.js                    # TTS toggle (Web Speech synthesis)
├── audio.js                  # AudioManager — master gain + lowpass filter
├── vercel.json               # Vercel rewrite config
├── .env.example              # Environment variable template
└── README.md
```

> **Note:** `game.js`, `state.js`, and `style.css` from early prototypes have been superseded. All game logic is inline in `index.html`.

---

## Local Development

1. **Clone the repo**
   ```bash
   git clone https://github.com/questforgelitrpg/OTIS.git
   cd OTIS
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env — add your Anthropic API key
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
| `ANTHROPIC_API_KEY` | Your Anthropic API key — set in Vercel dashboard for production, never committed |

---

## Timing Constants (current values in `index.html`)

| Constant | Value | Controls |
|----------|-------|----------|
| `MS_PER_INGAME_DAY` | 240,000 ms (4 min) | Day clock, payment pressure, toast |
| `BELT_DELIVERY_MS` | 45,000 ms (45 s) | Item arrival rate during a drop |
| `DAYS_BETWEEN_DROPS` | 2 days | ~8 real minutes between drops |
| `DROP_VARIANCE_DAYS` | 0 | No jitter — strict every-other-day schedule |
| `PAYMENT_CYCLE_DAYS` | 7 days | ~28 real minutes per payment cycle |
| `DEBUG_SPEED_MULTIPLIER` | 10x | Fast mode divides all `_MS` values |

---

## Known Issues

These items were identified in the comprehensive code review and were **not** addressed in this PR:

- **Naming tier via reserves** — `recalculateNamingTier()` still references `reserveSuccesses` (always 0 now that the reserve route is removed). Naming tier advancement relies on skip count, arrears, and payment history. A future PR should remove the `reserveSuccesses` path or wire advancement to the SVEN BIN route.
- **Monolith structure** — `index.html` is ~360 KB of inline CSS + JS. Module refactor is tracked separately.
- **Standing Orders concurrency** — No guard prevents the same template firing twice in quick succession if `checkStandingOrders()` runs on back-to-back day advances.

---

## Roadmap

### Active
- [ ] Monolith-to-module refactor — tracked separately in the GitHub issues

### Backlog
- [ ] OTIS arm CSS animation (raise/lower/point toward active module)
- [ ] Manifest pool expansion — more items, more categories
- [ ] Seasonal barge events — elevated rare/anomalous rates
