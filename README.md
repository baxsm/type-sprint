# type-sprint

A browser-based typing speed game. Type code snippets and prose against the clock, track your WPM and accuracy, take a daily challenge, and race a second player in real time over WebSockets.

## Features

- Solo practice with difficulty levels and language modes (JavaScript, Python, English prose)
- Live typing surface with per-character feedback, a moving caret, and real-time WPM and accuracy
- Daily challenge: the same snippet for everyone on a given date, with a personal best
- Two-window real-time race over WebSockets (watch the opponent's progress move as they type)
- Personal stats and history, stored locally in the browser

## Tech

- Next.js (App Router) + Tailwind CSS
- HeroUI for base components
- Motion for animations
- A small Bun WebSocket server with in-memory rooms for race mode

## Running locally

Frontend:

```
cd frontend
bun install
bun run dev
```

WebSocket server (for race mode):

```
cd ws-server
bun install
bun run dev
```

Open two browser windows, create a race in one, join it with the code in the other, and race.
