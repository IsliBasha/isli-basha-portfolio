// SMS-style character counter for the Nokia Messages composer. Kept in its own
// module (not inside Messages.jsx) so the screen file exports only its
// component and React Fast Refresh keeps working.
export const SINGLE_SMS = 160;

export function counterLabel(len) {
  if (len <= SINGLE_SMS) return `${len}/${SINGLE_SMS}`;
  return `${Math.ceil(len / SINGLE_SMS)} msg`;
}
