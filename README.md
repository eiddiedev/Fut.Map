# Fut.Map

[中文说明](./README.zh-CN.md)

Live preview: [https://fm.eiddie.top](https://fm.eiddie.top)

Fut.Map is a cinematic football atlas built with Next.js. It starts from a motion-led landing page, opens into a 3D globe for national-team storytelling, and expands into a 2D world map for club exploration.

This public repo is centered on the same main experience shown in the preview link above. If you want to experiment with alternative international map providers or build your own overseas version, feel free to explore that on top of this codebase.

## Preview Notes

- The public site is a preview, not a live-data production service.
- Flylines in the 3D globe are simulated visual effects.
- The default season is pinned to `2024` because that is the most stable setup under the free API-Football tier used by this demo.
- Because of those free-tier limits, the default demo is not truly real-time.
- If you self-host with a paid API-Football plan, you can point `API_FOOTBALL_LATEST_SEASON` to the newest season your plan exposes and use the existing import and refresh pipeline for near-real-time or real-time updates.

## Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Mapbox GL
- Three.js
- API-Football

## Local Development

1. Install dependencies

```bash
npm install
```

2. Copy the example env file

```bash
cp .env.local.example .env.local
```

3. Fill in the required values

- `NEXT_PUBLIC_MAPBOX_TOKEN`
- `NEXT_PUBLIC_TIANDITU_KEY`
- `API_FOOTBALL_KEY`
- `API_FOOTBALL_BASE_URL`
- `API_FOOTBALL_LATEST_SEASON`

Optional value:

- `BLOB_READ_WRITE_TOKEN` for persistent snapshot storage on Vercel

Recommended defaults:

- Free API-Football tier: `API_FOOTBALL_LATEST_SEASON=2024`
- Paid API-Football tier: set `API_FOOTBALL_LATEST_SEASON` to the latest accessible season, such as `2025` or `2026`

4. Run the app

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

## Data Notes

- The app loads a cached football snapshot first and then refreshes on demand.
- Clicking a team badge can trigger a server-side refresh for recent fixtures, next fixture, coach, honors, and latest lineup when quota is available.
- If a team is no longer covered by the provider, has been renamed, or the daily quota is exhausted, the UI falls back to cached or historical data instead of going blank.
- On a fresh deployment, you may still need to import league data into the snapshot store before a full club map appears.

## Limits

- Free-tier API usage is constrained by both daily quota and rate limits.
- Some leagues may still miss verified league logos.
- Some lower-division or defunct clubs may only have cached historical data.
- Team and league logos currently come from a mix of provider URLs, Wikimedia assets, and local static assets.
