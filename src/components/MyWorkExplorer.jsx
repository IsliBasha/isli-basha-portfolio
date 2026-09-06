import { useState } from 'react';
import { projects as PROJECTS } from '../data/projects.js';
import { ALL_OPEN_ICON } from '../lib/pixelIcons/categories.js';
import { CATEGORIES } from './myWorkCategories.js';
import { PixelIcon } from './PixelIcon.jsx';

// A tile is a 32px icon over up to three lines of 0.65rem label — 91px at its
// tallest — and the grid pads 8px above and below it. The body row is floored
// there so the fixed 140px detail pane cannot take the last of the height on a
// window dragged to its 220x140 minimum and leave a file list with no files in
// it; .win-mywork__content scrolls to reach the rest.
const TILE_ROW_FLOOR_PX = 107;

/**
 * Where a project's link goes, taken from the label the data already carries.
 * The trailing arrow in that label is a desktop affordance and nothing else —
 * the Nokia build writes its own "Visit" soft key — so it is stripped here and
 * "GitHub →" reads "GitHub" on a chrome button. The word matters: "Open" on
 * its own gave no clue whether the tile led to a repository, a live site or a
 * company page, which is exactly what the pill it replaced used to say.
 */
function openLabel(label) {
  return label.replace(/\s*→\s*$/u, '');
}

const chrome = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    fontFamily: 'var(--font-mono, "IBM Plex Mono", monospace)',
    fontSize: '0.75rem',
    background: 'var(--chrome, #c0c0c0)',
    userSelect: 'none',
  },
  menubar: {
    display: 'flex',
    gap: '2px',
    padding: '2px 4px',
    borderBottom: '1px solid #808080',
  },
  menuBtn: {
    padding: '1px 8px',
    background: 'transparent',
    border: 'none',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    cursor: 'default',
    color: 'inherit',
  },
  body: {
    display: 'grid',
    gridTemplateColumns: '140px 1fr',
    flex: 1,
    minHeight: `${TILE_ROW_FLOOR_PX}px`,
    overflow: 'hidden',
  },
  sidebar: {
    borderRight: '2px solid #808080',
    display: 'flex',
    flexDirection: 'column',
    // A grid item defaults to min-height: auto, which would let the category
    // list set the height of the whole body row instead of scrolling in it.
    minHeight: 0,
    overflowY: 'auto',
  },
  sidebarHeading: {
    padding: '2px 8px 4px',
    fontSize: '0.62rem',
    color: '#404040',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    borderBottom: '1px solid #808080',
    marginBottom: '2px',
  },
  detail: {
    display: 'grid',
    gridTemplateColumns: '160px 1fr',
    borderTop: '2px solid #808080',
    minHeight: '140px',
    maxHeight: '140px',
  },
  preview: {
    borderRight: '1px solid #808080',
    overflow: 'hidden',
    background: '#ececec',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    padding: '8px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    overflow: 'hidden',
  },
  detailName: {
    fontWeight: 700,
    fontSize: '0.8rem',
    borderBottom: '1px solid #808080',
    paddingBottom: '4px',
  },
  detailDesc: {
    fontFamily: 'var(--font-sans, "IBM Plex Sans", system-ui, sans-serif)',
    fontSize: '0.72rem',
    lineHeight: 1.4,
    color: '#1a1a2e',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
  },
  detailMeta: { fontSize: '0.65rem', color: '#404040' },
  tags: { display: 'flex', flexWrap: 'wrap', gap: '3px' },
  tag: {
    background: '#c0c0c0',
    borderTop: '1px solid #dfdfdf',
    borderLeft: '1px solid #dfdfdf',
    borderRight: '1px solid #404040',
    borderBottom: '1px solid #404040',
    padding: '1px 5px',
    fontSize: '0.62rem',
  },
  actions: { display: 'flex', gap: '4px', marginTop: 'auto', paddingTop: '4px' },
  privatePill: {
    padding: '2px 10px',
    background: '#c0c0c0',
    borderTop: '2px solid #404040',
    borderLeft: '2px solid #404040',
    borderRight: '2px solid #dfdfdf',
    borderBottom: '2px solid #dfdfdf',
    fontFamily: 'inherit',
    fontSize: '0.68rem',
    color: '#404040',
    lineHeight: 1.4,
    display: 'inline-block',
  },
  addressBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '3px 6px',
    borderBottom: '1px solid #808080',
    background: '#c0c0c0',
  },
  searchInput: {
    flex: 1,
    fontFamily: 'inherit',
    fontSize: 'inherit',
    background: '#ffffff',
    borderTop: '1px solid #808080',
    borderLeft: '1px solid #808080',
    borderBottom: '1px solid #dfdfdf',
    borderRight: '1px solid #dfdfdf',
    padding: '1px 4px',
    outline: 'none',
    color: '#1a1a2e',
  },
  clearBtn: {
    padding: '0 6px',
    background: '#c0c0c0',
    borderTop: '1px solid #dfdfdf',
    borderLeft: '1px solid #dfdfdf',
    borderRight: '1px solid #808080',
    borderBottom: '1px solid #808080',
    fontFamily: 'inherit',
    fontSize: '0.65rem',
    cursor: 'pointer',
    lineHeight: 1.6,
    color: '#1a1a2e',
  },
};

