// Single source of truth for every project shown on this site.
//
// Four surfaces read this list: the Win95 "My Work" explorer
// (components/MyWorkExplorer.jsx), the Nokia 3310 port (nokia/screens/
// WorkList + WorkDetail), and the crawler-facing index.html / llms.txt blocks
// that scripts/generate-static.js regenerates. Edit here, run `npm run
// static`, and every surface follows. Nothing else keeps its own copy.
//
// `link: null` means there is nothing a visitor can usefully open — a private
// client repo, or work owned by an employer. Those entries render `privateNote`
// instead of a button. Never point a link at a private GitHub repo: it 404s for
// everyone who isn't signed in as the owner.
//
// `screenshot` is the 1-bit dithered Nokia thumbnail and `preview` the
// full-colour image the desktop explorer shows. Both are built from the same
// capture in assets/screenshots/, listed as SOURCES in scripts/dither.js, and
// both must stay in sync with it — projects.test.js enforces that.
//
// `icon` is an id in the src/lib/pixelIcons registry, never an emoji or a path.

export const projects = [
  // ── Ofive Global — employed work. Repos live under a private org, so every
  //    link points at the company site rather than a 404ing repo URL. ───────
  {
    id: 'ofive-lead-engine',
    name: 'Lead Engine',
    tag: 'agents',
    category: 'work',
    type: 'Work · Ofive Global',
    description:
      'AI lead generation platform. Automates the top of the sales funnel — researches prospective companies, qualifies them against ideal-customer criteria, and orchestrates outreach — ending in a human review-and-approve step rather than blind automation.',
    stack: ['Python', 'FastAPI', 'PostgreSQL', 'LLM agents'],
    link: { href: 'https://ofive.io', label: 'Company →' },
    privateNote: null,
    iconType: 'python',
    icon: 'proj-ofive-lead-engine',
    preview: null,
  },
  {
    id: 'ofive-shared-schema',
    name: 'Shared Data Schema',
    tag: 'schema',
    category: 'work',
    type: 'Work · Ofive Global',
    description:
      'Migration governance for a database schema two independent services jointly own. Explicit ownership boundaries, review-before-apply on every migration, and least-privilege runtime roles that cannot execute DDL at all — so neither team can change a shared table out from under the other.',
    stack: ['PostgreSQL', 'SQL migrations', 'Access control'],
    link: { href: 'https://ofive.io', label: 'Company →' },
    privateNote: null,
    iconType: 'chip',
    icon: 'proj-ofive-shared-schema',
    preview: null,
  },
  {
    id: 'ofive-cloud-provisioning',
    name: 'Cloud Provisioning',
    tag: 'infra',
    category: 'work',
    type: 'Work · Ofive Global',
    description:
      'Cloud project bootstrap and CI identity hardening — duty-separated service accounts and keyless CI authentication through federated workload identity, so no long-lived credential is ever issued. Written up as a cross-team review for a second engineering team to adopt.',
    stack: ['Cloud IAM', 'CI/CD', 'Shell', 'Least privilege'],
    link: { href: 'https://ofive.io', label: 'Company →' },
    privateNote: null,
    iconType: 'terminal',
    icon: 'proj-ofive-cloud-provisioning',
    preview: null,
  },

  // ── Products and client platforms ────────────────────────────────────────
  {
    id: 'mos-vono',
    name: 'MOS VONO',
    tag: 'marketplace',
    category: 'work',
    type: 'Work · Marketplace',
    description:
      'Albanian marketplace for tasks and local services. A client posts a task, verified workers bid, the client picks one, and the job runs in a private shared space with payment held in escrow until completion. Express API over raw SQL on PostgreSQL, with a React Native app for both stores.',
    stack: ['Node.js', 'Express', 'PostgreSQL', 'React Native', 'Expo'],
    link: { href: 'https://mosvono.al', label: 'Visit →' },
    privateNote: null,
    iconType: 'globe',
    icon: 'proj-mos-vono',
    preview: null,
  },
  {
    id: 'ecovolt',
    name: 'EcoVolt Platform',
    tag: 'platform',
    category: 'work',
    type: 'Work · Client',
    description:
      'Maintenance-contract platform for an electrical contracting company: four surfaces — public site, owner portal, offline-first crew app, and admin console — over one per-building equipment register. Dispatch board with double-booking refused at the database level, contract-driven maintenance calendar, and invoicing.',
    stack: ['TypeScript', 'Next.js', 'PostgreSQL', 'Drizzle', 'Expo', 'Turborepo'],
    link: null,
    privateNote: 'Private · in build',
    iconType: 'typescript',
    icon: 'proj-ecovolt',
    preview: null,
  },

  // ── AI / agent work ──────────────────────────────────────────────────────
  {
    id: 'previsit',
    name: 'PreVisit',
    tag: 'hackathon',
    category: 'app',
    type: 'App · Healthcare · Hackathon',
    description:
      'AI-powered pre-visit medical intake system built for the Coolab hackathon. Patients complete a voice-guided intake, an LLM extracts structured medical data, speech synthesis and transcription drive the conversation, and a real-time doctor dashboard surfaces the briefing instantly.',
    stack: ['React', 'TanStack', 'FastAPI', 'Claude AI', 'ElevenLabs', 'Supabase', 'Twilio'],
    link: null,
    privateNote: 'Private repo',
    iconType: 'chat',
    icon: 'proj-previsit',
    screenshot: '/nokia/previsit.png',
    preview: '/previsit-screenshot.webp',
  },
  {
    id: 'publer-mcp',
    name: 'Publer MCP Server',
    tag: 'MCP',
    category: 'tool',
    type: 'Tool · MCP',
    description:
      "AI-powered social media management via Model Context Protocol. Exposes Publer's full scheduling and analytics API as MCP tools for direct AI assistant integration.",
    stack: ['TypeScript', 'MCP', 'Publer API', 'Turborepo'],
    link: { href: 'https://github.com/IsliBasha/publer-mcp', label: 'GitHub →' },
    privateNote: null,
    iconType: 'typescript',
    icon: 'proj-publer-mcp',
    preview: null,
  },
  {
    id: 'mcp-odoo-fintech',
    name: 'MCP Odoo Fintech',
    tag: 'MCP',
    category: 'tool',
    type: 'Tool · MCP',
    description:
      'TypeScript MCP server connecting Claude directly to Odoo ERP via JSON-RPC 2.0. Exposes invoices, sales orders, and customer balances as AI tools, with HMAC webhook verification and a Web Inspector UI.',
    stack: ['TypeScript', 'MCP', 'Odoo ERP', 'JSON-RPC 2.0'],
    link: { href: 'https://github.com/IsliBasha/mcp-odoo-fintech', label: 'GitHub →' },
    privateNote: null,
    iconType: 'typescript',
    icon: 'proj-mcp-odoo-fintech',
    preview: null,
  },
  {
    id: 'playwright-saas-automator',
    name: 'Playwright SaaS Automator',
    tag: 'automation',
    category: 'tool',
    type: 'Tool · Automation',
    description:
      'Resilient SaaS user provisioning via Playwright with ARIA-first selectors. Claude Haiku self-repairs broken selectors when UIs change, with PII scrubbing for audit-safe logs.',
    stack: ['TypeScript', 'Playwright', 'Claude AI', 'Node.js'],
    link: { href: 'https://github.com/IsliBasha/playwright-saas-automator', label: 'GitHub →' },
    privateNote: null,
    iconType: 'typescript',
    icon: 'proj-playwright-saas-automator',
    preview: null,
  },
  {
    id: 'copycat',
    name: 'Copycat',
    tag: 'agent',
    category: 'tool',
    type: 'Tool · Agent',
    description:
      'AI screen automation agent — captures the screen, asks Claude what to do next, and executes actions with human-like timing. Autonomous GUI interaction driven by vision and language.',
    stack: ['Python', 'Claude AI', 'PyAutoGUI', 'Pillow'],
    link: null,
    privateNote: 'Private repo',
    iconType: 'python',
    icon: 'proj-copycat',
    preview: null,
  },

  // ── Systems, research, and open source ───────────────────────────────────
  {
    id: 'medt',
    name: 'ME-DT Framework',
    tag: 'thesis',
    category: 'research',
    type: 'Research · Thesis',
    description:
      'Bachelor thesis: Mythos-Enhanced Digital Twin for smart-city cyber-physical threat detection. Isolation Forest anomaly detection, MITRE ATT&CK mapping, and a real-time FastAPI dashboard over WebSockets.',
    stack: ['Python', 'FastAPI', 'Isolation Forest', 'MITRE ATT&CK'],
    link: { href: 'https://github.com/IsliBasha/me-dt-framework', label: 'GitHub →' },
    privateNote: null,
    iconType: 'network',
    icon: 'proj-medt',
    screenshot: '/nokia/medt.png',
    preview: '/medt-screenshot.webp',
  },
  {
    id: 'rust-scraper',
    name: 'rust-scraper',
    tag: 'scraper',
    category: 'tool',
    type: 'Tool · CLI',
    description:
      'Production-grade Rust web scraper — hybrid HTTP/headless rendering, recursive crawler, CSS + XPath extraction, live TUI, web dashboard, SQLite persistence, single self-contained binary.',
    stack: ['Rust', 'SQLite', 'ratatui', 'XPath'],
    link: { href: 'https://github.com/IsliBasha/rust-scraper', label: 'GitHub →' },
    privateNote: null,
    iconType: 'rust',
    icon: 'proj-rust-scraper',
    screenshot: '/nokia/rust-scraper.png',
    preview: '/rust-scraper-screenshot.webp',
  },
  {
    id: 'cf-worker-rust',
    name: 'cf-worker-rust',
    tag: 'edge',
    category: 'tool',
    type: 'Tool · Edge',
    description:
      'Edge JWT validator and per-IP rate limiter running on Cloudflare Workers. Rust/WASM via workers-rs, supports HS256 and RS256. KV-backed sliding-window rate limiting.',
    stack: ['Rust', 'WASM', 'Cloudflare Workers', 'JWT'],
    link: { href: 'https://github.com/IsliBasha/cf-worker-rust', label: 'GitHub →' },
    privateNote: null,
    iconType: 'rust',
    icon: 'proj-cf-worker-rust',
    preview: null,
  },
  {
    id: 'wabot',
    name: 'Whatsapp-Chatbot',
    tag: 'chatbot',
    category: 'tool',
    type: 'Tool · Backend',
    description:
      'WhatsApp business chatbot — Node.js + Express, NLP intent detection, product search via Odoo XML-RPC, session management, HMAC webhook verification, and rate limiting.',
    stack: ['Node.js', 'Express', 'Odoo XML-RPC', 'PostgreSQL'],
    link: { href: 'https://github.com/IsliBasha/Whatsapp-Chatbot', label: 'GitHub →' },
    privateNote: null,
    iconType: 'chat',
    icon: 'proj-wabot',
    preview: null,
  },
  {
    id: 'linkedin-banner',
    name: 'LinkedIn Banner',
    tag: 'automation',
    category: 'tool',
    type: 'Tool · Automation',
    description:
      'Auto-generates a LinkedIn cover photo from live GitHub stats — dark terminal aesthetic with contribution graph, language breakdown, and streak metrics. Refreshed daily via GitHub Actions.',
    stack: ['Python', 'Pillow', 'GitHub Actions', 'GitHub API'],
    link: { href: 'https://github.com/IsliBasha/linkedin-banner', label: 'GitHub →' },
    privateNote: null,
    iconType: 'terminal',
    icon: 'proj-linkedin-banner',
    screenshot: '/nokia/linkedin-banner.png',
    preview: '/linkedin-banner-screenshot.webp',
  },

  // ── Client websites ──────────────────────────────────────────────────────
  {
    id: 'stani-hoxhes',
    name: 'Stani i Hoxhës',
    tag: 'website',
    category: 'web',
    type: 'Web · Client',
    description:
      'Real-client website for a seasonal mountain lodge in the Novoseja highlands, Kukës. Astro 4, fully bilingual (Albanian/English), drone video integration, image galleries, and responsive room booking sections.',
    stack: ['Astro', 'JavaScript', 'HTML/CSS', 'Bilingual'],
    link: { href: 'https://stani-hoxhes-website.pages.dev/', label: 'Visit →' },
    privateNote: null,
    iconType: 'globe',
    icon: 'proj-stani-hoxhes',
    screenshot: '/nokia/stani-hoxhes.png',
    preview: '/stani-screenshot.webp',
  },
  {
    id: 'meridian-build',
    name: 'Meridian Build',
    tag: 'website',
    category: 'web',
    type: 'Web · Client',
    description:
      'SvelteKit website for a NYC commercial contractor. Flagship UX: an interactive building explorer that lets visitors navigate building → floor → room to explore completed projects.',
    stack: ['SvelteKit', 'JavaScript', 'HTML/CSS'],
    link: { href: 'https://github.com/IsliBasha/meridian-build', label: 'GitHub →' },
    privateNote: null,
    iconType: 'globe',
    icon: 'proj-meridian-build',
    preview: null,
  },

  // ── Apps ─────────────────────────────────────────────────────────────────
  {
    id: 'floracare',
    name: 'FloraCare',
    tag: 'android',
    category: 'app',
    type: 'App · Android',
    description:
      'Android plant care companion — Kotlin + Jetpack Compose, species lookup via the Perenual API, and weather-aware watering reminders.',
    stack: ['Kotlin', 'Jetpack Compose', 'Perenual API', 'OpenWeatherMap'],
    link: { href: 'https://github.com/IsliBasha/FloraCare', label: 'GitHub →' },
    privateNote: null,
    iconType: 'android',
    icon: 'proj-floracare',
    preview: null,
  },
  {
    id: 'mira-study',
    name: 'Mira Study',
    tag: 'study',
    category: 'app',
    type: 'App · Desktop',
    description:
      'AI study companion. Upload PDFs, auto-generate flashcards and quizzes, get step-by-step AI tutor explanations, and track progress with an analytics dashboard.',
    stack: ['PyQt6', 'FastAPI', 'Claude AI', 'SQLite'],
    link: { href: 'https://github.com/IsliBasha/mira-study', label: 'GitHub →' },
    privateNote: null,
    iconType: 'book',
    icon: 'proj-mira-study',
    preview: null,
  },

  // ── Academic and systems ─────────────────────────────────────────────────
  {
    id: 'win95-arch',
    name: 'Win95 Architecture Deck',
    tag: 'deck',
    category: 'research',
    type: 'Research · Presentation',
    description:
      'Zero-dependency Win95-themed architecture presentation for Polis University. Custom pixel-art CSS, IBM Plex typography, and interactive slide transitions — no frameworks, no build step.',
    stack: ['JavaScript', 'HTML/CSS', 'Win95 Theme'],
    link: { href: 'https://github.com/IsliBasha/win95-architecture', label: 'GitHub →' },
    privateNote: null,
    iconType: 'chip',
    icon: 'proj-win95-arch',
    screenshot: '/nokia/win95-arch.png',
    preview: '/win95-screenshot.webp',
  },
  {
    id: 'java-advanced',
    name: 'Java Advanced Programming',
    tag: 'academic',
    category: 'research',
    type: 'Research · Academic',
    description:
      'Nine university Java projects — Collections, Streams, and Optional console apps plus Spring Boot 3 REST APIs with JPA, Bean Validation, layered architecture, and JUnit 5 test suites. Java 21.',
    stack: ['Java 21', 'Spring Boot 3', 'JPA', 'JUnit 5'],
    link: { href: 'https://github.com/IsliBasha/java-advanced-programming', label: 'GitHub →' },
    privateNote: null,
    iconType: 'book',
    icon: 'proj-java-advanced',
    preview: null,
  },
  {
    id: 'mips-voting',
    name: 'MIPS Voting System',
    tag: 'voting',
    category: 'research',
    type: 'Research · Systems',
    description:
      'Electronic voting system simulator in MIPS Assembly for the MARS simulator. Vote casting, live statistics, winner detection, MMIO simulation, and timer-based live updates.',
    stack: ['MIPS Assembly', 'MARS Simulator', 'MMIO'],
    link: { href: 'https://github.com/IsliBasha/mips-voting-system', label: 'GitHub →' },
    privateNote: null,
    iconType: 'chip',
    icon: 'proj-mips-voting',
    preview: null,
  },
  {
    id: 'hamster',
    name: 'HamsterFaceRecognition',
    tag: 'ML',
    category: 'research',
    type: 'Research · ML',
    description:
      'Face recognition model trained on hamster images. DeepFace + OpenCV applied to a deeply unserious dataset.',
    stack: ['Python', 'OpenCV', 'DeepFace'],
    link: { href: 'https://github.com/IsliBasha/HamsterFaceRecognition', label: 'GitHub →' },
    privateNote: null,
    iconType: 'python',
    icon: 'proj-hamster',
    preview: null,
  },

  // ── Work placement — employer-owned, no public repo ──────────────────────
  {
    id: 'warehouse',
    name: 'warehouse-inventory',
    tag: 'inventory',
    category: 'work',
    type: 'App · Mobile · Placement',
    description:
      'Mobile-first inventory management app built during a work placement. Tracks stock levels, movements, and locations across warehouse sites.',
    stack: ['Ionic', 'Angular', 'Capacitor'],
    link: null,
    privateNote: 'Private · work placement',
    iconType: 'android',
    icon: 'proj-warehouse',
    preview: null,
  },
  {
    id: 'ionic-work',
    name: 'ionic-project-work-1',
    tag: 'hybrid',
    category: 'work',
    type: 'App · Mobile · Placement',
    description:
      'Ionic/Angular hybrid app built during a work placement. Compiled to native iOS and Android targets from a single codebase.',
    stack: ['Ionic', 'Angular', 'Capacitor'],
    link: null,
    privateNote: 'Private · work placement',
    iconType: 'android',
    icon: 'proj-ionic-work',
    preview: null,
  },
];
