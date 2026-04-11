# tsbv-crawl

Personal podcast player from people. Fetches the RSS feed, stores it locally, and serves a React web app to listen and read episodes.

This project just for personal purpose only.

## Structure

```
tsbv-crawl/
├── scripts/fetch.mjs   # Node script: fetch RSS → data/feed.json
├── data/feed.json      # Cached episode data (generated)
└── web/                # React + Vite frontend
```

## Quick Start

**1. Fetch the feed**

```bash
npm install
npm run fetch
```

This downloads the Buzzsprout RSS feed and writes it to `data/feed.json`.

**2. Run the web app**

```bash
cd web
npm install
npm run dev
```

Open **http://localhost:5173**.

## Updating the Feed

Re-run `npm run fetch` from the project root whenever you want fresh episodes.

You can also point to a different feed:

```bash
node scripts/fetch.mjs 'https://example.com/feed.rss'
# or
FEED_URL='https://...' npm run fetch
OUT_FILE='data/custom.json' npm run fetch
```

## Web App Features

| Feature | How to use |
|---------|-----------|
| Browse episodes | Scroll the center list |
| Play / Pause | Click the play button on a card, or press **Space** |
| Seek | Drag the progress bar at the bottom |
| Skip | Press **← / →** arrow keys (±15 s) |
| Search | Type in the search bar; press **Enter** to lock a keyword as a chip |
| Multi-keyword AND search | Add multiple chips — only episodes matching all chips are ranked up |
| Clear search | Click × or **Backspace** with empty input to remove last chip |
| Read show notes | Right dock shows the full description of the currently playing episode |
| Playlists | Click the clipboard icon on any episode card |
| Resize right dock | Drag the left edge of the right panel |

Playlists are saved in `localStorage` and persist across page reloads.

## Tech

- **Crawler:** Node 18+, `fast-xml-parser`
- **Web:** React 18, Vite, TypeScript, Tailwind CSS
