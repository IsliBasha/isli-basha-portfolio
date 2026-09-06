import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(resolve(here, 'win95.css'), 'utf8');
const tokensCss = readFileSync(resolve(here, '..', 'index.css'), 'utf8');

function ruleBody(selector) {
  const pattern = new RegExp(
    `${selector.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`,
  );
  const match = css.match(pattern);
  if (!match) throw new Error(`no rule for ${selector}`);
  return match[1];
}

describe('contact window CSS', () => {
  it('anchors .win-contact in the desktop layout without stretching', () => {
    const body = ruleBody('.win-contact');
    expect(body).toMatch(/top\s*:\s*\d+%/);
    expect(body).toMatch(/right\s*:\s*\d+%/);
    expect(body).toMatch(/width\s*:\s*\d+%/);
  });
});

describe('desktop layout CSS', () => {
  it('locks the desktop area height inside the desktop media query', () => {
    expect(css).toMatch(/@media\s*\(min-width:\s*1024px\)/);
    expect(css).toMatch(/\.desktop-area[\s\S]*?height\s*:\s*calc\(100vh\s*-\s*34px\)/);
  });

  it('does not cap default window content height (no scroll on initial open)', () => {
    // The desktop media query must not force max-height: <n>vh on the
    // default window content: windows should size naturally to fit content.
    const desktopBlock = css.match(
      /@media\s*\(min-width:\s*1024px\)\s*\{([\s\S]+)\}\s*$/m,
    );
    const block = desktopBlock ? desktopBlock[1] : css;
    expect(block).not.toMatch(
      /\.win-(?:about|projects|stack|contact)\s+\.win95-window__content\s*\{[^}]*max-height\s*:\s*\d+vh/,
    );
  });
});

describe('maximized window CSS', () => {
  it('defines a rule for the maximized modifier that fills the viewport', () => {
    const body = ruleBody('.win95-window--maximized');
    expect(body.length).toBeGreaterThan(0);
    expect(body).toMatch(/position\s*:\s*fixed/);
  });
});

