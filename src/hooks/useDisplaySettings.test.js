import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import {
  useDisplaySettings,
  applyStoredWallpaper,
  applyWallpaper,
  readChimeMuted,
  readStoredSettings,
  writeChimeMuted,
  DEFAULT_SETTINGS,
  WALLPAPERS,
  WALLPAPER_COLOURS,
} from './useDisplaySettings.js';

const STORAGE_KEY = 'isli-display';
const CHIME_MUTED_KEY = 'isli-chime-muted';

// TODO(order-07): assert playBootChime() resolves false after
// writeChimeMuted(true). The mute is only half a feature until something
// reads it, and the reader is src/lib/bootChime.js, which order 04 owns and
// this branch must not touch — asserting it here would mean writing a fake
// reader and proving nothing about the real one.

const stored = () => JSON.parse(window.localStorage.getItem(STORAGE_KEY));
const wallpaperAttr = () => document.documentElement.dataset.wallpaper;

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.removeAttribute('data-wallpaper');
});

afterEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
  document.documentElement.removeAttribute('data-wallpaper');
});

describe('reading stored display settings', () => {
  it('falls back to the defaults when nothing has been saved', () => {
    expect(readStoredSettings()).toEqual({ wallpaper: 'clouds', chime: true });
  });

  it('returns the defaults rather than throwing on unparseable JSON', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    window.localStorage.setItem(STORAGE_KEY, '{"wallpaper": "teal"');

    expect(readStoredSettings()).toEqual(DEFAULT_SETTINGS);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('unparseable'));
  });

  it('rejects a wallpaper id that is not one of the four', () => {
    // localStorage is user-writable: an unknown id would reach
    // dataset.wallpaper, match no CSS rule, and leave the desktop blank.
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ wallpaper: 'nyan' }),
    );

    expect(readStoredSettings().wallpaper).toBe('clouds');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('nyan'));
  });

  it('says nothing when storage itself throws, and still answers', () => {
    // Nobody wrote anything wrong here — Safari's private mode and a blocked
    // third-party context both throw on access — so there is nothing to
    // report to a developer's console.
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('The operation is insecure.', 'SecurityError');
    });

    expect(readStoredSettings()).toEqual(DEFAULT_SETTINGS);
    expect(warn).not.toHaveBeenCalled();
  });

  it('tolerates the legacy chime field an older build wrote into the blob', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ wallpaper: 'teal', chime: false }),
    );

    // The blob is no longer where the chime lives, so its stale copy is
    // ignored rather than obeyed: the key is silent, so the chime plays.
    expect(readStoredSettings()).toEqual({ wallpaper: 'teal', chime: true });
  });

  it('drops the legacy chime field the first time anything is saved', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ wallpaper: 'teal', chime: false }),
    );
    const { result } = renderHook(() => useDisplaySettings());

    act(() => result.current.apply({ wallpaper: 'setup' }));

    expect(stored()).toEqual({ wallpaper: 'setup' });
  });
});

describe('the boot chime mute', () => {
  it('is off when the key is absent and on when it holds 1', () => {
    expect(readChimeMuted()).toBe(false);
    window.localStorage.setItem(CHIME_MUTED_KEY, '1');
    expect(readChimeMuted()).toBe(true);
  });

  it('unmutes by taking the key away, not by writing a second falsy spelling', () => {
    writeChimeMuted(true);
    expect(window.localStorage.getItem(CHIME_MUTED_KEY)).toBe('1');

    writeChimeMuted(false);
    expect(window.localStorage.getItem(CHIME_MUTED_KEY)).toBeNull();
  });

  it('reports failure rather than throwing when storage refuses', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });

    expect(writeChimeMuted(true)).toBe(false);
  });

  it('answers "plays" when storage refuses to be read at all', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('The operation is insecure.', 'SecurityError');
    });

    expect(readChimeMuted()).toBe(false);
    expect(readStoredSettings().chime).toBe(true);
  });
});

describe('applying a wallpaper to the document', () => {
  it('removes the attribute for clouds, which the stylesheet paints by default', () => {
    applyWallpaper('teal');
    expect(wallpaperAttr()).toBe('teal');
    applyWallpaper('clouds');
    expect(wallpaperAttr()).toBeUndefined();
  });

  it('refuses to put an id on <html> that no stylesheet rule matches', () => {
    applyWallpaper('teal');
    applyWallpaper('nyan');
    expect(wallpaperAttr()).toBeUndefined();
  });

  it('paints the stored wallpaper at start-up', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ wallpaper: 'clouds-16' }),
    );
    applyStoredWallpaper();
    expect(wallpaperAttr()).toBe('clouds-16');
  });

  it('leaves the document alone at start-up when nothing is stored', () => {
    applyStoredWallpaper();
    expect(wallpaperAttr()).toBeUndefined();
  });
});

