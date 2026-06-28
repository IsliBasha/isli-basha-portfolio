import { useState } from 'react';

const PROJECTS = [
  // ── Client / Delivered ──────────────────────────────────────────────────
  {
    id: 'stani',
    name: 'Stani i Hoxhës',
    category: 'web',
    type: 'Web · Client',
    desc: 'Mountain lodge in Kukës, Albania. Bilingual SQ/EN, animated hero, gallery, and reservation contact form.',
    stack: ['Astro', 'CSS', 'i18n'],
    link: 'https://stani-hoxhes-website.pages.dev/',
    linkLabel: 'Visit →',
    icon: '🌐',
    screenshot: '/stani-screenshot.jpeg',
  },
  {
    id: 'warehouse',
    name: 'warehouse-inventory',
    category: 'app',
    type: 'App · Mobile',
    desc: 'Mobile-first inventory management app built during a work placement. Tracks stock levels, movements, and locations.',
    stack: ['Ionic', 'Angular', 'Capacitor'],
    link: '',
    linkLabel: '',
    icon: '📦',
    screenshot: null,
  },
  {
    id: 'ionic-work',
    name: 'ionic-project-work-1',
    category: 'app',
    type: 'App · Mobile',
    desc: 'Ionic/Angular hybrid app built during a work placement. Compiled to native iOS and Android targets.',
    stack: ['Ionic', 'Angular', 'Capacitor'],
    link: '',
    linkLabel: '',
    icon: '📱',
    screenshot: null,
  },
  // ── Open Source / GitHub ─────────────────────────────────────────────────
  {
    id: 'medt',
    name: 'ME-DT Framework',
    category: 'research',
    type: 'Research · Thesis',
    desc: 'Bachelor thesis: Mythos-Enhanced Digital Twin for smart-city cyber-physical threat detection. Isolation Forest anomaly detection, MITRE ATT&CK mapping, real-time FastAPI dashboard.',
    stack: ['Python', 'FastAPI', 'Isolation Forest', 'MITRE ATT&CK'],
    link: 'https://github.com/IsliBasha/me-dt-framework',
    linkLabel: 'GitHub →',
    icon: '🔬',
    screenshot: '/medt-screenshot.jpeg',
  },
  {
    id: 'floracare',
    name: 'FloraCare',
    category: 'app',
    type: 'App · Android',
    desc: 'Android plant care companion — Kotlin + Jetpack Compose, species lookup via Perenual API, weather-aware watering reminders.',
    stack: ['Kotlin', 'Jetpack Compose', 'Perenual API', 'OpenWeatherMap'],
    link: 'https://github.com/IsliBasha/FloraCare',
    linkLabel: 'GitHub →',
    icon: '🌿',
    screenshot: null,
  },
  {
    id: 'wabot',
    name: 'Whatsapp-Chatbot',
    category: 'tool',
    type: 'Tool · Backend',
    desc: 'WhatsApp business chatbot — Node.js + Express, NLP intent detection, product search via Odoo XML-RPC, session management, HMAC webhook verification, and rate limiting.',
    stack: ['Node.js', 'Express', 'Odoo XML-RPC', 'PostgreSQL'],
    link: 'https://github.com/IsliBasha/Whatsapp-Chatbot',
    linkLabel: 'GitHub →',
    icon: '🤖',
    screenshot: null,
  },
  {
    id: 'cf-worker-rust',
    name: 'cf-worker-rust',
    category: 'tool',
    type: 'Tool · Edge',
    desc: 'Cloudflare Worker in Rust — JWT validation (HS256/RS256) and per-IP rate limiting at the edge, compiled to WASM via workers-rs.',
    stack: ['Rust', 'WASM', 'Cloudflare Workers', 'JWT'],
    link: 'https://github.com/IsliBasha/cf-worker-rust',
    linkLabel: 'GitHub →',
    icon: '⚡',
    screenshot: null,
  },
  {
    id: 'hamster',
    name: 'HamsterFaceRecognition',
    category: 'research',
    type: 'Research · ML',
    desc: 'Hamster face recognition — Python + DeepFace + OpenCV. Identifies individual hamsters from webcam or photo input.',
    stack: ['Python', 'OpenCV', 'DeepFace'],
    link: 'https://github.com/IsliBasha/HamsterFaceRecognition',
    linkLabel: 'GitHub →',
    icon: '🐹',
    screenshot: null,
  },
  {
    id: 'mira-study',
    name: 'Mira Study',
    category: 'app',
    type: 'App · Desktop',
    desc: 'AI study companion. Upload PDFs, auto-generate flashcards and quizzes, get step-by-step AI tutor explanations, and track progress with an analytics dashboard.',
    stack: ['PyQt6', 'FastAPI', 'Claude AI', 'SQLite'],
    link: 'https://github.com/IsliBasha/mira-study',
    linkLabel: 'GitHub →',
    icon: '📚',
    screenshot: null,
  },
  {
    id: 'rust-scraper',
    name: 'rust-scraper',
    category: 'tool',
    type: 'Tool · CLI',
    desc: 'Production-grade Rust web scraper — hybrid HTTP/headless rendering, recursive crawler, CSS + XPath extraction, live TUI, web dashboard, SQLite persistence, single self-contained binary.',
    stack: ['Rust', 'SQLite', 'ratatui', 'XPath'],
    link: 'https://github.com/IsliBasha/rust-scraper',
    linkLabel: 'GitHub →',
    icon: '🕷️',
    screenshot: '/rust-scraper-screenshot.jpeg',
  },
  {
    id: 'linkedin-banner',
    name: 'LinkedIn Banner',
    category: 'tool',
    type: 'Tool · Automation',
    desc: 'Auto-generates a LinkedIn cover photo from live GitHub stats — dark terminal aesthetic with contribution graph, language breakdown, and streak metrics. Refreshed daily via GitHub Actions.',
    stack: ['Python', 'Pillow', 'GitHub Actions', 'GitHub API'],
    link: 'https://github.com/IsliBasha/linkedin-banner',
    linkLabel: 'GitHub →',
    icon: '🎨',
    screenshot: '/linkedin-banner-screenshot.png',
  },
  {
    id: 'publer-mcp',
    name: 'Publer MCP Server',
    category: 'tool',
    type: 'Tool · MCP',
    desc: "AI-powered social media management via Model Context Protocol. Exposes Publer's full scheduling and analytics API as MCP tools for direct AI assistant integration.",
    stack: ['TypeScript', 'MCP', 'Publer API', 'Turborepo'],
    link: 'https://github.com/IsliBasha/publer-mcp',
    linkLabel: 'GitHub →',
    icon: '🔧',
    screenshot: null,
  },
  {
    id: 'mips-voting',
    name: 'MIPS Voting System',
    category: 'research',
    type: 'Research · Systems',
    desc: 'Electronic voting system simulator in MIPS Assembly for the MARS simulator. Vote casting, live statistics, winner detection, MMIO simulation, and timer-based live updates.',
    stack: ['MIPS Assembly', 'MARS Simulator', 'MMIO'],
    link: 'https://github.com/IsliBasha/mips-voting-system',
    linkLabel: 'GitHub →',
    icon: '💾',
    screenshot: null,
  },
  {
    id: 'copycat',
    name: 'Copycat',
    category: 'tool',
    type: 'Tool · Agent',
    desc: 'AI screen automation agent — captures the screen, asks Claude what to do next, and executes actions with human-like timing. Autonomous GUI interaction driven by vision and language.',
    stack: ['Python', 'Claude AI', 'PyAutoGUI', 'Pillow'],
    link: 'https://github.com/IsliBasha/copycat',
    linkLabel: 'GitHub →',
    icon: '🖥️',
    screenshot: null,
  },
  {
    id: 'win95-arch',
    name: 'Win95 Architecture Deck',
    category: 'research',
    type: 'Research · Presentation',
    desc: 'Zero-dependency Win95-themed architecture presentation for Polis University. Custom pixel-art CSS, IBM Plex typography, and interactive slide transitions — no frameworks, no build step.',
    stack: ['JavaScript', 'HTML/CSS', 'Win95 Theme'],
    link: 'https://github.com/IsliBasha/win95-architecture',
    linkLabel: 'GitHub →',
    icon: '🏛️',
    screenshot: '/win95-screenshot.png',
  },
  {
    id: 'previsit',
    name: 'PreVisit',
    category: 'app',
    type: 'App · Healthcare · Hackathon',
    desc: 'AI-powered pre-visit medical intake system built for the Coolab hackathon. Patients complete a voice-guided intake — Claude AI extracts structured medical data, ElevenLabs drives TTS/STT, and a real-time doctor dashboard surfaces the briefing instantly.',
    stack: ['React', 'TanStack', 'FastAPI', 'Claude AI', 'ElevenLabs', 'Supabase', 'Twilio'],
    link: 'https://github.com/IsliBasha/Coolab_hackathon',
    linkLabel: 'GitHub →',
    icon: '🏥',
    screenshot: '/previsit-screenshot.jpeg',
  },
  {
    id: 'java-advanced',
    name: 'Java Advanced Programming',
    category: 'research',
    type: 'Research · Academic',
    desc: 'Nine university Java projects — Collections, Streams, Optional console apps and Spring Boot 3 REST APIs with JPA, Bean Validation, layered architecture, and JUnit 5 test suites. Java 21.',
    stack: ['Java 21', 'Spring Boot 3', 'JPA', 'JUnit 5'],
    link: 'https://github.com/IsliBasha/java-advanced-programming',
    linkLabel: 'GitHub →',
    icon: '☕',
    screenshot: null,
  },
];

