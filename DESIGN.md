---
name: Isli Basha — Portfolio
description: Fast, minimal, useful things.
colors:
  sky-top: "#d6eaf8"
  sky-bottom: "#aed6f1"
  chrome: "#c0c0c0"
  chrome-dark: "#808080"
  bevel-black: "#000000"
  chrome-light: "#dfdfdf"
  chrome-lighter: "#ececec"
  titlebar: "#000080"
  titlebar-inactive: "#808080"
  accent: "#1a73e8"
  ink: "#1a1a2e"
  text-muted: "#404040"
  win-bg: "#fdfdfd"
  phosphor-green: "#33ff33"
  term-bg: "#0c0c0c"
  panic-blue: "#0000aa"
typography:
  display:
    fontFamily: "IBM Plex Mono, ui-monospace, Consolas, monospace"
    fontSize: "2.4rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.04em"
  headline:
    fontFamily: "IBM Plex Mono, ui-monospace, Consolas, monospace"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.02em"
  title:
    fontFamily: "IBM Plex Mono, ui-monospace, Consolas, monospace"
    fontSize: "0.8125rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.02em"
  body:
    fontFamily: "IBM Plex Sans, system-ui, -apple-system, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "IBM Plex Mono, ui-monospace, Consolas, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.02em"
rounded:
  none: "0px"
spacing:
  xs: "2px"
  sm: "4px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.chrome}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "4px 12px"
  button-primary-active:
    backgroundColor: "{colors.chrome-light}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "5px 11px 3px 13px"
  input-field:
    backgroundColor: "{colors.win-bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "4px 6px"
  project-card:
    backgroundColor: "{colors.chrome-lighter}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "12px"
---

# Design System: Isli Basha — Portfolio

## 1. Overview

**Creative North Star: "The Ghost in the Machine"**

This is a 1990s operating system shell running on modern React, fully aware of what it is. The portfolio does not simulate Windows 95 as a novelty trick — it commits to the metaphor completely: draggable windows, a functioning taskbar, a boot sequence, a BSOD, Minesweeper, Snake. The visitor is not looking at a portfolio with a retro skin. They are using a machine.

The design system is built from the bevel. Every surface — buttons, windows, inputs, cards, the taskbar — uses the same four-layer double-border technique that Win95 used. Elevation is theatrical, not ambient: shadows exist because they are part of the performance. The system makes you feel like you are touching embossed plastic hardware. Typography follows a strict split: IBM Plex Mono for anything that belongs to the OS (titlebar labels, terminal output, clock, taskbar) and IBM Plex Sans for anything that is human-facing content (body copy, contact, project descriptions). One font family, two registers, complete discipline.

The system explicitly rejects: generic dark-mode developer portfolios with hero sections and glowing stack badges; AI-assembled layouts that read as interchangeable across a thousand portfolios; maximalist agency scroll experiences that prioritize spectacle over information; anything that could have been assembled from a template in an afternoon.

**Key Characteristics:**
- Bevel-based elevation — every raised or sunken surface uses the same four-layer double-border + inset shadow vocabulary
- Zero border radius — all OS chrome is pixel-sharp
- Two-font discipline — Mono for the system, Sans for the person
- Sky blue desktop gradient as the primary environment
- Theatrical motion — animation is part of the OS illusion, not added decoration

## 2. Colors: The Ghost Palette

A faithful Win95 environment with two expressive additions: the sky desktop gradient that sets the scene, and the phosphor green terminal that signals technical depth.