export function MyWorkExplorer() {
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(PROJECTS[0]);
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const visible = q
    ? PROJECTS.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.stack.some(t => t.toLowerCase().includes(q))
      )
    : filter === 'all' ? PROJECTS : PROJECTS.filter(p => p.category === filter);

  const effectiveSelected = visible.find(p => p.id === selected?.id) ?? visible[0] ?? null;

  function handleFilter(cat) {
    setFilter(cat);
    setQuery('');
    const next = cat === 'all' ? PROJECTS[0] : PROJECTS.find(p => p.category === cat);
    if (next) setSelected(next);
  }

  return (
    <div style={chrome.root}>
      <div style={chrome.menubar} role="menubar">
        {['File', 'View', 'Help'].map(item => (
          <button key={item} style={chrome.menuBtn} type="button" role="menuitem">{item}</button>
        ))}
      </div>

      <div style={chrome.addressBar}>
        <span style={{ fontSize: '0.65rem', color: '#404040', whiteSpace: 'nowrap' }}>Search:</span>
        <input
          type="text"
          style={chrome.searchInput}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="project name or tech…"
          aria-label="Search projects by name or technology"
          data-start-find-target=""
        />
        {query && (
          <button type="button" style={chrome.clearBtn} onClick={() => setQuery('')}>✕</button>
        )}
      </div>

      <div style={chrome.body}>
        <div style={chrome.sidebar}>
          <div style={chrome.sidebarHeading}>Categories</div>
          {CATEGORIES.map(cat => {
            const isSelected = !q && filter === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                className="explorer-folder-item"
                data-selected={isSelected ? 'true' : 'false'}
                aria-current={isSelected ? 'true' : undefined}
                onClick={() => handleFilter(cat.id)}
              >
                <PixelIcon
                  className="explorer-folder-icon"
                  id={isSelected && cat.id === 'all' ? ALL_OPEN_ICON : cat.icon}
                  size={16}
                />
                <span className="explorer-folder-item__label">{cat.label}</span>
              </button>
            );
          })}
        </div>

        <div className="explorer-tile-grid">
          {visible.map(p => {
            const isSelected = effectiveSelected?.id === p.id;
            return (
              <button
                key={p.id}
                type="button"
                className="explorer-tile"
                data-selected={isSelected ? 'true' : 'false'}
                aria-current={isSelected ? 'true' : undefined}
                onClick={() => setSelected(p)}
              >
                <PixelIcon className="explorer-tile-icon" id={p.icon} size={32} />
                <span className="explorer-tile__label">{p.name}</span>
              </button>
            );
          })}
          {visible.length === 0 && (
            <div style={{ padding: '12px', fontSize: '0.7rem', color: '#808080', gridColumn: '1 / -1' }}>
              No results for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
      </div>

      {effectiveSelected && (
        <div style={chrome.detail}>
          <div style={chrome.preview}>
            {effectiveSelected.preview
              ? <img src={effectiveSelected.preview} alt={effectiveSelected.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              : <span style={{ fontSize: '0.62rem', color: '#808080', textAlign: 'center', padding: '12px' }}>No preview</span>
            }
          </div>
          <div style={chrome.info}>
            <div style={chrome.detailName}>{effectiveSelected.name}</div>
            <div style={chrome.detailDesc}>{effectiveSelected.description}</div>
            <div style={chrome.detailMeta}><strong>Type:</strong> {effectiveSelected.type}</div>
            <div style={chrome.tags}>
              {effectiveSelected.stack.map(t => <span key={t} style={chrome.tag}>{t}</span>)}
            </div>
            <div style={chrome.actions}>
              {effectiveSelected.link ? (
                <a
                  className="win-btn explorer-open-btn"
                  href={effectiveSelected.link.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={`${openLabel(effectiveSelected.link.label)} — ${effectiveSelected.name}`}
                >
                  {openLabel(effectiveSelected.link.label)}
                </a>
              ) : (
                <span style={chrome.privatePill}>{effectiveSelected.privateNote}</span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="explorer-statusbar">
        <span className="explorer-statusbar__panel">
          {q
            ? `${visible.length} object${visible.length !== 1 ? 's' : ''} matching '${query.trim()}'`
            : `${visible.length} object${visible.length !== 1 ? 's' : ''}`
          }
        </span>
        {/* Empty rather than absent when nothing is selected: Win95's status
            bar kept its panels and blanked the text, so the first panel does
            not jump wider the moment a selection clears. */}
        <span className="explorer-statusbar__panel">
          {effectiveSelected ? '1 object selected' : ''}
        </span>
      </div>
    </div>
  );
}
