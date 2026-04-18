# O.T.I.S. — Object, Tracking & Inventory System

A browser-based narrative game set aboard a junk-processing moon salvage station. You run the whole operation from a single terminal console — no walking, no inventory screens, just the terminal, the station, and the things you choose to keep or discard.

**OTIS** (Object, Tracking & Inventory System) is your AI co-star, powered by the Anthropic API. His slow drift from cold bank machine toward something George built is part of the story.

**Live demo:** 

---

## What the Game Is

You are Vernon Serling, new operator of a debt-laden salvage station orbiting a dead moon. Your predecessor, George, ran the place for 25 years. He left debts, a warehouse of mysterious components, and a trail of hidden messages behind.

Every drop, the barge brings items. You sort them. The bank watches the clock. Sven Digut runs interference from the outside. May Finster handles scrap. OTIS handles everything else.

The station is also a transmitter. George spent 25 years hiding the proof.

---

## Current Refactor State

This repository is currently in a refactored-but-still-monolithic state:

- The main game loop, UI, state management, and most logic live in `index.html`
- Supporting systems are split into helper files such as `otis.js`, `intro.js`, `sound.js`, `audio.js`, and `tts.js`
- `game.js`, `state.js`, and `style.css` from early prototypes have been superseded
- The current refactor work is focused on gradually extracting the monolith into clearer modules

This README reflects the current structure of the project rather than the original prototype layout.

---

## Feature Set

- **Pure terminal aesthetic** — phosphor green on near-black, CRT scanline overlay, flicker animation
- **OTIS AI terminal** — powered by the Anthropic API; rolling conversation context and a silence detector that triggers dad jokes after inactivity
- **Item economy** — manifest pool, rarity tiers, condition multipliers, per-rarity credit caps, and George-item bonuses
- **Declaration flow** — EXAMINE & VALUE / GEORGE ARCHIVE / SKIP routes items to May, Sven, Keep, or Scrap
- **Debt system** — loan pressure, payment cycles, arrears, escalation tiers, and foreclosure consequences
- **Station upgrades** — scanner, belt governor, storeroom expansion, comm boost, power regulator, hull patch, and cooling loop
- **Standing orders** — timed item requests from May, Sven, and the bank
- **Bank inspections** — periodic inspections with bot-status checks
- **Bot degradation** — bots degrade over time and require calibration or parts
- **Sven complicity** — Sven can interfere with broker-bound items
- **Toaster incident** — a major power-outage sequence tied to story progression
- **Auxiliary channel** — George’s direct terminal, unlocked through story state
- **Naming progression** — title changes based on story and debt state
- **Maze mini-game** — runs in the animation panel during idle periods
- **Master Integration Schematic** — an 8-node puzzle tied to the legacy ending
- **George’s Diary** — story entries unlocked through progression and exploration
- **George’s Warehouse** — hidden items that feed into the schematic
- **Multiple endings** — humanity, commerce, compromise, and legacy paths
- **State persistence** — session state survives reload via `localStorage`
- **Debug panel** — force actions and fast mode for testing
- **TTS** — optional Web Speech synthesis
- **Spatial audio** — optional CRT ambient, belt SFX, and music tracks

---

## Console Modules

| Module | Contains | Light Logic |
|--------|----------|-------------|
| **BELT / ITEMS** | Drop status, bot dots, belt bar, item queue, manifest pool | Amber = item waiting; Green = drop active |
| **COMMS** | Bank/debt/payment, Sven controls, May/scrap dispatch, standing orders | Red = arrears or payment pressure; Amber = warning thresholds |
| **STOREROOM** | Keep log, sell-back, George’s Warehouse, schematic board | Red = high scrap pressure; Amber = elevated keep/scrap state |
| **SYSTEMS / BOTS** | Bot status + repair, station upgrades, active orders, schematic transmit | Red = missed payments or severe arrears |
| **AUXILIARY** | George’s direct terminal — unlocked during the toaster incident | Amber = active during power outage sequence |

---

## Project Structure

```text
otis/
├── api/
│   └── otis.js                    # Serverless API proxy
├── docs/
│   ├── ASCII-bots-rolling-animation.html  # Early prototype / reference
│   ├── otis_bins_escalation_guide.html    # Design reference doc
│   └── dad-jokes.md                       # Joke pool design notes
├── images/
│   ├── MASTER_SCHEMATIC.txt               # ASCII schematic art
│   └── otis_sprite/                       # ARM panel sprite states
├── sounds/                                # Music and SFX assets
├── index.html                # Main game: UI, state, logic, and styling are inline
├── otis.js                   # OTIS system prompt, seed history, askOTIS()
├── intro.js                  # Intro driver
├── intro.html                # Boot intro screen
├── sound.js                  # OtisSound engine (music / ambient / SFX)
├── dad-jokes.js              # Silence-detector joke pool
├── tts.js                    # TTS toggle (Web Speech synthesis)
├── audio.js                  # AudioManager — master gain + lowpass filter
├── vercel.json               # Vercel rewrite config
├── .env.example              # Environment variable template
└── README.md
