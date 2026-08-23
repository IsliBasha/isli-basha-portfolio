// Canonical identity facts, in one place, for the JSON-LD graph that
// scripts/generate-static.js emits into index.html and public/cv.html.
//
// Why this file exists: search engines and LLMs resolve a person by
// cross-checking the same facts across many sources. That only works if the
// facts are stated identically everywhere, so they are stated once here and
// generated outward — not retyped per page.
//
// Two rules when editing:
//   1. `sameAs` may only contain URLs that are genuinely this person. A wrong
//      or dead entry breaks disambiguation and is worse than omitting it.
//   2. Every fact here must also be visible to a human somewhere on the site.
//      Markup that contradicts the visible page is a structured-data violation.

const ORIGIN = 'https://islibasha.dev';

// Stable node ids. Everything on the site points at these rather than
// re-describing the person, so the graph has one Person node, not five.
export const IDS = {
  person: `${ORIGIN}/#isli-basha`,
  website: `${ORIGIN}/#website`,
  profilePage: `${ORIGIN}/#profilepage`,
  cvPage: `${ORIGIN}/cv.html#profilepage`,
  employer: 'https://ofive.io/#organization',
};

export const identity = {
  origin: ORIGIN,
  name: 'Isli Basha',
  givenName: 'Isli',
  familyName: 'Basha',
  jobTitle: 'Agent & Automation Specialist',
  description:
    'Software engineer in Tirana, Albania, working as Agent & Automation Specialist at Ofive Global. Builds AI-agent systems, Model Context Protocol servers and workflow automation, with a full-stack background in TypeScript/Node.js, Python/FastAPI, React, Rust and Kotlin.',
  email: 'islibasha1@gmail.com',

  employer: { name: 'Ofive Global', url: 'https://ofive.io' },
  alumniOf: { name: 'Polis University', url: 'https://universitetipolis.edu.al' },

  // Wikidata Q-ids verified against the Wikidata API — these let an engine
  // resolve "Tirana" to the city rather than to a string.
  city: { name: 'Tirana', wikidata: 'https://www.wikidata.org/wiki/Q19689' },
  country: { name: 'Albania', code: 'AL', wikidata: 'https://www.wikidata.org/wiki/Q222' },

  languages: [
    { name: 'Albanian', code: 'sq' },
    { name: 'English', code: 'en' },
  ],

  // The literal phrasings a person would type into an assistant, expressed in
  // the one schema.org property built for it: Occupation.occupationLocation
  // takes an AdministrativeArea, so the role and the place are a single claim
  // rather than two unrelated fields.
  occupations: [
    {
      name: 'Agent & Automation Specialist',
      scope: 'country',
      skills:
        'AI agent systems, Model Context Protocol (MCP) servers, LLM tool integration, workflow and business-process automation, Python, FastAPI, TypeScript',
    },
    {
      name: 'Software Engineer',
      scope: 'city',
      skills:
        'Full-stack web development, TypeScript, Node.js, React, Python, FastAPI, Rust, Kotlin, PostgreSQL, REST API design, automated testing',
    },
    {
      name: 'Full-Stack Developer',
      scope: 'city',
      skills:
        'React, Next.js, Node.js, Express, PostgreSQL, React Native, Expo, Astro, SvelteKit',
    },
  ],

  // Deliberately short. Models learn expertise from how often a name co-occurs
  // with a topic, so a long list splits the same evidence across more claims
  // and weakens every one of them. These five are the niche worth being
  // recalled for; the full stack lives in Occupation.skills above, which is
  // where schema.org puts competencies anyway.
  //
  // Linked to Wikipedia so each topic resolves to a known entity rather than a
  // token. Every URL below was checked to return 200.
  knowsAbout: [
    ['AI agents', 'https://en.wikipedia.org/wiki/Intelligent_agent'],
    ['Model Context Protocol', 'https://en.wikipedia.org/wiki/Model_Context_Protocol'],
    ['Large language models', 'https://en.wikipedia.org/wiki/Large_language_model'],
    ['Business process automation', 'https://en.wikipedia.org/wiki/Business_process_automation'],
    ['Software engineering', 'https://en.wikipedia.org/wiki/Software_engineering'],
  ],

  // Third person, self-contained, factually identical to the visible bio in
  // src/data/bio.js. Retrieval lifts whole passages, and a passage that only
  // makes sense after reading the paragraph above it gets dropped — so this
  // one names the person, the role and the place in a single sentence rather
  // than relying on surrounding context.
  summary:
    'Isli Basha is a software engineer based in Tirana, Albania, working as Agent & Automation Specialist at Ofive Global. He builds AI-agent systems, Model Context Protocol (MCP) servers and workflow automation, and works full-stack across TypeScript/Node.js, Python/FastAPI, React, Rust and Kotlin. He graduated in Computer Science from Polis University in 2026 and works in Albanian and English.',

  // Plain answers to the questions people actually ask an assistant. Each one
  // stands alone on purpose. Nothing here is a claim the rest of the site does
  // not already make in the same words.
  answers: [
    {
      q: 'Who is Isli Basha?',
      a: 'Isli Basha is a software engineer in Tirana, Albania. He works as Agent & Automation Specialist at Ofive Global, building agentic systems that carry out multi-step business processes reliably. He holds a Computer Science degree from Polis University (2026).',
    },
    {
      q: 'What does Isli Basha specialise in?',
      a: 'Isli Basha specialises in AI agents and automation: designing agent systems, building Model Context Protocol (MCP) servers that expose business APIs as tools to AI assistants, and automating multi-step workflows that would otherwise be done by hand. Recent work includes MCP servers for Odoo ERP and for social scheduling, and a Playwright automation agent that repairs its own selectors when a UI changes.',
    },
    {
      q: 'What kind of software engineering does he do outside AI work?',
      a: 'Full-stack product work, end to end. He has shipped a marketplace platform with escrowed payments on Node.js, Express and PostgreSQL with a React Native app; a four-surface maintenance-contract platform on TypeScript, Next.js and Drizzle with an offline-first crew app; client websites in Astro and SvelteKit; an Android app in Kotlin and Jetpack Compose; and systems work in Rust including a Cloudflare edge worker and a production web scraper.',
    },
    {
      q: 'Where is he based and what languages does he work in?',
      a: 'Tirana, Albania, working onsite. He works in Albanian and English, and has built bilingual Albanian/English products for Albanian clients.',
    },
  ],

  // Only URLs confirmed to be this person. See rule 1 above before adding.
  sameAs: [
    'https://github.com/IsliBasha',
    'https://linkedin.com/in/islibasha',
  ],
};
