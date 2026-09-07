import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WindowStackContext } from '../context/windowStackContext.js';
import { DesktopIcon } from './DesktopIcon.jsx';

// vi.mock is hoisted above every binding in this file, so the counter it reads
// has to be hoisted with it — a plain top-level const is still in its temporal
// dead zone when DesktopIcon.jsx pulls the glyph in.
const glyph = vi.hoisted(() => ({ renders: 0 }));

// DesktopGlyph.test.jsx asserts the memo wrapper is there. This counts what the
// wrapper is for, which a caller can take away without touching
// DesktopGlyph.jsx at all: one non-primitive prop out of DesktopIcon and every
// pointermove of a drag rebuilds 96-212 rect elements again.
//
// The memo comes off the shipped export rather than being applied here, so
// deleting memo() from DesktopGlyph.jsx fails this test too instead of leaving
// it measuring a wrapper the test itself supplied.
vi.mock('./DesktopGlyph.jsx', async (importOriginal) => {
  const { createElement, memo } = await import('react');
  const { DesktopGlyph: shipped } = await importOriginal();

  const isMemo = shipped.$$typeof === Symbol.for('react.memo');
  const Inner = isMemo ? shipped.type : shipped;
  const Counted = (props) => {
    glyph.renders += 1;
    return createElement(Inner, props);
  };

  return { DesktopGlyph: isMemo ? memo(Counted, shipped.compare ?? undefined) : Counted };
});

const MOVES = 12;
const START = { x: 16, y: 16 };
const GRAB_AT = 20;

describe('dragging a desktop shortcut', () => {
  beforeEach(() => {
    glyph.renders = 0;
    window.localStorage.clear();
    // The drag handlers are desktop-only, and the shared setup answers every
    // media query with matches: false.
    window.matchMedia = (query) => ({
      matches: true,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    });
  });

  function grab() {
    render(
      <WindowStackContext.Provider value={{ bringToFront: vi.fn() }}>
        <DesktopIcon kind="about" label="about.txt" target="about" defaultPos={START} />
      </WindowStackContext.Provider>,
    );
    const button = screen.getByRole('button', { name: 'about.txt' });
    // jsdom implements neither, and DesktopIcon calls both around a drag.
    button.setPointerCapture = () => {};
    button.releasePointerCapture = () => {};
    return button;
  }

  it(`renders the glyph once across ${MOVES} pointermoves`, () => {
    const button = grab();

    fireEvent.pointerDown(button, {
      button: 0,
      pointerId: 1,
      clientX: GRAB_AT,
      clientY: GRAB_AT,
    });
    for (let i = 1; i <= MOVES; i += 1) {
      fireEvent.pointerMove(button, {
        pointerId: 1,
        clientX: GRAB_AT + i,
        clientY: GRAB_AT + i,
      });
    }
    // Captured BEFORE the release: pointerup saves the position itself, so
    // reading style after it would pass even if no pointermove ever rendered.
    const midLeft = button.style.left;
    const midTop = button.style.top;
    fireEvent.pointerUp(button, { pointerId: 1 });

    // First: the moves actually reached setPos. A drag that never happened
    // renders the glyph once as well, and would pass the assertion below
    // without proving anything.
    const travelled = GRAB_AT + MOVES - (GRAB_AT - START.x);
    expect(midLeft, 'the icon never moved mid-drag, so nothing was measured').toBe(
      `${travelled}px`,
    );
    expect(midTop, 'the icon never moved mid-drag, so nothing was measured').toBe(
      `${travelled}px`,
    );

    expect(
      glyph.renders,
      'setPos on every pointermove reached the glyph — memo is being defeated by a ' +
        'non-primitive prop from DesktopIcon',
    ).toBe(1);
  });
});
