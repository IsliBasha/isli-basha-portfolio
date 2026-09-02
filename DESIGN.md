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
  memo-canary: "#fff9c4"
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

The design system is built from the bevel. Every surface — buttons, windows, inputs, cards, the taskbar — uses the same four-layer double-border technique that Win95 used. Elevation is theatrical, not ambient: shadows exist because they are part of the performance. The system makes you feel like you are touching embossed plastic hardware. Typography follows a strict split: IBM Plex Mono for anything that belongs to the OS (titlebar labels, terminal output, sticky notes, clock, taskbar) and IBM Plex Sans for anything that is human-facing content (body copy, contact, project descriptions). One font family, two registers, complete discipline.

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
- **Memo Canary** (#fff9c4): The sticky note. The only warm color on the desktop. Its warmth signals human presence inside the machine.

### Neutral
- **Bootup Horizon** (gradient: #d6eaf8 → #aed6f1): The desktop background. Cool, pale, ambient. The environment everything lives inside.
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

### Terminal

The stack window. A phosphor CRT display.

- **Background:** Terminal Black (#0c0c0c). **Text:** Phosphor Green (#33ff33). IBM Plex Mono, 0.8125rem, 1.55 lh.
- **Border:** 1px solid Bevel Black, inset shadow.
- **Cursor:** 8px block, green, blinks at 1s steps(1) — no smooth fade.

### Desktop Icons

96px icon slots; labels wrap only when a single word exceeds the slot (minesweeper.exe). Transparent by default, hover reveals the selection state.

- **Hover/Focus/Active:** the **label** highlights, not the slot — solid titlebar navy (#000080) behind white text with a 1px dotted white rectangle inset 1px. The 32px glyph and the slot itself stay untouched, exactly as Win95 drew a selected shortcut.
- **Label:** IBM Plex Mono 0.75rem, white text with 1px black text-shadow for legibility against the sky. A name wider than the slot wraps to a second line rather than bleeding past it. The text-shadow drops while the label is highlighted — the navy fill already carries the contrast.

### Sticky Note

The hero introduction. The only element that breaks from the OS aesthetic — warm, off-center, human.

- **Background:** Memo Canary (#fff9c4), 3deg clockwise rotation, irregular torn bottom via clip-path polygon.
- **Shadow:** Two-layer: `2px 3px 0 rgba(0,0,0,0.12), 5px 8px 12px rgba(0,0,0,0.1)`.
- **Font:** IBM Plex Mono throughout (name 700/1.125rem, role 500/0.875rem, body 0.8125rem).

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
