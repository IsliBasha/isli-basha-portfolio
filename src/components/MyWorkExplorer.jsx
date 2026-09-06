import { useState } from 'react';
import { projects as PROJECTS } from '../data/projects.js';
import { ALL_OPEN_ICON } from '../lib/pixelIcons/categories.js';
import { CATEGORIES } from './myWorkCategories.js';
import { PixelIcon } from './PixelIcon.jsx';

function folderItemStyle(active) {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '3px 8px',
    cursor: 'default',
    background: active ? '#000080' : 'transparent',
    color: active ? '#ffffff' : 'inherit',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    fontFamily: 'inherit',
    fontSize: 'inherit',
  };
}

function tileStyle(selected) {
  return {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 4px',
    cursor: 'default',
    border: '1px solid transparent',
    background: selected ? '#000080' : 'transparent',
    fontFamily: 'inherit',
  };
}

function tileLabelStyle(selected) {
  return {
    fontSize: '0.65rem',
    textAlign: 'center',
    color: selected ? '#ffffff' : '#1a1a2e',
    lineHeight: 1.3,
    maxWidth: '100px',
    wordBreak: 'break-word',
  };
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
    minHeight: 0,
    overflow: 'hidden',
  },
  sidebar: {
    borderRight: '2px solid #808080',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
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
  grid: {
    background: '#fdfdfd',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    alignContent: 'start',
    gap: '2px',
    padding: '8px',
    overflowY: 'auto',
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
  btn: {
    padding: '2px 10px',
    background: '#c0c0c0',
    borderTop: '2px solid #dfdfdf',
    borderLeft: '2px solid #dfdfdf',
    borderRight: '2px solid #404040',
    borderBottom: '2px solid #404040',
    fontFamily: 'inherit',
    fontSize: '0.68rem',
    cursor: 'pointer',
    color: '#1a1a2e',
    textDecoration: 'none',
    display: 'inline-block',
    lineHeight: 1.4,
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
  statusbar: {
    borderTop: '1px solid #808080',
    padding: '2px 8px',
    fontSize: '0.65rem',
    color: '#404040',
    display: 'flex',
    gap: '12px',
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
                style={folderItemStyle(isSelected)}
                onClick={() => handleFilter(cat.id)}
              >
                <PixelIcon
                  className="explorer-folder-icon"
                  id={isSelected && cat.id === 'all' ? ALL_OPEN_ICON : cat.icon}
                  size={16}
                />
                {cat.label}
              </button>
            );
          })}
        </div>

        <div style={chrome.grid}>
          {visible.map(p => (
            <button
              key={p.id}
              type="button"
              style={tileStyle(effectiveSelected?.id === p.id)}
              onClick={() => setSelected(p)}
            >
              <PixelIcon className="explorer-tile-icon" id={p.icon} size={32} />
              <span style={tileLabelStyle(effectiveSelected?.id === p.id)}>{p.name}</span>
            </button>
          ))}
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
                  href={effectiveSelected.link.href}
                  target="_blank"
                  rel="noopener"
                  style={{
                    ...chrome.btn,
                    background: effectiveSelected.link.label.startsWith('GitHub') ? '#1a1a2e' : '#1a73e8',
                    color: '#fff',
                    borderColor: effectiveSelected.link.label.startsWith('GitHub') ? '#000' : '#0d47a1',
                  }}
                >
                  {effectiveSelected.link.label}
                </a>
              ) : (
                <span style={chrome.privatePill}>{effectiveSelected.privateNote}</span>
              )}
            </div>
          </div>
        </div>
      )}

      <div style={chrome.statusbar}>
        <span>
          {q
            ? `${visible.length} object${visible.length !== 1 ? 's' : ''} matching '${query.trim()}'`
            : `${visible.length} object${visible.length !== 1 ? 's' : ''}`
          }
        </span>
        {effectiveSelected && <span>1 object selected</span>}
      </div>
    </div>
  );
}
