export function AppGlyph({ kind, size = 32 }) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 32 32',
    shapeRendering: 'crispEdges',
    'aria-hidden': true,
    style: { display: 'block' },
  };

  if (kind === 'about') {
    return (
      <svg {...props}>
        <rect x="6" y="4" width="20" height="24" fill="#ffffff" stroke="#000000" />
        <rect x="8" y="7" width="16" height="1" fill="#808080" />
        <rect x="8" y="10" width="16" height="1" fill="#808080" />
        <rect x="8" y="13" width="10" height="1" fill="#808080" />
        <rect x="8" y="17" width="14" height="1" fill="#808080" />
        <rect x="8" y="20" width="12" height="1" fill="#808080" />
        <rect x="8" y="23" width="14" height="1" fill="#808080" />
      </svg>
    );
  }
  if (kind === 'projects') {
    return (
      <svg {...props}>
        <rect x="2" y="8" width="28" height="20" fill="#f4c430" stroke="#000000" />
        <rect x="2" y="5" width="13" height="4" fill="#f4c430" stroke="#000000" />
        <rect x="4" y="10" width="24" height="1" fill="#a8861e" />
      </svg>
    );
  }
  if (kind === 'stack') {
    return (
      <svg {...props}>
        <rect x="2" y="4" width="28" height="22" fill="#0c0c0c" stroke="#000000" />
        <rect x="2" y="4" width="28" height="3" fill="#c0c0c0" />
        <rect x="4" y="5" width="1" height="1" fill="#1a1a2e" />
        <rect x="6" y="5" width="1" height="1" fill="#1a1a2e" />
        <rect x="8" y="5" width="1" height="1" fill="#1a1a2e" />
        <text x="5" y="16" fontFamily="monospace" fontSize="7" fill="#33ff33">C:\</text>
        <text x="5" y="23" fontFamily="monospace" fontSize="7" fill="#33ff33">&gt;_</text>
      </svg>
    );
  }
  if (kind === 'contact') {
    return (
      <svg {...props}>
        <rect x="3" y="8" width="26" height="18" fill="#ffffff" stroke="#000000" />
        <polyline points="3,8 16,20 29,8" fill="none" stroke="#000000" strokeWidth="1" />
      </svg>
    );
  }
  if (kind === 'resume') {
    return (
      <svg {...props}>
        <rect x="6" y="4" width="20" height="24" fill="#ffffff" stroke="#000000" />
        <rect x="20" y="4" width="6" height="6" fill="#dfdfdf" stroke="#000000" />
        <rect x="9" y="14" width="14" height="1" fill="#cc1616" />
        <rect x="9" y="17" width="14" height="1" fill="#808080" />
        <rect x="9" y="20" width="10" height="1" fill="#808080" />
        <rect x="9" y="23" width="12" height="1" fill="#808080" />
      </svg>
    );
  }
  if (kind === 'minesweeper') {
    return (
      <svg {...props}>
        <rect x="2" y="2" width="28" height="28" fill="#c0c0c0" stroke="#000000" />
        <rect x="4" y="4" width="24" height="24" fill="#808080" />
        <rect x="5" y="5" width="22" height="22" fill="#c0c0c0" />
        <rect x="10" y="10" width="12" height="12" fill="#000000" />
        <rect x="12" y="12" width="8" height="8" fill="#ff0000" />
        <rect x="14" y="8" width="4" height="2" fill="#000000" />
        <rect x="22" y="14" width="2" height="4" fill="#000000" />
        <rect x="14" y="22" width="4" height="2" fill="#000000" />
        <rect x="8" y="14" width="2" height="4" fill="#000000" />
      </svg>
    );
  }
  if (kind === 'stats') {
    return (
      <svg {...props}>
        <rect x="2" y="4" width="28" height="24" fill="#c0c0c0" stroke="#000000" />
        <rect x="5" y="19" width="4" height="7" fill="#000080" />
        <rect x="11" y="13" width="4" height="13" fill="#000080" />
        <rect x="17" y="9" width="4" height="17" fill="#000080" />
        <rect x="23" y="16" width="4" height="10" fill="#000080" />
        <rect x="4" y="26" width="25" height="1" fill="#808080" />
      </svg>
    );
  }
  if (kind === 'snake') {
    return (
      <svg {...props}>
        <rect x="2" y="2" width="28" height="28" fill="#000000" stroke="#333333" />
        <rect x="6" y="20" width="4" height="4" fill="#33ff33" />
        <rect x="10" y="20" width="4" height="4" fill="#33ff33" />
        <rect x="14" y="20" width="4" height="4" fill="#33ff33" />
        <rect x="14" y="16" width="4" height="4" fill="#33ff33" />
        <rect x="14" y="12" width="4" height="4" fill="#33ff33" />
        <rect x="18" y="12" width="4" height="4" fill="#33ff33" />
        <rect x="22" y="8" width="4" height="4" fill="#ff3333" />
      </svg>
    );
  }
  if (kind === 'mywork') {
    return (
      <svg {...props}>
        <rect x="2" y="8" width="28" height="20" fill="#f4c430" stroke="#000000" />
        <rect x="2" y="5" width="13" height="4" fill="#f4c430" stroke="#000000" />
        <rect x="4" y="10" width="24" height="1" fill="#a8861e" />
        <rect x="10" y="14" width="12" height="9" fill="#c0c0c0" stroke="#000000" />
        <rect x="13" y="12" width="6" height="3" fill="none" stroke="#000000" />
        <rect x="10" y="19" width="12" height="1" fill="#808080" />
        <rect x="15" y="14" width="2" height="9" fill="#808080" />
      </svg>
    );
  }
  return null;
}
