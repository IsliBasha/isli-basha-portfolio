function PushPin() {
  return (
    <svg
      className="sticky-note__pin"
      width="26"
      height="26"
      viewBox="0 0 26 26"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="sn-pin-grad" cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#ff7575" />
          <stop offset="50%" stopColor="#c0392b" />
          <stop offset="100%" stopColor="#7b241c" />
        </radialGradient>
      </defs>
      <circle cx="14" cy="14" r="11" fill="rgba(0,0,0,0.22)" />
      <circle cx="13" cy="13" r="11" fill="url(#sn-pin-grad)" />
      <ellipse
        cx="9"
        cy="8.5"
        rx="4.5"
        ry="2.8"
        fill="rgba(255,255,255,0.52)"
        transform="rotate(-22, 9, 8.5)"
      />
    </svg>
  );
}

export function StickyNote() {
  return (
    <>
      <PushPin />
      <aside
        className="sticky-note"
        aria-label="Isli Basha — Full-Stack Developer. Building fast, minimal, useful things."
      >
        <div className="sticky-note__name">Isli Basha</div>
        <div className="sticky-note__role">Full-Stack Developer</div>
        <div className="sticky-note__line">Building fast, minimal, useful things.</div>
      </aside>
    </>
  );
}