const CATEGORIES = [
  { id: 'all',      label: 'All',      icon: '🗂️' },
  { id: 'web',      label: 'Web',      icon: '🌐' },
  { id: 'app',      label: 'App',      icon: '📱' },
  { id: 'tool',     label: 'Tool',     icon: '🔧' },
  { id: 'research', label: 'Research', icon: '🔬' },
];

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
        />
        {query && (
          <button type="button" style={chrome.clearBtn} onClick={() => setQuery('')}>✕</button>
        )}
      </div>

      <div style={chrome.body}>
        <div style={chrome.sidebar}>
          <div style={chrome.sidebarHeading}>Categories</div>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              style={folderItemStyle(!q && filter === cat.id)}
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
              style={tileStyle(effectiveSelected?.id === p.id)}
              onClick={() => setSelected(p)}
            >
              <span style={{ fontSize: '22px', lineHeight: 1 }}>{p.icon}</span>
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
            {effectiveSelected.screenshot
              ? <img src={effectiveSelected.screenshot} alt={effectiveSelected.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              : <span style={{ fontSize: '0.62rem', color: '#808080', textAlign: 'center', padding: '12px' }}>No preview</span>
            }
          </div>
          <div style={chrome.info}>
            <div style={chrome.detailName}>{effectiveSelected.name}</div>
            <div style={chrome.detailDesc}>{effectiveSelected.desc}</div>
            <div style={chrome.detailMeta}><strong>Type:</strong> {effectiveSelected.type}</div>
            <div style={chrome.tags}>
              {effectiveSelected.stack.map(t => <span key={t} style={chrome.tag}>{t}</span>)}
            </div>
            <div style={chrome.actions}>
              {effectiveSelected.link && (
                <a
                  href={effectiveSelected.link}
                  target="_blank"
                  rel="noopener"
                  style={{
                    ...chrome.btn,
                    background: effectiveSelected.linkLabel?.startsWith('GitHub') ? '#1a1a2e' : '#1a73e8',
                    color: '#fff',
                    borderColor: effectiveSelected.linkLabel?.startsWith('GitHub') ? '#000' : '#0d47a1',
                  }}
                >
                  {effectiveSelected.linkLabel}
                </a>
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
