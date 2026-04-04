# Fut.Map

[中文说明](./README.zh-CN.md)

Fut.Map is a cinematic football atlas built with Next.js. It starts with a motion-led landing scene, drops into a 3D globe for national-team storytelling, and expands into a 2D world map for league and club exploration.

This repo is currently set up as a demo-focused build:

- 3D globe for featured national teams
- 2D map for club badges, league badges, and geographic distribution
- on-demand sidebar refresh for club and national-team details
- cached snapshot data to reduce API cost and keep the demo stable

## Demo Notes

- The current default season is `2024`.
- That default is intentional: API-Football free-tier access is only reliable for historical seasons in this project.
- If you use a paid API-Football plan, set `API_FOOTBALL_LATEST_SEASON` to the latest season your plan can access, and the same import/refresh pipeline will request that season instead of `2024`.
- Club identity data is imported in batches and cached locally during development, or persisted to Vercel Blob in production when `BLOB_READ_WRITE_TOKEN` is configured.
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
- `API_FOOTBALL_LATEST_SEASON`
- `BLOB_READ_WRITE_TOKEN` for Vercel production persistence

Recommended values:

- Free API-Football tier: `API_FOOTBALL_LATEST_SEASON=2024`
- Paid API-Football tier: set `API_FOOTBALL_LATEST_SEASON` to the latest season your plan exposes, for example `2025` or `2026`

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

### First deploy: why the club list may look empty

On a fresh deploy, the app starts from fallback data. Real league club lists are not pre-bundled into the repo because they are imported into the snapshot store after deployment.

If you deploy to Vercel and do nothing else, the site can come up with:

- national-team fallback data
- a small curated club set
- no large imported league snapshot yet

To populate clubs after deploy, trigger one of these routes:

- `POST /api/football/bootstrap?mode=bundesliga`
- `POST /api/football/bootstrap?mode=priority`
- `POST /api/football/bootstrap?mode=all`

Examples:

```bash
curl -X POST https://your-domain/api/football/bootstrap?mode=priority
```

Or import a specific league batch manually:

```bash
curl -X POST https://your-domain/api/football/import \
  -H "Content-Type: application/json" \
  -d '{
    "leagues": [
      { "country": "England", "tier": 1, "leagueId": 39, "leagueName": "Premier League", "season": 2024 }
    ]
  }'
```

On Vercel, once `BLOB_READ_WRITE_TOKEN` is present, those imports persist online and remain available after redeploys or cold starts.

## Known Limits

- Free-tier API quota is limited by both daily requests and per-minute rate limits.
- Free-tier usage in this repo is intentionally pinned to `2024` by default. Latest-season live coverage requires a paid API plan plus `API_FOOTBALL_LATEST_SEASON`.
- Some leagues may not show a league logo if a verified badge source has not been mapped yet.
- Some lower-division or defunct clubs may only have cached historical data.
- Team and league logos currently rely on a mix of provider URLs, Wikimedia assets, and local static assets.
