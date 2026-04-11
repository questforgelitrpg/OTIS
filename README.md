# Dead Signal

A LitRPG browser-based prototype set aboard a derelict space salvage station. You interact with **OTIS** — the Operational Terminal Intelligence System — through a retro CRT console interface while managing station debt, scanning salvage, and surviving the slow grind of deep-space operations.

**Live demo:** https://deadsignal-seven.vercel.app

---

## Phase 0 Feature Set

- Dark CRT console UI with seven functional zones
- OTIS AI terminal powered by Claude Haiku via Anthropic API
- Rolling conversation context (last 12 exchanges)
- Game state: debt tracking, day counter, naming tier progression, session timer
- State persistence via `localStorage`
- Secure API proxy on Vercel (API key never exposed to the client)

---

## Console Zones

| Zone | Description |
|------|-------------|
| `BELT_MONITOR` | Belt scan triggers and signal status |
| `COMMS` | Incoming channel management |
| `SYSTEMS` | Life support / power / comms status readouts |
| `LEDGER` | Debt and day counters with OTIS debt consult |
| `ITEM_QUEUE` | Keep or scrap queued salvage items |
| `OTIS_TERMINAL` | Live conversation with OTIS, last 10 exchanges |
| `KEEP_LOG` | Running log of kept items |

---

## Project Structure

```
deadsignal/
├── api/
│   └── otis.js       # Vercel serverless function — Anthropic API proxy
├── index.html        # Console UI — seven zones, OTIS terminal, status bar
├── style.css         # Dark CRT theme
├── game.js           # GameState class — state machine, triggers, session timer
├── otis.js           # OTIS system prompt, seed history, askOTIS() function
├── state.js          # StateManager — localStorage save/load
├── audio.js          # AudioManager — optional CRT audio effects
├── vercel.json       # Vercel rewrite config
├── .env.example      # Environment variable template
└── README.md
```

---

## Local Development

1. **Clone the repo**
   ```bash
   git clone https://github.com/questforgelitrpg/deadsignal.git
   cd deadsignal
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
   This starts the local dev server with the `/api/otis` proxy wired up.

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key — set in Vercel dashboard, never committed |

See `.env.example` for the template. The API key is consumed exclusively by the `api/otis.js` serverless function and is never sent to the browser.

---

## API Proxy (`api/otis.js`)

POST `/api/otis`

**Request body:**
```json
{
  "system": "<system prompt string>",
  "messages": [{ "role": "user", "content": "..." }, ...]
}
```

**Response:** Anthropic Messages API response object. The client reads `data.content[0].text`.

---

## OTIS Character

OTIS is sardonic, world-weary, and occasionally helpful. Responses are 1–3 sentences maximum. Tone adapts to session fatigue level (FRESH → TIRED → WORN → SPENT). The operator is addressed by naming tier:

| Tier | Name | Condition |
|------|------|-----------|
| 0 | Mr. Serling | Default / formal |
| 1 | Vern | Relationship building |
| 2 | Buddy | High familiarity |

---

## Game State

Tracked fields:

| Field | Type | Description |
|-------|------|-------------|
| `debt` | number | Station debt percentage (0–100) |
| `day` | number | In-game day counter |
| `sessionHours` | number | Real elapsed session hours |
| `namingTier` | number | OTIS naming familiarity (0–2) |
| `skipCount` | number | Consecutive skipped items |
| `act` | number | Current story act |
| `keepLog` | array | Items kept, with day stamp |
| `recentEvents` | array | Last 5 trigger events (used in OTIS context) |

State is saved to `localStorage` on every trigger fire and loaded automatically on page load.

---

## Deployment

The project deploys automatically to Vercel on push to `main`. The `vercel.json` rewrite routes `/` to `index.html`. The `ANTHROPIC_API_KEY` environment variable must be set in the Vercel project dashboard.

---

## Roadmap

- **Phase 1** — Debt mechanics, item queue population, belt scan results
- **Phase 2** — Full GDD system wire-up (acts, McGuffin filter, stress escalation)
- **Phase 3** — Audio integration, advanced OTIS reactions, full playthrough loop