### Primary
- **Active Window Blue** (#000080): The titlebar fill — flat, no gradient. The most saturated element in the entire system. Used exclusively on window titlebars, the start menu stripe, and the start menu hover state. Its rarity is the signal for focus. Nowhere else.
- **Inactive Gray** (#808080): The titlebar fill of every window that is not on top, with #c0c0c0 label text. The absence of Active Window Blue is what makes focus readable at a glance. 2.2:1 by design — period-accurate; the title is duplicated in the region's aria-label and the taskbar, and `prefers-contrast: more` switches to #5a5a5a/#ffffff.
- **Accent Link Blue** (#1a73e8): Hyperlinks and keyboard focus rings. Sits between the titlebar gradient and the sky. Never used as a surface color.

### Secondary
- **Phosphor Green** (#33ff33): Terminal foreground only. High chroma against near-black; immediately signals active computation.

### Tertiary
- **Panic Blue** (#0000aa): BSOD background only. A single-use emergency color that owns its moment completely and appears nowhere else.

### Neutral
- **Bootup Horizon** (gradient: #d6eaf8 → #aed6f1): The desktop background. Cool, pale, ambient. The environment everything lives inside. Display Properties swaps it for one of four wallpapers — the clouds photo, the same photo ordered-dithered against the VGA palette (the sky half of it: it lands on six colours, and leaving the reds and magentas out of the plan is what keeps the sky blue instead of speckled), flat Teal (#008080), or the Setup gradient (#0000a8 → #000050) the installer ran on. Teal and Setup are the two backgrounds a real Win95 showed when it was not showing a picture; all four keep the same pale, receding role, so nothing on the desktop has to change contrast when one is chosen.
- **POST Gray** (#c0c0c0): System chrome — the surface of every window, button, and taskbar element. The single most-used color in the system.
- **Chrome Light** (#dfdfdf): Highlight edge of bevels (top/left in bevel-out).
- **Chrome Dark** (#808080): Shadow edge of bevels (right/bottom in bevel-out).
- **Bevel Black** (#000000): Outer bevel edge only — the right/bottom border of a raised surface and the deepest inset layer of a sunken one. Never a text or surface colour.
- **Chrome Lighter** (#ececec): Project card surface — one step lighter than POST Gray.
- **Win Background** (#fdfdfd): Window content area. Near-white, never pure white.
- **Ink** (#1a1a2e): All body text. Deep navy-tinted near-black — never pure black.
- **Text Muted** (#404040): De-emphasised text — status bars, counters, hints. The one step down from Ink.
- **Terminal Black** (#0c0c0c): Terminal background. Near-black.

### Named Rules

**The One Focus Rule.** Active Window Blue (#000080) appears in exactly one place: the titlebar of the window on top. It is the system signal for context and focus. Do not use it as a decorative color, background tint, or button fill anywhere else. Its power comes from its exclusivity — which is also why every other titlebar drops to Inactive Gray.

**The No-Pure-Extreme Rule.** No pure `#000000` or `#ffffff` in any surface or text role — bevel edges excepted. Every neutral is tinted — #fdfdfd for window backgrounds, #1a1a2e for text. The bevel system uses #ffffff on highlight edges and #000000 on shadow edges, which is structurally required: a bevel that does not reach both extremes reads as a blurred rectangle rather than an edge.

## 3. Typography

**Display Font:** IBM Plex Mono (ui-monospace, Consolas fallback)
**Body Font:** IBM Plex Sans (system-ui, -apple-system fallback)

**Character:** IBM Plex Mono carries the system voice — technical, authoritative, period-correct. IBM Plex Sans carries the human voice — readable, approachable, marginally warmer. The split is the thesis of the design: the machine speaks in Mono, the person inside speaks in Sans.

### Hierarchy
- **Display** (Mono, 700, 2.4rem, lh 1.2, ls 0.04em): Boot splash brand text only. Never used in the running UI.
- **Headline** (Mono, 700, 1rem, lh 1.3, ls 0.02em): Window section headings (`~/ whoami`), project card names. OS-register text that identifies content.
- **Title** (Mono, 700, 0.8125rem, lh 1.2, ls 0.02em): Titlebar labels, taskbar task labels, clock, start menu items. System chrome typography.
- **Body** (Sans, 400, 0.9375rem, lh 1.55): All human-facing content — about text, contact items. Max line length 65–70ch.
- **Label** (Mono, 500, 0.75rem, lh 1.3): Stack pills, captions, terminal lines, form labels. Smallest readable system text.

### Named Rules

**The System/Human Split Rule.** IBM Plex Mono is the OS speaking. IBM Plex Sans is the person. This split is not aesthetic preference — it is the structural logic of the interface. Any new element that belongs to OS chrome uses Mono. Any element that is content from Isli uses Sans. No exceptions.

## 4. Elevation

Elevation is theatrical, not ambient. Surfaces do not float — they perform. The bevel is the elevation model: a four-layer system (1px directional border + two inset box-shadows) that reproduces the physical feel of embossed plastic hardware. The system has two states: raised (bevel-out) and pressed (bevel-in). The Win95 window drop shadow (`4px 4px 0px rgba(0,0,0,0.18)`) is the only concession to soft depth — it grounds windows against the desktop without breaking the pixel-hardware aesthetic.

### Shadow Vocabulary
- **Bevel-out** (border: white top/left, Bevel Black right/bottom + inset Chrome Light/Dark): Default raised state. Windows, buttons, taskbar, start menu.
- **Bevel-in** (border: Chrome Dark top/left, white right/bottom + inset Bevel Black/Chrome Light): Pressed or sunken state. Active buttons, focused inputs, window content areas, project cards on hover.
- **Win drop shadow** (`box-shadow: 4px 4px 0px rgba(0,0,0,0.18)`): Window frames and dialogs. Pixel-offset, no blur — keeps the hardware aesthetic.
- **Sticky shadow** (`2px 3px 0 rgba(0,0,0,0.12), 5px 8px 12px rgba(0,0,0,0.1)`): Two-layer soft shadow on the sticky note only. The sole ambient-style shadow in the system.

### Named Rules

**The Bevel-Only Rule.** All elevation is expressed through the bevel system. Do not add blurred `box-shadow` values to new OS-chrome components. Elevation = bevel-out, pressed = bevel-in, floating window = win drop shadow. Three states, three expressions, no improvisation.

## 5. Components

### Buttons

Mechanical push-buttons. Pressing one shifts the border and padding by 1px to simulate physical depression — no transitions, instant state change.

- **Shape:** 0px radius. Pixel-sharp.
- **Primary:** POST Gray surface, Ink text, bevel-out borders. Padding 4px 12px. Minimum width 70px.
- **Active/Pressed:** Bevel-in — borders invert, padding shifts by 1px to simulate physical press.
- **Hover:** Chrome Light background only, no border or layout change.

### Inputs / Fields

Sunken input wells. The bevel-in state signals receptacle, not surface.

- **Style:** Win Background, bevel-in border system.
- **Font:** IBM Plex Sans for user-facing fields; IBM Plex Mono for system display fields (stack chips, sunken labels).
- **Focus:** 1px dotted outline in titlebar navy (#000080), inset 3px. No glow, no color shift.

### Windows

The signature component. Draggable, resizable OS window with titlebar, content area, and resize handles.

- **Frame:** POST Gray surface, bevel-out borders, win drop shadow. No rotation — every window sits square on the pixel grid so its 1px bevel stays 1px.
- **Titlebar:** Flat Navy (#000080), white Mono text, 700, 0.8125rem. Grab cursor when draggable.
- **Titlebar — inactive:** Every window except the one on top fills with Inactive Gray (#808080) and drops its label to #c0c0c0. The titlebar buttons keep their normal chrome.
- **Title icon:** The window's own 16x16 AppGlyph, the same `kind` its desktop icon uses, sits left of the label.
- **Content area:** Bevel-in inset border, Win Background (#fdfdfd), 1rem padding.
- **Titlebar buttons:** 16x14px, bevel-out. Glyphs are inline SVG bitmaps on the 16x14 grid (`shapeRendering="crispEdges"`), never font characters. Close sits 2px clear of maximize and turns #d44 on hover.
- **Entry animation:** `win-boot` — 300ms cubic-bezier(0.2, 0.8, 0.25, 1), scales from opacity/scale 0.92 to 1. Decisive, no ease-in.

### Project Cards

Raised panels inside the Projects window. Unique interaction: cards press in on hover (bevel-out to bevel-in), as if being physically clicked.

- **Surface:** Chrome Lighter (#ececec), bevel-out at rest.
- **Hover:** Bevel-in — borders and shadows invert. The card presses like a held button.
- **Internal:** Name in Mono 700/1rem, description in Sans 0.8125rem/1.45, stack pills as win-sunken chips. Min height 160px.

### Explorer (my work)

The file-browser window: category pane on the left, a grid of project tiles on the right, a detail pane under both and a status bar at the foot. It is the one window that has to hold 25 items, so everything in it is sized to be read at a glance rather than to fill the frame.

- **Tiles:** 32px pixel icon over a 0.65rem Mono label, transparent at rest with a 1px transparent border so selection never shifts the layout.
- **Selection:** the **label** fills with titlebar navy under white text — the icon and the tile box stay untouched, the same rule the desktop shortcuts follow.
- **Keyboard focus:** a 1px dotted marquee in Ink, 1px outside the label, painting nothing. Selection says which project the detail pane is showing; focus says where the keyboard is; they are not the same claim and sharing one highlight made arrowing through the grid read as changing the selection. On the tile that is *also* selected the marquee turns white and tucks 1px inside the navy — at +1px it would sit on the near-white grid, where white is invisible. The tile's own outline is suppressed so there are never two rings.
- **Categories pane:** the same treatment one size down — navy behind the category name only, the 16px folder icon left out of it, the same dotted marquee on focus.
- **Grid:** `overflow-y: auto` with `min-height: 0`. The second declaration is the load-bearing one — as a grid item the tile grid defaults to `min-height: auto`, sizes itself to all 25 tiles and gets clipped by the body instead of scrolling.
- **Detail pane:** fixed 140px, preview on the left and name/description/type/stack on the right. Fixed so the grid, not the pane, absorbs a resize.
- **Open button:** a plain `.win-btn` in Mono 0.6875rem carrying the destination the data already names — "GitHub", "Visit" or "Company" with the trailing arrow stripped, and the project name behind it in the accessible name. It used to be a filled #1a73e8 pill (near-black for GitHub), the only saturated fill in the window and a second focus competing with the titlebar; a button reading "Open" fixed the colour and lost the address. Projects with no public link keep a sunken pill carrying the reason instead.
- **Status bar:** `.explorer-statusbar` is a flex row of sunken panels, Muted Ink on POST Gray — object count on the left, "1 object selected" on the right. The right panel keeps its 140px whether or not it has anything to say, so the left one does not resize as the selection changes. contact.exe and SiteCounter.exe share the class with a single panel that spans the bar; text sitting loose in that row is a bug, not a variant.

### Game Windows

minesweeper.exe and snake.exe. Both are the plain window chrome around a bevelled playfield; the only thing they add to the vocabulary is the LED readout.

- **Glyphs:** the four faces, the flag and the mine are 16x16 `PixelIcon` maps in `src/lib/pixelIcons/games.js`, never font characters. The faces share one yellow disc so a swap reads as an expression change and not as a different button: idle, "oh" while a cell is held down, sunglasses on a win, X eyes on a loss.
- **Counters:** `SevenSegment` — SVG rectangles, `#ff0000` lit on `#400000` unlit over black, in a 1px bevel-in frame. Drawn rather than set in a seven-segment webfont: a third type family for six numerals would break the Mono/Sans split, and at 24px a hinted glyph lands its strokes on fractional pixels. Unlit segments are painted, not omitted, so a `1` reads as a numeral in a slot. More flags down than mines drives the mine counter below zero and it shows `-01`, spending the leading cell on a minus rather than clamping at `000` and making an over-flagged board look solved.
- **Menu bar:** the shared `.explorer-menubar`, flush against the top of the client area. Minesweeper's `Game` resets and `Help` opens a system dialog — the two menu bars on this site that are not decorative.
- **Snake cells:** square, always. The food was a 50% radius dot and the head carried a 4px glow; both were resampled edges on a desktop whose whole contract is that nothing is.

### Terminal

The stack window. A phosphor CRT display.

- **Background:** Terminal Black (#0c0c0c). **Text:** Phosphor Green (#33ff33). IBM Plex Mono, 0.8125rem, 1.55 lh.
- **Border:** 1px solid Bevel Black, inset shadow.
- **Cursor:** 8px block, green, blinks at 1s steps(1) — no smooth fade.

### Display Properties

The control-panel property sheet, opened from the desktop's right-click Properties. The one component in the system built as a tabbed sheet rather than a plain window.

- **Tabs:** Bevel-out tabs on a bevel-out sheet, sharing the POST Gray surface. The selected tab is 2px taller and sits over the sheet's top edge, so the frame line breaks under it — that break is the whole reason a tab reads as the front of a stack. One tab stop for the strip; ArrowLeft/Right move between pages and wrap, Home/End jump to the ends. Escape is Cancel and Enter is OK from anywhere in the sheet that is not itself a control, as they were in every Win95 dialog.
- **Window content:** POST Gray, not Win Background. A property sheet has no sunken client area — the tab control sits straight on the dialog face, so `.win-display__content` drops the inset well every other window has.
- **Monitor preview:** A 96x72 pixel monitor above the list, bevelled on the same light source as the chrome, its screen showing the selected wallpaper. Decorative — the listbox beneath already announces the selection.
- **Wallpaper list:** Sunken listbox, IBM Plex Sans. Selection is the only state it draws: no hover tint, exactly as a Win95 listbox behaved. Arrow keys clamp at the ends rather than wrapping, because each step repaints the whole desktop.
- **Checkbox:** 13x13, bevel-in, with the tick drawn as pixel art via `box-shadow` offsets rather than a rotated pair of borders — at -45deg a 2px border is a resampled smear, and this chrome lands on whole pixels.
- **Buttons:** OK / Cancel / Apply, right-aligned. Selecting a wallpaper previews it on the real desktop immediately; Apply saves and stays, OK saves and closes, Cancel puts back the last saved choice and closes. The live preview is the reason Cancel has to exist.

### Desktop Icons

96px icon slots; labels wrap only when a single word exceeds the slot (minesweeper.exe). Transparent by default, hover reveals the selection state.

- **Hover/Focus/Active:** the **label** highlights, not the slot — solid titlebar navy (#000080) behind white text with a 1px dotted white rectangle inset 1px. The 32px glyph and the slot itself stay untouched, exactly as Win95 drew a selected shortcut.
- **Label:** IBM Plex Mono 0.75rem, white text with 1px black text-shadow for legibility against the sky. A name wider than the slot wraps to a second line rather than bleeding past it. The text-shadow drops while the label is highlighted — the navy fill already carries the contrast.

### Start Menu

The Win95 tree, not a shortlist: Programs, Documents and Settings open fly-outs; Find, Help, Run and Shut Down sit below them, with Shut Down alone under a separator. The navy stripe down the left reads `sys95` bottom-to-top and is the only rotated text on the desktop.

- **Items:** 16px PixelIcon, label in IBM Plex Sans 0.875rem, 5px/12px padding. A parent carries a `▸` hard against the right edge; the label stays ragged-left of it.
- **Highlight:** solid titlebar navy (#000080) behind white text. Hover, keyboard focus and "this item's fly-out is open" are the same visual state, because in Win95 they were the same state — the pointer arriving on a row moves focus there too, so there is only ever one highlighted item and the keyboard picks up wherever the mouse left off.
- **Fly-outs:** anchored at the parent row's top-right corner, 168px minimum, same bevel and 3px hard shadow as the root panel. Placement is CSS; only the correction that keeps a panel inside the viewport is scripted, and it is applied as a `translate` so the menu behind it never reflows. The correction stops at the top margin: a fly-out with more items than the screen has room for scrolls rather than losing its first one off the top.
- **Motion:** the root panel rises 8px over 140ms. Fly-outs fade only, at 90ms: the viewport clamp owns `transform` on those, and an animation on the same property would cancel it.
- **Keyboard:** ArrowDown from the Start button enters the menu, ArrowUp enters at the bottom. Arrows wrap and step over the separator, ArrowRight opens a fly-out onto its first item, ArrowLeft and Escape close one level, and Escape at the root puts focus back on the Start button. So does closing Run or Shut Down: the menu is gone by then, and the button is the one thing left that the trip started from. Launching a window puts focus in the window instead, a frame later, once it exists.

### System Tray

One sunken well at the right end of the taskbar. The clock used to carry its own bevel; it now sits inside the tray's, because Win95 never drew two wells side by side.

- **Well:** bevel-in, 2px/6px padding, 6px between the speaker and the clock. Pushed right with `margin-left: auto` so the task list keeps the space it needs.
- **Speaker:** 18px hit area around a 16px glyph, two drawn states rather than one dimmed one. The muted glyph swaps the sound arcs for a red cross, so the state survives at 16px and without colour.
- **States:** no hover fill, which is what a real tray icon did. Pressing shifts the glyph 1px down-right; keyboard focus is a 1px dotted rectangle. Both leave the well itself alone.
- **Clock:** IBM Plex Mono 0.8125rem, 42px minimum width so the digits do not shuffle the tray as the minute changes.

## 6. Do's and Don'ts

### Do:
- **Do** use the bevel system for all new components with raised or pressed states — four-layer border + inset shadow is the only elevation language.
- **Do** use IBM Plex Mono for OS chrome (labels, system text, terminal) and IBM Plex Sans for human-facing content. No exceptions to this split.
- **Do** keep all OS chrome at 0px border-radius. Pixel-sharp is the contract.
- **Do** use Active Window Blue (#000080) exclusively on the active window titlebar, the desktop-icon label highlight, and system focus rings.
- **Do** include `prefers-reduced-motion` overrides for any new animation — the baseline CSS already has the pattern.
- **Do** ask whether a new feature fits as a window, desktop icon, taskbar item, or dialog before inventing a new pattern.
- **Do** animate with `transform` and `opacity` only. Use `cubic-bezier(0.2, 0.8, 0.25, 1)` or similar ease-out-expo curves.

### Don't:
- **Don't** add `border-radius` to OS chrome components. The bevel requires sharp corners. Boot splash panes (4px) are an animation artifact, not a vocabulary item.
- **Don't** add blurred `box-shadow` values to new components. The win drop shadow (`4px 4px 0px`) is the only pixel-offset shadow; the sticky note is the only ambient blur.
- **Don't** ship a generic dark-mode portfolio with hero sections, glowing stack badges, or a scrolling timeline — that is the primary anti-reference.
- **Don't** use gradient text (`background-clip: text + gradient background`). Titlebars are a flat surface fill. Text is a solid color.
- **Don't** rotate OS chrome. Windows, buttons, the taskbar and every bevelled surface stay square on the pixel grid — a rotated 1px border is a resampled smear. The sticky note is the one deliberate exception, and it is not OS chrome.
- **Don't** use Active Window Blue as a decorative accent, background tint, or fill outside titlebars and focus rings. Rarity is the point.
- **Don't** add a `border-left` or `border-right` stripe larger than 1px as a colored accent on cards or list items. Use the bevel system or a background tint instead.
- **Don't** animate `width`, `height`, `top`, `left`, `margin`, or `padding` for motion effects. Transform and opacity only.
- **Don't** use bounce or elastic easing. All motion is ease-out: `cubic-bezier(0.2, 0.8, 0.25, 1)` for windows, `cubic-bezier(0.25, 1.2, 0.5, 1)` for taskbar entries, `ease-out` for menus and overlays.
- **Don't** add content that reads as AI-assembled with no specific context — every element should carry the weight of a deliberate choice.
