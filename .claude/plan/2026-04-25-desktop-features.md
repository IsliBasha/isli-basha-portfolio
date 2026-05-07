# Plan — Desktop Portfolio Features (2026-04-25)

Scope: 3 features. Approach: surgical (Option A). No new dependencies.

## Feature 1 — Non-scroll desktop on ≥1024px

### Goal
Page does not scroll on desktop. Windows live inside `100dvh - taskbar`. Long content scrolls inside the window's content area. Mobile (<1024px) keeps current scrolling layout.

### Files
- `src/index.css` — desktop-only `html, body, #root { overflow: hidden; height: 100vh }`.
- `src/styles/win95.css` — rewrite `.desktop-area @media (min-width:1024px)` block:
  - `position: relative; height: calc(100dvh - 34px); overflow: hidden;` (drop the grid).
  - Windows become `position: absolute` with default `top/left/width`.
  - Window content: `max-height: ...; overflow: auto;` (already exists for `--maximized`; extend to non-maximized).
- Default positions table (px-anchored to roomy desktops, % for fluid):
  - `.win-about`     — `top: 7%; left: 16%; width: 38%`
  - `.win-projects`  — `top: 38%; left: 26%; width: 56%`
  - `.win-stack`     — `top: 8%; left: 56%; width: 30%`
  - `.win-contact`   — `top: 56%; right: 4%; width: 26%`
  - `.win-minesweeper` / `.win-snake` — already absolute, keep
- Window content `max-height: calc(100% - titlebar-height)`.

### Acceptance
- On desktop, `document.body.scrollHeight === window.innerHeight`.
- Content overflow scrolls within the window content div.
- Mobile layout unchanged.

## Feature 2 — 90s PC boot sequence

### Goal
Cinematic boot sequence on first session visit. Skippable. Plays a Win95-style chime. Falls back gracefully.

### New files
- `src/components/BootSequence.jsx`
- `src/styles/boot.css` (imported via `index.css`)
- `src/components/BootSequence.test.jsx` (Vitest + RTL)
- `src/lib/bootChime.js` — pure Web Audio synth (no asset).

### State machine
States: `bios → memcheck → splash → done`. `done` unmounts the overlay.

| Phase | Duration | Visual |
|---|---|---|
| `bios` | 1200ms | Black screen, AMI/Award-style header, "Press DEL to enter SETUP", CPU/RAM lines, beep |
| `memcheck` | 1800ms | "Memory Test : 0000064K OK" counting up to 0524288K |
| `splash` | 1500ms | Win95-style cloud splash with "Starting Windows 95..." progress bar |
| `done` | — | Overlay fades out |

### Behavior
- `useEffect` on mount: check `sessionStorage.getItem('isli-boot-seen')`; if `'1'`, set state to `done` immediately.
- Check `matchMedia('(prefers-reduced-motion: reduce)').matches`; if true, set `done` immediately.
- Skip handlers: `keydown` (Esc, Enter, Space) and `click` on overlay → `done`.
- On entering `done`, set `sessionStorage.setItem('isli-boot-seen', '1')`.
- Sound: on `bios` start, call `playBootChime()` from `lib/bootChime.js`. Use Web Audio OscillatorNode + envelope. Autoplay attempt; if `audioContext.state !== 'running'` after `resume()`, fail silently.

### App integration
- `src/App.jsx` wraps existing tree: `<BootSequence />` rendered as a sibling overlay over `<main>`.
- Optional `aria-busy="true"` on `<main>` while booting (prevents AT focus into hidden content).

### Acceptance
- Visiting first time: full sequence plays.
- Refresh in same session: skipped.
- New tab: replays.
- `prefers-reduced-motion: reduce`: skipped.
- Pressing Esc skips immediately.

## Feature 3 — Window polish

### Goal
Persist window positions across reloads. Add minimize-to-taskbar animation. Add Start-menu "Reset desktop" item.

### New files
- `src/hooks/useWindowPosition.js`
  - Reads `localStorage['win95:positions:v1']`, returns `{ position, savePosition }` for a given id.
- `src/components/Window.jsx` — extend:
  - Read initial offset from hook on mount.
  - On `endDrag`, persist offset.
  - Track `closing` state; on close, set state to `'closing'`, wait 200ms (CSS animation duration), then call `close(id)`.
  - Same for minimize: `'minimizing'` state, transform-toward-taskbar animation, then `hide(id, title)`.
- `src/styles/win95.css`:
  - `@keyframes win-minimize { to { opacity: 0; transform: translateY(40vh) scale(0.4); } }`
  - `@keyframes win-close { to { opacity: 0; transform: scale(0.95); } }`
  - `.win95-window--minimizing { animation: win-minimize 220ms ease-in forwards; pointer-events: none; }`
  - `.win95-window--closing   { animation: win-close 160ms ease-in forwards; pointer-events: none; }`
- `src/components/Taskbar.jsx`:
  - Add menu item: `Reset desktop` → clears `localStorage['win95:positions:v1']` and reloads.

### Acceptance
- Drag a window → reload → window appears at last position.
- Minimize plays 220ms anim; window then hides into taskbar entry.
- Close plays brief fade; window unmounts.
- Reset desktop wipes positions.
- `WindowStack` tests still pass.

## Test plan

- New: `BootSequence.test.jsx` covers: skip via sessionStorage, skip via reduced-motion, skip via keyboard, sets sessionStorage on done.
- New: `useWindowPosition.test.js` covers: read/write, schema versioning, corrupt localStorage fallback.
- Existing tests: `vitest run` must remain green.
- Manual: dev server smoke test — confirm no scrollbar on desktop, boot plays once per session, drag persists.

## Out of scope (deferred)
- Right-click desktop menu
- Screensaver
- Audio toggle UI (autoplay-only per user choice)
- Mobile boot sequence (skipped on small screens too — adds nothing)

## Build order
1. CSS-only viewport lock + window absolute positions (Feature 1).
2. `BootSequence` + chime + CSS (Feature 2).
3. `useWindowPosition` + Window animations + Reset menu item (Feature 3).
4. Tests, lint, build verification.
