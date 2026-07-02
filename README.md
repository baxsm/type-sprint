# type-sprint

<p align="center">
  <img src="assets/logo.svg" alt="type-sprint" width="280">
</p>

> A typing speed game for code and prose. Practice solo, take the daily challenge, or race a friend in real time.

![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6)
![Next.js](https://img.shields.io/badge/Next.js-16-000000)
![Realtime](https://img.shields.io/badge/realtime-socket.io-010101)
![Tests](https://img.shields.io/badge/tests-100%2B%20passing-27c93f)

<p align="center">
  <img src="assets/screenshots/landing.png" alt="type-sprint landing page: hero with a live typing demo, feature list, how it works, and a character showcase" width="800">
</p>

Type at your own pace, take a daily challenge everyone gets the same snippet for, or open a second window and race a friend live. Every keystroke is scored in real time: WPM, accuracy, consistency, and errors, with per-character feedback and a caret that follows exactly where you are.

## Features

**Solo practice** - pick a language and difficulty, type at your own pace. Per-character feedback, a smooth sliding caret, and a full results breakdown on every run.

<p align="center">
  <img src="assets/screenshots/practice-results.png" alt="Practice results panel showing WPM, accuracy, consistency, raw WPM, errors, and elapsed time" width="700">
</p>

**Daily challenge** - the same snippet for everyone, once a day. Past days are locked in and read-only, today is playable, and a streak calendar tracks your current and longest runs.

<p align="center">
  <img src="assets/screenshots/daily-streak.png" alt="Daily challenge page with a streak calendar showing completed, missed, and today's cell, plus current and longest streak" width="700">
</p>

**Interactive stats** - Recharts-based WPM-over-time and per-language charts with real hover detail, plus best/average/accuracy history and a full run log. All derived from local history, no server round trip.

<p align="center">
  <img src="assets/screenshots/stats.png" alt="Stats page with a WPM-over-time area chart, a per-language bar chart, and a table of recent runs" width="700">
</p>

**Real-time race** - open a room, share a 4-letter code, and race a friend over a real WebSocket connection with live opponent progress.

<p align="center">
  <img src="assets/screenshots/race-lobby.png" alt="Race lobby with a name field, character badge, create-a-race panel, and join-a-race panel" width="700">
</p>

**Character avatars** - DiceBear-rendered avatars, shared between the profile, race lanes, and the landing page's character showcase.

## Tech

| Layer | Choice |
| --- | --- |
| Frontend | Next.js (App Router) + Tailwind CSS, hand-rolled neobrutalist UI primitives |
| Animation | GSAP for game-feel moments (caret, countdown, race lanes, hero demo), Motion for scroll reveals and UI transitions |
| Charts | Recharts, styled to the app's own design tokens |
| Realtime | Socket.IO (Bun server, `@socket.io/bun-engine`), room-based races |
| Data | No database. Stats and history live in `localStorage`, validated with Zod |
| Testing | Vitest + Testing Library (unit/component), Playwright (e2e), Bun test (server) |

No database and no accounts in this build. Personal stats live in the browser. The "multiplayer" race is a real WebSocket connection with in-memory rooms on a small Bun server, not a mock.

## Running locally

Frontend:

```bash
cd frontend
bun install
bun run dev
```

Race server (only needed for the race mode):

```bash
cd ws-server
bun install
bun run dev
```

Open `http://localhost:3000` for the landing page, or `http://localhost:3000/app/race` in two browser windows. Create a race in one, share the 4-letter code, join it in the other, and race.

## Project structure

```
type-sprint/
  frontend/     # Next.js app
  ws-server/    # Bun + Socket.IO race server (in-memory rooms, no DB)
  assets/       # README media
```

## Testing

```bash
# frontend
cd frontend
bun run test        # unit + component (vitest)
bun run test:e2e     # playwright, including a real two-window race
bun run typecheck
bun run lint

# race server
cd ws-server
bun test             # unit + real-socket integration
bun run typecheck
bun run lint
```

## Status

Public portfolio project. No database, no accounts, no deployment config included here.
