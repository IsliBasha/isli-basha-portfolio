// Keys that only change what the NEXT keypress means, so a screen that
// dismisses on "any key" has to sit them out. Shared by the BSOD and the
// power-off screen: both were waking on the Shift someone held to type a
// capital, or on a Tab aimed at something else entirely.
export const MODIFIER_KEYS = new Set([
  'Control',
  'Shift',
  'Alt',
  'Meta',
  'CapsLock',
  'NumLock',
  'ScrollLock',
  'Tab',
  'OS',
  'Hyper',
  'Super',
]);
