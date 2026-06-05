import { useState } from 'react';

const PROJECTS = [
  {
    id: 'stani',
    name: 'Stani i Hoxhës',
    category: 'web',
    type: 'Web · Client',
    desc: 'Mountain lodge in Kukës, Albania. Bilingual (SQ/EN), animated hero, gallery, and reservation contact form.',
    stack: ['Astro', 'CSS', 'i18n'],
    link: 'https://stani-hoxhes-website.pages.dev/',
    icon: '🌐',
    screenshot: '/stani-screenshot.jpeg',
  },
  {
    id: 'warehouse',
    name: 'warehouse-inventory',
    category: 'app',
    type: 'App · Mobile',
    desc: 'Mobile-first inventory management app. Tracks stock levels, movements, and locations.',
    stack: ['Ionic', 'Angular', 'Capacitor'],
    link: '',
    icon: '📦',
    screenshot: null,
  },
  {
    id: 'ionic',
    name: 'ionic-project-work-1',
    category: 'app',
    type: 'App · Mobile',
    desc: 'Ionic/Angular hybrid app built during a work placement. Compiled to native iOS and Android targets.',
    stack: ['Ionic', 'Angular', 'Capacitor'],
    link: '',
    icon: '📱',
    screenshot: null,
  },
  {
    id: 'wabot',
    name: 'WhatsApp Bot',
    category: 'tool',
    type: 'Tool · Backend',
    desc: 'Product chatbot via the Meta WhatsApp Cloud API. Express backend with Excel as the data layer.',
    stack: ['Node.js', 'Express', 'WhatsApp API'],
    link: '',
    icon: '🤖',
    screenshot: null,
  },
  {
    id: 'publer',
    name: 'publer-mcp',
    category: 'tool',
    type: 'Tool · MCP',
    desc: "MCP server exposing Publer's full scheduling and analytics API as tools for AI agents.",
    stack: ['MCP', 'TypeScript', 'Publer API'],
    link: '',
    icon: '🔧',
    screenshot: null,
  },
];

const CATEGORIES = [
  { id: 'all',  label: 'All Projects', icon: '🗂️' },
  { id: 'web',  label: 'Web',          icon: '🌐' },
  { id: 'app',  label: 'App',          icon: '📱' },
  { id: 'tool', label: 'Tool',         icon: '🔧' },
];

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
    gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
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
    fontSize: '0.75rem',
    lineHeight: 1.4,
    color: '#1a1a2e',
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
  statusbar: {
    borderTop: '1px solid #808080',
    padding: '2px 8px',
    fontSize: '0.65rem',
    color: '#404040',
    display: 'flex',
    gap: '12px',
  },
};

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
    fontSize: '0.68rem',
    textAlign: 'center',
    color: selected ? '#ffffff' : '#1a1a2e',
    lineHeight: 1.3,
    maxWidth: '100px',
    wordBreak: 'break-word',
  };
}

export function MyWorkExplorer() {
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(PROJECTS[0]);

  const visible = filter === 'all' ? PROJECTS : PROJECTS.filter(p => p.category === filter);

  function handleFilter(cat) {
    setFilter(cat);
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

      <div style={chrome.body}>
        <div style={chrome.sidebar}>
          <div style={chrome.sidebarHeading}>Categories</div>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              style={folderItemStyle(filter === cat.id)}
              onClick={() => handleFilter(cat.id)}
            >
              <span>{cat.icon}</span> {cat.label}
            </button>
          ))}
        </div>

        <div style={chrome.grid}>
          {visible.map(p => (
            <button
              key={p.id}
              type="button"
              style={tileStyle(selected?.id === p.id)}
              onClick={() => setSelected(p)}
            >
              <span style={{ fontSize: '24px', lineHeight: 1 }}>{p.icon}</span>
              <span style={tileLabelStyle(selected?.id === p.id)}>{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <div style={chrome.detail}>
          <div style={chrome.preview}>
            {selected.screenshot
              ? <img src={selected.screenshot} alt={selected.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              : <span style={{ fontSize: '0.62rem', color: '#808080', textAlign: 'center', padding: '12px' }}>No preview</span>
            }
          </div>
          <div style={chrome.info}>
            <div style={chrome.detailName}>{selected.name}</div>
            <div style={chrome.detailDesc}>{selected.desc}</div>
            <div style={chrome.detailMeta}><strong>Type:</strong> {selected.type}</div>
            <div style={chrome.tags}>
              {selected.stack.map(t => <span key={t} style={chrome.tag}>{t}</span>)}
            </div>
            <div style={chrome.actions}>
              {selected.link && (
                <a
                  href={selected.link}
                  target="_blank"
                  rel="noopener"
                  style={{ ...chrome.btn, background: '#1a73e8', color: '#fff', borderColor: '#0d47a1' }}
                >
                  Visit →
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <div style={chrome.statusbar}>
        <span>{visible.length} object{visible.length !== 1 ? 's' : ''}</span>
        {selected && <span>1 object selected</span>}
      </div>
    </div>
  );
}