function topLevelRuleBody(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(?:^|\\n)${escaped}\\s*\\{([^}]*)\\}`);
  const match = css.match(pattern);
  if (!match) throw new Error(`no rule for ${selector}`);
  return match[1];
}

function mobileCssBlock() {
  const idx = css.indexOf('@media (max-width: 1023px)');
  if (idx === -1) return '';
  const after = css.slice(idx);
  // Slice up to the next top-level @media rule
  const nextMedia = after.indexOf('\n@media', 1);
  return nextMedia === -1 ? after : after.slice(0, nextMedia);
}

describe('mobile responsive polish', () => {
  it('makes windows full-width on mobile to prevent horizontal clipping', () => {
    const block = mobileCssBlock();
    expect(block).toContain('.win95-window');
    expect(block).toMatch(/width\s*:\s*100%/);
  });

  it('prevents horizontal scrolling on the mobile desktop area', () => {
    const block = mobileCssBlock();
    expect(block).toMatch(/overflow-x\s*:\s*hidden/);
  });
});

describe('mobile grid row sizing', () => {
  it('does not stretch grid rows to fill leftover viewport height on mobile', () => {
    // .desktop-area is `display: grid` with `min-height: calc(100vh - 34px)`
    // and no explicit grid-template-rows. Without align-content: start, the
    // default (normal, which behaves as stretch for Grid) evenly distributes
    // leftover viewport height across every row -- inflating .desktop-icons
    // and every window far beyond their natural content height on mobile.
    const body = topLevelRuleBody('.desktop-area');
    expect(body).toMatch(/align-content\s*:\s*start/);
  });
});

describe('terminal output anchoring', () => {
  it('anchors terminal content to the bottom instead of floating at the top', () => {
    // .stack-cmd__inner (wrapping all output lines + the trailing prompt
    // row) uses margin-top: auto inside the flex-column .stack-cmd__output,
    // not justify-content: flex-end directly on the scrollable container.
    // flex-end on a scrolling flex container has a well-known bug: content
    // that overflows toward the "start" (opposite the packed end) doesn't
    // extend scrollHeight, making it permanently inaccessible via scroll.
    // margin-top: auto on a single wrapper avoids that entirely.
    const outputBody = topLevelRuleBody('.stack-cmd__output');
    expect(outputBody).toMatch(/display\s*:\s*flex/);
    expect(outputBody).not.toMatch(/justify-content\s*:\s*flex-end/);

    const innerBody = topLevelRuleBody('.stack-cmd__inner');
    expect(innerBody).toMatch(/margin-top\s*:\s*auto/);
  });
});

describe('window flex layout for natural resize', () => {
  it('window is a flex column so the content area fills the chrome', () => {
    const body = topLevelRuleBody('.win95-window');
    expect(body).toMatch(/display\s*:\s*flex/);
    expect(body).toMatch(/flex-direction\s*:\s*column/);
  });

  it('window content stretches to fill remaining vertical space', () => {
    const body = topLevelRuleBody('.win95-window__content');
    expect(body).toMatch(/flex\s*:\s*1/);
    expect(body).toMatch(/min-height\s*:\s*0/);
  });
});

// Unlike ruleBody() above, this tolerates a selector that shares its
// declaration block with other selectors in a comma-separated list. It is
// anchored to the start of a line and requires a selector boundary after the
// match, so `.win95-desktop-icon` cannot silently resolve to the block of
// `.win95-desktop-icon__label`.
function declarationBlockFor(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(
    new RegExp(`(?:^|\\n)${escaped}(?=[\\s,{])[^{}]*\\{([^}]*)\\}`),
  );
  if (!match) throw new Error(`no rule for ${selector}`);
  return match[1];
}

describe('chrome foundation — no rotated OS chrome', () => {
  it('leaves no non-zero --tilt override anywhere in the stylesheet', () => {
    // Windows sat at -1.4deg..+1.6deg on desktop. A rotated element cannot
    // land its 1px bevel on a device pixel, so every edge was resampled.
    // The custom property and `rotate: var(--tilt)` stay so the effect is
    // one value away from coming back; only non-zero values are gone.
    const tilts = css.match(/--tilt:\s*[^;]+;/g) ?? [];
    expect(tilts.length).toBeGreaterThan(0);
    for (const decl of tilts) {
      expect(decl).toMatch(/--tilt:\s*0deg;/);
    }
  });

  it('keeps the reversible rotate hook on the window frame', () => {
    const body = topLevelRuleBody('.win95-window');
    expect(body).toMatch(/rotate\s*:\s*var\(--tilt\)/);
    expect(body).toMatch(/--tilt:\s*0deg/);
  });
});

describe('chrome foundation — flat titlebars', () => {
  it('fills the active titlebar with a flat navy, not a gradient', () => {
    const body = topLevelRuleBody('.win95-window__titlebar');
    expect(body).toMatch(/background\s*:\s*var\(--c-title-from\)/);
    expect(body).not.toMatch(/linear-gradient/);
  });

  it('defines the inactive titlebar state driven by the active window id', () => {
    const body = declarationBlockFor(
      '.win95-window--inactive .win95-window__titlebar',
    );
    expect(body).toMatch(/background\s*:\s*var\(--c-title-inactive\)/);
    expect(body).toMatch(/color\s*:\s*var\(--c-title-inactive-text\)/);
  });
});

describe('chrome foundation — caption buttons', () => {
  it('gives the caption button a color for its glyphs to inherit', () => {
    // The glyph rects fill with currentColor. Without an explicit color the
    // button would inherit the titlebar's white and the glyphs would vanish.
    const body = topLevelRuleBody('.win95-titlebar-btn');
    expect(body).toMatch(/color\s*:\s*var\(--c-text\)/);
    expect(body).toMatch(/width\s*:\s*16px/);
    expect(body).toMatch(/height\s*:\s*14px/);
  });

  it('keeps the close glyph readable on its red hover instead of white-out', () => {
    const body = topLevelRuleBody('.win95-titlebar-btn--close:hover');
    expect(body).toMatch(/background\s*:\s*#d44/);
    expect(body).not.toMatch(/color\s*:/);
  });
});

describe('chrome foundation — token roles', () => {
  it('makes the outer bevel edge pure black', () => {
    expect(tokensCss).toMatch(/--c-gray-darker:\s*#000000;/);
  });

  it('defines a dedicated muted-text token', () => {
    expect(tokensCss).toMatch(/--c-text-muted:\s*#404040;/);
  });

  it('defines the inactive titlebar tokens', () => {
    expect(tokensCss).toMatch(/--c-title-inactive:\s*#808080;/);
    expect(tokensCss).toMatch(/--c-title-inactive-text:\s*#c0c0c0;/);
  });

  it('raises inactive-titlebar contrast when the reader asks for it', () => {
    // The period-accurate default is 2.2:1. prefers-contrast: more is the
    // escape hatch, so it must keep overriding both halves of the pair.
    const block = tokensCss.match(
      /@media\s*\(prefers-contrast:\s*more\)\s*\{\s*:root\s*\{([^}]*)\}/,
    );
    expect(block).not.toBeNull();
    expect(block[1]).toMatch(/--c-title-inactive:\s*#5a5a5a;/);
    expect(block[1]).toMatch(/--c-title-inactive-text:\s*#ffffff;/);
  });

  it('never paints text with the bevel-edge token', () => {
    // --c-gray-darker is a line colour now. Anything that used it as a text
    // colour would silently turn pure black when the token flipped.
    expect(css).not.toMatch(/(^|\n)\s*color:\s*var\(--c-gray-darker\)/);
  });
});

describe('chrome foundation — desktop icon selection', () => {
  it('sizes the icon slot so only a long single word wraps', () => {
    // 96px slot - 2x4 slot padding - 2x2 label padding = 84px of label box.
    // At 12px IBM Plex Mono (~7.2px/char) that holds "contact.exe" (79.2px)
    // on one line; only "minesweeper.exe" (108px) still wraps. Back at 72px
    // four of the seven labels orphaned a character onto a second line.
    const slot = topLevelRuleBody('.win95-desktop-icon');
    expect(slot).toMatch(/width\s*:\s*96px/);
  });

  it('highlights the label, not the 96px icon slot', () => {
    const slot = topLevelRuleBody('.win95-desktop-icon');
    expect(slot).toMatch(/background\s*:\s*transparent/);
    expect(slot).not.toMatch(/rgba\(0,\s*0,\s*128/);

    const highlight = declarationBlockFor(
      '.win95-desktop-icon:hover .win95-desktop-icon__label',
    );
    expect(highlight).toMatch(/background\s*:\s*var\(--c-title-from\)/);
    expect(highlight).toMatch(/outline\s*:\s*1px dotted #ffffff/);
  });

  it('gives keyboard focus the same visible highlight as hover', () => {
    // .win95-desktop-icon:focus-visible sets outline: none, so the label
    // highlight is the entire keyboard focus indicator. If it ever drops out
    // of this selector list, tabbing the desktop becomes invisible.
    const focus = declarationBlockFor(
      '.win95-desktop-icon:focus-visible .win95-desktop-icon__label',
    );
    expect(focus).toMatch(/background\s*:\s*var\(--c-title-from\)/);
    expect(focus).toMatch(/outline\s*:\s*1px dotted #ffffff/);
  });

  it('wraps a label that is wider than the 96px slot', () => {
    const label = topLevelRuleBody('.win95-desktop-icon__label');
    expect(label).toMatch(/max-width\s*:\s*100%/);
    expect(label).toMatch(/overflow-wrap\s*:\s*anywhere/);
    expect(label).toMatch(/white-space\s*:\s*normal/);
  });
});

describe('explorer chrome — grid scrolling', () => {
  // The 25 project tiles are taller than the window at every size it opens at.
  // .explorer-tile-grid is a grid item inside the two-column body, and a grid
  // item's default `min-height: auto` sizes it to its content, so `overflow-y`
  // never engaged and the parent clipped the last row instead. Both
  // declarations are load-bearing; either one alone brings the clipping back.
  it('lets the tile grid shrink so it can scroll instead of being clipped', () => {
    const grid = topLevelRuleBody('.explorer-tile-grid');
    expect(grid).toMatch(/overflow-y\s*:\s*auto/);
    expect(grid).toMatch(/min-height\s*:\s*0/);
  });

  // Below the window's resize floor the explorer asks for more height than the
  // client area has. Clipping there hid the bottom of the window with no clue
  // it was there; scrolling puts it a drag away.
  it('scrolls the explorer window content rather than clipping it', () => {
    const content = declarationBlockFor('.win95-window__content.win-mywork__content');
    expect(content).toMatch(/overflow\s*:\s*auto/);
  });

  it('keeps the detail pane at a fixed height so the grid absorbs the resize', () => {
    // The pane is inline-styled in MyWorkExplorer.jsx; what the stylesheet
    // must not do is give the grid a fixed height that would fight it.
    const grid = topLevelRuleBody('.explorer-tile-grid');
    expect(grid).not.toMatch(/(^|[^-])height\s*:/);
  });
});

describe('explorer chrome — tile selection', () => {
  const SELECTED_LABEL = ".explorer-tile[data-selected='true'] .explorer-tile__label";
  const FOCUSED_LABEL = '.explorer-tile:focus-visible .explorer-tile__label';
  const SELECTED_AND_FOCUSED_LABEL =
    ".explorer-tile[data-selected='true']:focus-visible .explorer-tile__label";

  it('highlights the tile label, not the whole tile', () => {
    const tile = topLevelRuleBody('.explorer-tile');
    expect(tile).toMatch(/background\s*:\s*transparent/);
    expect(tile).not.toMatch(/--c-title-from|#000080/);

    const highlight = declarationBlockFor(SELECTED_LABEL);
    expect(highlight).toMatch(/background\s*:\s*var\(--c-title-from\)/);
    expect(highlight).toMatch(/color\s*:\s*#ffffff/);
  });

  // Selection and focus used to share one declaration block, so a tile the
  // keyboard had merely landed on looked exactly like the tile whose project
  // was in the detail pane. The fill means selected; the marquee means the
  // keyboard is here.
  it('marks focus with a marquee that repaints nothing', () => {
    expect(declarationBlockFor(SELECTED_LABEL)).not.toMatch(/outline/);

    const focus = declarationBlockFor(FOCUSED_LABEL);
    expect(focus).toMatch(/outline\s*:\s*1px dotted var\(--c-text\)/);
    expect(focus).toMatch(/outline-offset\s*:\s*1px/);
    expect(focus).not.toMatch(/background|color\s*:/);
  });

  // At +1px on a selected tile the marquee would sit on the grid's near-white
  // background, where white is invisible, so it moves inside the navy.
  it('turns the marquee white inside the fill when both states are on', () => {
    const both = declarationBlockFor(SELECTED_AND_FOCUSED_LABEL);
    expect(both).toMatch(/outline-color\s*:\s*#ffffff/);
    expect(both).toMatch(/outline-offset\s*:\s*-1px/);
  });

  it('leaves the tile box itself without a second focus ring', () => {
    expect(topLevelRuleBody('.explorer-tile:focus-visible')).toMatch(
      /outline\s*:\s*none/,
    );
  });
});

describe('explorer chrome — sidebar rows', () => {
  it('paints the category name and leaves the row and its icon alone', () => {
    const row = topLevelRuleBody('.explorer-folder-item');
    expect(row).toMatch(/background\s*:\s*transparent/);
    expect(row).not.toMatch(/--c-title-from|#000080/);

    const highlight = declarationBlockFor(
      ".explorer-folder-item[data-selected='true'] .explorer-folder-item__label",
    );
    expect(highlight).toMatch(/background\s*:\s*var\(--c-title-from\)/);
    expect(highlight).toMatch(/color\s*:\s*#ffffff/);
  });

  // The tiles' split again: fold these two rules into one and a row the
  // keyboard has merely reached wears the fill of the row that is open.
  it('gives a focused row the same marquee as a focused tile', () => {
    expect(
      declarationBlockFor(
        ".explorer-folder-item[data-selected='true'] .explorer-folder-item__label",
      ),
    ).not.toMatch(/outline/);

    const focus = declarationBlockFor(
      '.explorer-folder-item:focus-visible .explorer-folder-item__label',
    );
    expect(focus).toMatch(/outline\s*:\s*1px dotted var\(--c-text\)/);

    const both = declarationBlockFor(
      ".explorer-folder-item[data-selected='true']:focus-visible .explorer-folder-item__label",
    );
    expect(both).toMatch(/outline-color\s*:\s*#ffffff/);
  });
});

describe('explorer chrome — status bar panels', () => {
  it('draws the status bar as sunken panels in the muted text colour', () => {
    const bar = topLevelRuleBody('.explorer-statusbar');
    expect(bar).toMatch(/display\s*:\s*flex/);
    expect(bar).toMatch(/color\s*:\s*var\(--c-text-muted\)/);

    const panel = topLevelRuleBody('.explorer-statusbar__panel');
    expect(panel).toMatch(/border-top-color\s*:\s*var\(--c-gray-dark\)/);
    expect(panel).toMatch(/border-bottom-color\s*:\s*#ffffff/);
  });
});

describe('games chrome', () => {
  // The counters are SVG now. A leftover font-family would silently win over
  // nothing and reintroduce a third type family for six numerals.
  it('names no seven-segment webfont anywhere in the stylesheet', () => {
    expect(css).not.toMatch(/DSEG7|Share Tech Mono/);
  });

  it('positions the counter so its off-screen text stays inside the display', () => {
    // .seven-seg__value is position: absolute. Without a positioned ancestor it
    // resolves against the page, and a 1px clipped box parked at the document
    // origin is a scrollbar waiting to happen.
    expect(topLevelRuleBody('.seven-seg')).toMatch(/position\s*:\s*relative/);
    expect(topLevelRuleBody('.seven-seg__value')).toMatch(/position\s*:\s*absolute/);
  });

  it('leaves the snake food square and the head unglowed', () => {
    const food = topLevelRuleBody('.snake-cell--food');
    expect(food).not.toMatch(/border-radius/);

    const head = topLevelRuleBody('.snake-cell--head');
    expect(head).not.toMatch(/box-shadow/);
  });
});

describe('pdf viewer chrome', () => {
  it('paints the download link accent blue rather than titlebar navy', () => {
    expect(topLevelRuleBody('.pdf-download-link')).toMatch(
      /color\s*:\s*var\(--c-accent\)/,
    );
  });

  // --c-title-from is the active titlebar fill. Used as a text colour it reads
  // as a near-black that happens to be blue, and it competes with the one
  // window that is supposed to be wearing it.
  it('never paints text with the titlebar fill', () => {
    expect(css).not.toMatch(
      /(^|\n)\s*color:\s*(var\(--c-title-from\)|#000080\b)/i,
    );
  });
});

describe('contact chrome', () => {
  it('lines the contact labels and values up on two grid tracks', () => {
    const links = topLevelRuleBody('.contact-links');
    expect(links).toMatch(/display\s*:\s*grid/);
    expect(links).toMatch(/grid-template-columns\s*:\s*max-content 1fr/);

    const label = topLevelRuleBody('.contact-links__label');
    expect(label).not.toMatch(/width\s*:\s*72px/);
  });

  it('sets the message label as a field label, not a section heading', () => {
    const label = topLevelRuleBody('.contact-form__label');
    expect(label).toMatch(/font-family\s*:\s*var\(--font-mono\)/);
    expect(label).toMatch(/font-weight\s*:\s*700/);
    expect(label).toMatch(/font-size\s*:\s*0\.75rem/);
    expect(label).not.toMatch(/text-transform/);
    expect(label).not.toMatch(/letter-spacing/);
  });
});
