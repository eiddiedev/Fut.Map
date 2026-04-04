# Fut.Map

[中文说明](./README.zh-CN.md)

Fut.Map is a cinematic football atlas built with Next.js. It starts with a motion-led landing scene, drops into a 3D globe for national-team storytelling, and expands into a 2D world map for league and club exploration.

This repo is currently set up as a demo-focused build:

- 3D globe for featured national teams
- 2D map for club badges, league badges, and geographic distribution
- on-demand sidebar refresh for club and national-team details
- cached snapshot data to reduce API cost and keep the demo stable

## Demo Notes

- The current demo mainly shows `2024` league data because the project is built around the free API-Football tier.
- Club identity data is imported in batches and cached locally in [data/cache/football-snapshot.json](/Users/a1234/Documents/Playground/data/cache/football-snapshot.json).
- Clicking a team badge can trigger a server-side refresh for recent fixtures, next fixture, coach, honors, and latest lineup when quota is available.
- If a team is no longer covered by the provider, has been renamed, or the daily quota is exhausted, the UI falls back to cached or historical data instead of going blank.

## Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Mapbox GL
- Three.js
- API-Football

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example file:

```bash
cp .env.local.example .env.local
```

Then fill in:

- `NEXT_PUBLIC_MAPBOX_TOKEN`
- `NEXT_PUBLIC_TIANDITU_KEY`
- `API_FOOTBALL_KEY`
- `API_FOOTBALL_BASE_URL`

### 3. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

```bash
npm run dev
npm run build
npm run build:verify
npm run start
npm run test
```

## Project Structure

```text
app/                 Next.js app router pages and API routes
components/          globe, flat map, sidebar, landing UI
data/                mock data and cached football snapshot
lib/                 football data pipeline, fallback logic, helpers
public/              textures, map assets, badges, fonts
scripts/             one-off data repair and import utilities
```

## Data Flow

### Initial load

- The app loads a cached football snapshot first.
- The 3D globe reads featured national-team data.
- The 2D map reads club positions, league ids, and badge URLs from the snapshot.

### On badge click

- The client calls `POST /api/football/refresh/[teamId]`.
- The server resolves the provider team id when possible.
- It then requests:
  - recent fixtures
  - next fixture
  - coach
  - trophies
  - latest lineup

### Importing more leagues

The repo also includes a batch import route:

- `POST /api/football/import`

This is used to progressively import league identity data into the local snapshot without forcing full live refresh for every team on first load.

## Known Limits

- Free-tier API quota is limited by both daily requests and per-minute rate limits.
- Some leagues may not show a league logo if a verified badge source has not been mapped yet.
- Some lower-division or defunct clubs may only have cached historical data.
- Team and league logos currently rely on a mix of provider URLs, Wikimedia assets, and local static assets.