describe('useDisplaySettings', () => {
  it('starts on the defaults and paints nothing', () => {
    const { result } = renderHook(() => useDisplaySettings());
    expect(result.current.settings).toEqual({ wallpaper: 'clouds', chime: true });
    expect(wallpaperAttr()).toBeUndefined();
  });

  it('restores what a previous session applied', () => {
    const { result, unmount } = renderHook(() => useDisplaySettings());
    act(() => result.current.apply({ wallpaper: 'setup' }));
    unmount();

    const second = renderHook(() => useDisplaySettings());
    expect(second.result.current.settings.wallpaper).toBe('setup');
    expect(wallpaperAttr()).toBe('setup');
  });

  it('previews on the desktop without writing anything to storage', () => {
    const { result } = renderHook(() => useDisplaySettings());
    act(() => result.current.preview({ wallpaper: 'teal' }));

    expect(result.current.settings.wallpaper).toBe('teal');
    expect(wallpaperAttr()).toBe('teal');
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('puts back the last saved wallpaper on revert', () => {
    const { result } = renderHook(() => useDisplaySettings());
    act(() => result.current.apply({ wallpaper: 'teal' }));
    act(() => result.current.preview({ wallpaper: 'setup' }));
    expect(wallpaperAttr()).toBe('setup');

    act(() => result.current.revert());

    expect(result.current.settings.wallpaper).toBe('teal');
    expect(wallpaperAttr()).toBe('teal');
    expect(stored().wallpaper).toBe('teal');
  });

  it('reverts all the way back to no attribute at all', () => {
    const { result } = renderHook(() => useDisplaySettings());
    act(() => result.current.preview({ wallpaper: 'clouds-16' }));
    expect(wallpaperAttr()).toBe('clouds-16');

    act(() => result.current.revert());
    expect(wallpaperAttr()).toBeUndefined();
  });

  it('takes the preview off the desktop when the sheet goes away', () => {
    // Window unmounts this tree on minimise as well as on the close box, and
    // neither of those runs Cancel. Without the unmount cleanup the desktop
    // keeps a wallpaper nothing has saved and nothing can now put back.
    const { result, unmount } = renderHook(() => useDisplaySettings());
    act(() => result.current.apply({ wallpaper: 'setup' }));
    act(() => result.current.preview({ wallpaper: 'teal' }));
    expect(wallpaperAttr()).toBe('teal');

    unmount();

    expect(wallpaperAttr()).toBe('setup');
  });

  it('takes an unsaved preview all the way back to the default on unmount', () => {
    const { result, unmount } = renderHook(() => useDisplaySettings());
    act(() => result.current.preview({ wallpaper: 'clouds-16' }));

    unmount();

    expect(wallpaperAttr()).toBeUndefined();
  });

  it('saves the current preview when apply is called with no argument', () => {
    const { result } = renderHook(() => useDisplaySettings());
    act(() => result.current.preview({ wallpaper: 'setup' }));
    act(() => result.current.apply());

    expect(stored()).toEqual({ wallpaper: 'setup' });
  });

  it('saves the chime to its own key and nowhere else', () => {
    const { result } = renderHook(() => useDisplaySettings());

    act(() => result.current.apply({ chime: false }));
    expect(window.localStorage.getItem(CHIME_MUTED_KEY)).toBe('1');
    expect(stored()).toEqual({ wallpaper: 'clouds' });

    act(() => result.current.apply({ chime: true }));
    // Absent, not '0': a reader that only tests for the key must be right.
    expect(window.localStorage.getItem(CHIME_MUTED_KEY)).toBeNull();
  });

  it('reads the mute key rather than a copy taken when the sheet opened', () => {
    const { result } = renderHook(() => useDisplaySettings());
    expect(result.current.settings.chime).toBe(true);

    // The taskbar tray, muting while this sheet is open.
    act(() => {
      window.localStorage.setItem(CHIME_MUTED_KEY, '1');
      result.current.preview({ wallpaper: 'teal' });
    });

    expect(result.current.settings.chime).toBe(false);
  });

  it('leaves a mute set elsewhere alone when only the wallpaper is saved', () => {
    // MUTATION CHECK: make apply() write the chime unconditionally --
    //   if (nextChime !== null) writeChimeMuted(!nextChime)
    //     -> writeChimeMuted(!(nextChime ?? DEFAULT_SETTINGS.chime))
    // which is what the mirrored-into-the-blob version did -- and this fails:
    // the key is taken away and the tray's mute is silently lost.
    const { result } = renderHook(() => useDisplaySettings());
    window.localStorage.setItem(CHIME_MUTED_KEY, '1');

    act(() => result.current.apply({ wallpaper: 'teal' }));

    expect(window.localStorage.getItem(CHIME_MUTED_KEY)).toBe('1');
    expect(stored()).toEqual({ wallpaper: 'teal' });
  });

  it('does not mute while the checkbox is only being previewed', () => {
    const { result } = renderHook(() => useDisplaySettings());
    act(() => result.current.preview({ chime: false }));

    expect(result.current.settings.chime).toBe(false);
    expect(window.localStorage.getItem(CHIME_MUTED_KEY)).toBeNull();
  });

  it('throws the previewed chime away on revert', () => {
    const { result } = renderHook(() => useDisplaySettings());
    act(() => result.current.preview({ chime: false }));

    act(() => result.current.revert());

    expect(result.current.settings.chime).toBe(true);
  });

  it('keeps working, and says so, when storage refuses the write', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });
    const { result } = renderHook(() => useDisplaySettings());

    let saved;
    expect(() =>
      act(() => {
        saved = result.current.apply({ wallpaper: 'teal' });
      }),
    ).not.toThrow();

    expect(saved).toBe(false);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('will not survive a reload'));
    // The choice still applies to this session; it just will not survive a reload.
    expect(result.current.settings.wallpaper).toBe('teal');
    expect(wallpaperAttr()).toBe('teal');
  });

  it('offers exactly the four wallpapers the stylesheet has rules for', () => {
    expect(WALLPAPERS).toEqual(['clouds', 'clouds-16', 'teal', 'setup']);
  });

  it('publishes the flat wallpaper colours for the preview to paint with', () => {
    expect(WALLPAPER_COLOURS).toEqual({
      teal: '#008080',
      setupTop: '#0000a8',
      setupBottom: '#000050',
    });
  });
});
