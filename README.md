# Foundation Haunted House Waitlist

Local queue management for Foundation's Open House haunted house event. Run on one machine with two browser windows: a TV waitlist display and an operator registration desk.

## Requirements

- [Node.js](https://nodejs.org/) 20+
- npm
- A [Twilio](https://www.twilio.com/) account (for SMS notifications)
- Python 3 + pandas (optional, for end-of-night stats)

## Setup

```bash
npm install
```

Copy the environment template and add your Twilio credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```
TWILIO_PHONE_NUMBER=+1...
TWILIO_SID=...
TWILIO_AUTH_TOKEN=...
```

Twilio credentials are used by the local SMS server only — they are not bundled into the browser.

The SMS server binds to `127.0.0.1` only (not reachable from other machines on the network).

Optional: add `public/images/asylum-bg.jpg` for a custom waitlist photo background. Built-in **Asylum** and **Catacombs** CSS themes are available on the home page and work offline.

## Run on event night

Start the app (Vite frontend + local SMS server):

```bash
npm run dev
```

Then open **both** in the **same browser** on the same machine:

| Window                | URL                                |
| --------------------- | ---------------------------------- |
| TV waitlist display   | http://localhost:5173/waitlist     |
| Operator registration | http://localhost:5173/registration |

Launch page: http://localhost:5173/

**Do not open port 3000 in the browser** — that is the SMS API backend only. The Vite terminal line shows the correct app URL (often `http://localhost:5173`).

Press **F11** on the TV window for fullscreen.

### Port already in use?

If `npm run dev` reports port **3000** or **5173** is busy, stop any previous dev session (Ctrl+C in that terminal), or set a different SMS port in `.env`:

```
SMS_PORT=3001
```

Vite will proxy `/api` to that port automatically.

**Ports still busy?** Stop old dev sessions (Ctrl+C), or on Windows:

```powershell
Get-NetTCPConnection -LocalPort 3000,5173 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

## End-of-night stats

Download queue history from the registration page, then:

```bash
pip install -r requirements.txt
python getStats.py HauntedHouseHistory.json
```

## Scripts

| Command                    | Description                                        |
| -------------------------- | -------------------------------------------------- |
| `npm run dev`              | Start frontend + SMS server                        |
| `npm run build`            | Production build                                   |
| `npm run preview`          | Preview production build                           |
| `npm test`                 | Run unit tests                                     |
| `npm run lint`             | Lint source files                                  |
| `npm run lint:fix`         | Lint and auto-fix where possible                   |
| `npm run format`           | Format all files with Prettier                     |
| `npm run format:check`     | Check formatting without writing                   |
| `npm run typecheck`        | Typecheck app + server TypeScript                  |
| `npm run typecheck:app`    | Typecheck Vue app only                             |
| `npm run typecheck:server` | Typecheck SMS server only                          |
| `npm run verify`           | Run format check, lint, typecheck, test, and build |

## Features

- **Tonight's stats** on the registration desk (groups completed, people, avg/longest wait)
- **Backup / restore** queue JSON from the registration toolbar (mid-event safety net)
- **TV theme picker** on the home page (Asylum vs Catacombs backgrounds)

## Project structure

- `src/stores/queue.ts` — queue logic (Pinia)
- `src/pages/registration.vue` — operator desk
- `src/pages/waitlist.vue` — TV display
- `server/` — localhost Twilio SMS proxy
- `getStats.py` — post-event analytics

## Editing

- **Waitlist look:** `src/pages/waitlist.vue` and `src/styles/theme.scss`
- **Queue logic:** `src/stores/queue.ts`
