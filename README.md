# islibasha.dev

Personal portfolio of **Isli Basha** — Agent & Automation Specialist at Ofive Global, Tirana — built as an interactive **Windows 95 desktop simulation** in React 19.

**Live: [islibasha.dev](https://islibasha.dev)**

![Windows 95 desktop simulation — desktop icons, taskbar, and SiteCounter.exe window](screenshot.png)

## What's inside

**Desktop (Win95):**

- Boot sequence, draggable/resizable windows, taskbar with Start menu
- DOS-style terminal (`cmd`) with real commands
- Playable Minesweeper and Snake
- `my work` folder with 20 projects, `resume.pdf` viewer, contact window

**Mobile (Nokia 3310):**

- On phone viewports the site becomes a Nokia 3310 — LCD chrome, boot intro, monochrome dithered screens
- Playable Snake II, Space Impact, and Bantumi

**AI discoverability:**

- [`/llms.txt`](public/llms.txt) machine-readable site summary for AI assistants
- Static pre-rendered content inside `#root` so non-JS crawlers see a real page
- JSON-LD structured data; AI/LLM crawlers explicitly allowed in `robots.txt`

## Stack

React 19 + Vite, hand-rolled Win95 CSS (no UI library), Vitest (328 tests).

## Run it

```bash
npm install
npm run dev      # local dev server
npm test         # run the test suite
npm run build    # production build (pre-dithers screenshots)
```
