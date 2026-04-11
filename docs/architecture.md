# Architecture

## Overview

Two independent parts: a **Node crawler** that pulls the RSS feed, and a **React web app** that reads the cached JSON and renders the UI.

```
Buzzsprout RSS
     │
     ▼
scripts/fetch.mjs  ──writes──▶  data/feed.json
                                     │
                                     ▼
                              web/src/data/feed.json  (copy / Vite import)
                                     │
                              usePodcast() hook
                                     │
                              Episode[] (normalized)
                                     │
                          ┌──────────┼──────────┐
                          ▼          ▼           ▼
                      LeftDock  EpisodeList  RightDock
                      (playlists) (center)   (show notes)
                                     │
                                AudioPlayer (sticky bottom)
```

---

## Data Pipeline

### 1. Fetch (`scripts/fetch.mjs`)

- Downloads the `.rss` URL via `fetch()`.
- Parses XML with `fast-xml-parser` (attributes kept as `@_*`, CDATA as `__cdata`).
- Writes `{ fetchedAt, url, contentType, parsed }` to `data/feed.json`.

### 2. Normalize (`web/src/hooks/usePodcast.ts`)

Reads `feed.json` at build time (Vite static import) and flattens each RSS `<item>` into an `Episode`:

| `Episode` field | RSS source |
|-----------------|-----------|
| `id` | `guid["#text"]` |
| `title` | `title` |
| `pubDate` | `pubDate` |
| `summary` | `itunes:summary.__cdata` (plain text) |
| `descriptionHtml` | `description.__cdata` (HTML) |
| `audioUrl` | `enclosure["@_url"]` |
| `durationSeconds` | `itunes:duration` |

---

## Component Tree

```
App
├── LeftDock          — playlist management (240px, lg+ only)
├── SearchBar         — chip-based search with 800ms debounce
├── EpisodeList       — sorted/filtered list, forwarded ref for scroll-to
│   └── EpisodeCard[] — play button, tags, optional description panel
├── RightDock         — full HTML show notes (resizable, lg+ only)
├── AudioPlayer       — sticky bottom bar, owns <audio> element
└── AddToPlaylistModal — overlay, rendered when a card's bookmark is clicked
```

---

## Search

**File:** `web/src/utils/search.ts`

- User types into `SearchBar`; input is debounced 800 ms before `liveQuery` updates.
- Pressing **Enter** commits the current text as a **chip** (array stored in `App` state).
- Active search terms = `[...chips, liveQuery]`.
- **Scoring** (`scoreEpisode`): title match = +10, each description occurrence = +1.
- **AND logic** (`scoreEpisodeAll`): if any term scores 0 the episode scores 0 overall.
- `sortedEpisodes` sorts by total score descending; zero-score episodes go to the end (not hidden).
- Matched text is highlighted with a `<mark>` in indigo across all active terms simultaneously.

---

## Playlist State

**File:** `web/src/hooks/usePlaylists.ts`

- State: `Playlist[]` (id, name, color, episodeIds[], collapsed).
- Persisted to `localStorage` under key `tsbv-playlists`.
- Color palette: 8 values; unused colors are preferred on creation.
- One episode can belong to multiple playlists.
- `scrollToEpisode` in `App.tsx` finds a card by `data-episode-id` attribute and calls `scrollIntoView`.

---

## Audio Playback

**File:** `web/src/components/AudioPlayer.tsx`

- A single `<audio>` element owns all playback state.
- Episode changes trigger `audio.load()` + auto-play if `isPlaying` was true.
- Progress bar: three layers — buffered (dark gray), played (indigo), transparent range input on top.
- Global keyboard shortcuts registered in `AudioPlayer` (ignored when an `<input>` is focused):
  - **Space** — play / pause
  - **← / →** — skip ±15 s

---

## Layout

Three-column layout at `lg` breakpoint and above:

```
┌──────────┬────────────────────────┬──────────────┐
│ LeftDock │     EpisodeList        │  RightDock   │
│  240px   │   flex-1, scrollable   │  320px+      │
│          │                        │  (resizable) │
└──────────┴────────────────────────┴──────────────┘
              AudioPlayer (fixed bottom, full width)
```

- Below `lg`: only the center column is shown.
- Right dock width is draggable (min 320px, max `window.innerWidth`), tracked in `App` state.
