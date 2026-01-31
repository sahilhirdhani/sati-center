# Sati Center – Game Engine

A deterministic, rule-locked multiplayer card game engine built to support console play, REST APIs, WebSockets, and UI clients **without changing core logic**.

The engine is client-agnostic, strictly validated, replayable, and designed for long-term scalability.

---

## Core Principles

- Single source of truth for all game rules
- Strict validation before every state change
- Deterministic gameplay (replayable from history)
- No UI or network assumptions
- Cheat-safe by default
- Clean separation of concerns


---

## Game Overview

### Players
- Minimum: **3**
- Maximum: **9**
- Each player has:
  - `id`
  - `name`
  - `hand`
  - `isActive`
  - `position`

---

### Decks & Layout Modes

| Players | Decks | Layout Mode |
|------|------|-------------|
| 3–5  | 1    | `single` |
| 6–9  | 2    | `double-sets` / `double-repeated` |

Layout mode determines how cards can be placed on the table.

---

### Table Rules

- Cards are placed into suit piles
- Legal placement depends on:
  - existing pile sequence
  - layout mode
  - card continuity rules

---

## Turn System

- Turns are deterministic
- Only the current active player may act
- Finished players are skipped automatically
- Turn advances only after a valid action

---

## Actions

Supported actions:
- `PLAY_CARD`
- `SKIP_TURN`
- `ROLLBACK_MOVE` (cheat-only)

All actions must pass validation before being applied.

---

## Validation Layer

Every action is validated through a centralized validator.

Validation ensures:
- Game is active
- Player is the current turn holder
- Player is active
- Move exists in the legal move set
- Cheat-only actions are blocked when cheats are disabled

No invalid state transitions are possible.

---

## Legal Move Engine

All legal moves are computed in advance using:
- player hand
- table state
- layout mode
- cheat settings

Moves are never guessed or inferred.

---

## Replay & History

- Every valid action is stored in `moveHistory`
- Rollback restores previous snapshots
- Entire games can be replayed deterministically
- Enables debugging, spectators, and future replay UI

---

## Cheat System

- Cheats are **disabled by default**
- When enabled:
  - Skipping with legal moves is allowed
  - Rollback is permitted

Cheats are enforced explicitly through validation logic.

---

## Views (Client-Safe)

The engine exposes controlled views for different roles.

### Admin View
- Full game state
- All hands visible

### Player View
- Own hand visible
- Other hands hidden
- Legal moves included

### Spectator View
- No hands visible
- Table and turn info only

Views are pure transformations of state.

---

## Console Client

Located in `clients/console/`

Used for:
- rule testing
- turn flow verification
- validation testing
- replay testing

No UI or network dependencies.

---

## Determinism Guarantee

Given the same:
- initial setup
- shuffled deck
- sequence of actions

The engine will always produce the same outcome.

---

## What This Project Does Not Include

- REST API
- WebSockets
- Authentication
- Persistence
- UI

These are intentionally layered on top later without modifying the engine.

---

## Philosophy

The game engine defines **what is allowed** — never **how it is played**.
