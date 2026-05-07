function AndroidIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="9" y="2" width="14" height="28" fill="#c0c0c0" stroke="#404040" strokeWidth="1"/>
      <rect x="13" y="3.5" width="6" height="1.5" fill="#808080"/>
      <rect x="11" y="6" width="10" height="16" fill="#0a3a1a"/>
      <line x1="16" y1="21" x2="16" y2="15" stroke="#44cc44" strokeWidth="1.5"/>
      <path d="M16 15 Q11 12 12 9 Q16 12 16 15Z" fill="#33bb33"/>
      <path d="M16 15 Q21 12 20 9 Q16 12 16 15Z" fill="#22aa22"/>
      <rect x="13.5" y="24" width="5" height="4" fill="#a0a0a0" stroke="#606060" strokeWidth="0.5"/>
    </svg>
  );
}

function PythonIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M4 4H9M4 4V9" stroke="#33ff33" strokeWidth="1.5" strokeLinecap="square"/>
      <path d="M28 4H23M28 4V9" stroke="#33ff33" strokeWidth="1.5" strokeLinecap="square"/>
      <path d="M4 28H9M4 28V23" stroke="#33ff33" strokeWidth="1.5" strokeLinecap="square"/>
      <path d="M28 28H23M28 28V23" stroke="#33ff33" strokeWidth="1.5" strokeLinecap="square"/>
      <circle cx="16" cy="18" r="9" fill="#d4a574" stroke="#7a5a34" strokeWidth="1"/>
      <circle cx="9" cy="11" r="3" fill="#d4a574" stroke="#7a5a34" strokeWidth="1"/>
      <circle cx="23" cy="11" r="3" fill="#d4a574" stroke="#7a5a34" strokeWidth="1"/>
      <circle cx="9" cy="11" r="1.5" fill="#e8a0a0"/>
      <circle cx="23" cy="11" r="1.5" fill="#e8a0a0"/>
      <circle cx="13" cy="17" r="2" fill="#1a1a1a"/>
      <circle cx="19" cy="17" r="2" fill="#1a1a1a"/>
      <circle cx="13.8" cy="16.2" r="0.6" fill="#ffffff"/>
      <circle cx="19.8" cy="16.2" r="0.6" fill="#ffffff"/>
      <ellipse cx="16" cy="20" rx="1.5" ry="1" fill="#cc7799"/>
      <circle cx="11" cy="20" r="2.5" fill="#e8a0a0" opacity="0.4"/>
      <circle cx="21" cy="20" r="2.5" fill="#e8a0a0" opacity="0.4"/>
      <path d="M13.5 22 Q16 24 18.5 22" stroke="#7a5a34" strokeWidth="1" fill="none"/>
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <polygon points="3,4 29,4 29,22 17,22 11,29 11,22 3,22" fill="#dfdfdf"/>
      <polyline points="3,22 3,4 29,4" stroke="#ffffff" strokeWidth="1" fill="none" strokeLinecap="square"/>
      <polyline points="29,4 29,22 17,22" stroke="#808080" strokeWidth="1" fill="none" strokeLinecap="square"/>
      <path d="M7 11L11 14L7 17" stroke="#000080" strokeWidth="1.5" fill="none" strokeLinecap="square"/>
      <line x1="15" y1="10" x2="17" y2="18" stroke="#000080" strokeWidth="1.5" strokeLinecap="square"/>
      <path d="M25 11L21 14L25 17" stroke="#000080" strokeWidth="1.5" fill="none" strokeLinecap="square"/>
    </svg>
  );
}

function NetworkIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      {/* city skyline */}
      <rect x="2" y="18" width="5" height="12" fill="#808080" stroke="#404040" strokeWidth="1"/>
      <rect x="4" y="14" width="3" height="5" fill="#c0c0c0" stroke="#404040" strokeWidth="1"/>
      <rect x="11" y="16" width="6" height="14" fill="#808080" stroke="#404040" strokeWidth="1"/>
      <rect x="22" y="20" width="8" height="10" fill="#808080" stroke="#404040" strokeWidth="1"/>
      {/* windows */}
      <rect x="3" y="19" width="1" height="1" fill="#ffff44"/>
      <rect x="5" y="19" width="1" height="1" fill="#ffff44"/>
      <rect x="13" y="17" width="1" height="1" fill="#ffff44"/>
      <rect x="15" y="17" width="1" height="1" fill="#ffff44"/>
      <rect x="24" y="21" width="1" height="1" fill="#ffff44"/>
      <rect x="26" y="21" width="1" height="1" fill="#ffff44"/>
      {/* radar rings */}
      <circle cx="23" cy="8" r="7" fill="none" stroke="#33ff33" strokeWidth="1" opacity="0.6"/>
      <circle cx="23" cy="8" r="4" fill="none" stroke="#33ff33" strokeWidth="1" opacity="0.4"/>
      <circle cx="23" cy="8" r="1.5" fill="#33ff33"/>
      {/* sweep line (threat detection) */}
      <line x1="23" y1="8" x2="27" y2="3" stroke="#ff3333" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

const ICONS = { android: AndroidIcon, python: PythonIcon, chat: ChatIcon, network: NetworkIcon };

export function ProjectIcon({ type }) {
  const Icon = ICONS[type] ?? ICONS.chat;
  return (
    <span className="project-card__icon">
      <Icon />
    </span>
  );
}
