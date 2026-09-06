import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  CHIME_MUTE_KEY,
  isChimeMuted,
  setChimeMuted,
  subscribeChimeMuted,
  playBootChime,
} from './bootChime.js';

// Enough of the Web Audio surface for playBootChime to schedule its four
// notes. jsdom ships none of it, so without this the chime bails at
// nowOrNull() and a muted run would look identical to an audible one.
function stubAudioContext() {
  const gainNode = () => ({
    gain: {
      value: 0,
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
    connect: (target) => target,
  });
  const ctor = vi.fn(function FakeAudioContext() {
    this.state = 'running';
    this.currentTime = 0;
    this.destination = {};
    this.createGain = gainNode;
    this.createOscillator = () => ({
      type: '',
      frequency: { value: 0 },
      connect: (target) => target,
      start: vi.fn(),
      stop: vi.fn(),
    });
    this.close = vi.fn();
  });
  window.AudioContext = ctor;
  return ctor;
}

beforeEach(() => {
  window.localStorage.removeItem(CHIME_MUTE_KEY);
  // The module keeps a session copy of the preference when a write is
  // refused. A successful write clears it, so this also resets whatever a
  // storage-failure test left behind.
  setChimeMuted(false);
});

afterEach(() => {
  delete window.AudioContext;
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('boot chime mute preference', () => {
  it('treats an absent key as audible, so a first visit gets the chime', () => {
    expect(isChimeMuted()).toBe(false);
  });

  it('round-trips through localStorage', () => {
    setChimeMuted(true);
    expect(window.localStorage.getItem(CHIME_MUTE_KEY)).toBe('1');
    expect(isChimeMuted()).toBe(true);

    setChimeMuted(false);
    expect(window.localStorage.getItem(CHIME_MUTE_KEY)).toBeNull();
    expect(isChimeMuted()).toBe(false);
  });

  it('reads any other stored value as not muted', () => {
    window.localStorage.setItem(CHIME_MUTE_KEY, 'yes');
    expect(isChimeMuted()).toBe(false);
  });

  it('reports "not muted" rather than throwing when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage disabled');
    });
    expect(() => isChimeMuted()).not.toThrow();
    expect(isChimeMuted()).toBe(false);
  });

  it('keeps working when storage refuses the write', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });
    expect(() => setChimeMuted(true)).not.toThrow();
  });

  it('reports the choice back for this session when the write was refused', () => {
    const onChange = vi.fn();
    const unsubscribe = subscribeChimeMuted(onChange);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });

    setChimeMuted(true);
    unsubscribe();

    // Nothing reached storage, but the tray re-reads through this function --
    // answering with the stale stored value would leave the speaker showing
    // "on" after a click that switched it off.
    expect(window.localStorage.getItem(CHIME_MUTE_KEY)).toBeNull();
    expect(isChimeMuted()).toBe(true);
    expect(onChange).toHaveBeenCalledTimes(1);

    // Unmuting removes the key, which storage still allows, so the session
    // copy is dropped rather than left pinned at muted.
    setChimeMuted(false);
    expect(isChimeMuted()).toBe(false);
  });

  it('keeps the session copy even when reading storage throws too', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });
    setChimeMuted(true);

    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage disabled');
    });
    expect(isChimeMuted()).toBe(true);
  });
});

describe('playBootChime', () => {
  it('never opens an audio context while the tray says muted', async () => {
    vi.useFakeTimers();
    const ctor = stubAudioContext();
    setChimeMuted(true);

    await expect(playBootChime()).resolves.toBe(false);
    expect(ctor).not.toHaveBeenCalled();
  });

  it('plays when the tray says audible', async () => {
    vi.useFakeTimers();
    const ctor = stubAudioContext();

    await expect(playBootChime()).resolves.toBe(true);
    expect(ctor).toHaveBeenCalledTimes(1);
  });
});

describe('watching the mute preference', () => {
  it('tells a subscriber every time the preference is written', () => {
    const onChange = vi.fn();
    const unsubscribe = subscribeChimeMuted(onChange);

    setChimeMuted(true);
    expect(onChange).toHaveBeenCalledTimes(1);
    setChimeMuted(false);
    expect(onChange).toHaveBeenCalledTimes(2);

    unsubscribe();
  });

  it('tells a subscriber even when storage refused the write', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });
    const onChange = vi.fn();
    const unsubscribe = subscribeChimeMuted(onChange);

    setChimeMuted(true);

    // The preference is lost for the next visit, but the speaker the visitor
    // just clicked still has to change; a silent no-op looks like a dead
    // button.
    expect(onChange).toHaveBeenCalledTimes(1);
    unsubscribe();
    setItem.mockRestore();
  });

  it('stops telling it once unsubscribed', () => {
    const onChange = vi.fn();
    subscribeChimeMuted(onChange)();

    setChimeMuted(true);

    expect(onChange).not.toHaveBeenCalled();
  });

  it('picks up the key changing in another tab', () => {
    const onChange = vi.fn();
    const unsubscribe = subscribeChimeMuted(onChange);

    window.dispatchEvent(
      new StorageEvent('storage', { key: CHIME_MUTE_KEY, newValue: '1' }),
    );
    expect(onChange).toHaveBeenCalledTimes(1);

    // The whole area being cleared reports a null key, and that clears this
    // preference too.
    window.dispatchEvent(new StorageEvent('storage', { key: null }));
    expect(onChange).toHaveBeenCalledTimes(2);

    window.dispatchEvent(
      new StorageEvent('storage', { key: 'win95:positions:v1', newValue: '{}' }),
    );
    expect(onChange).toHaveBeenCalledTimes(2);

    unsubscribe();
  });

  it('leaves no window listener behind once nobody is watching', () => {
    const added = vi.spyOn(window, 'addEventListener');
    const removed = vi.spyOn(window, 'removeEventListener');

    const first = subscribeChimeMuted(vi.fn());
    const second = subscribeChimeMuted(vi.fn());
    expect(added.mock.calls.filter(([type]) => type === 'storage')).toHaveLength(1);

    first();
    expect(removed.mock.calls.filter(([type]) => type === 'storage')).toHaveLength(0);
    second();
    expect(removed.mock.calls.filter(([type]) => type === 'storage')).toHaveLength(1);

    added.mockRestore();
    removed.mockRestore();
  });
});
