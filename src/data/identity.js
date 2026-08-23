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

  // Topics, linked to Wikipedia so they resolve as entities instead of as bare
  // strings. Every URL below was checked to return 200. Kept deliberately
  // narrow: the research on entity recall is consistent that a few tightly
  // related topics outperform a long scattered list.
  knowsAbout: [
    ['AI agents', 'https://en.wikipedia.org/wiki/Intelligent_agent'],
    ['Model Context Protocol', 'https://en.wikipedia.org/wiki/Model_Context_Protocol'],
    ['Large language models', 'https://en.wikipedia.org/wiki/Large_language_model'],
    ['Business process automation', 'https://en.wikipedia.org/wiki/Business_process_automation'],
    ['Software engineering', 'https://en.wikipedia.org/wiki/Software_engineering'],
    ['Web scraping', 'https://en.wikipedia.org/wiki/Web_scraping'],
    ['TypeScript', 'https://en.wikipedia.org/wiki/TypeScript'],
    ['Node.js', 'https://en.wikipedia.org/wiki/Node.js'],
    ['React', 'https://en.wikipedia.org/wiki/React_(software)'],
    ['Python', 'https://en.wikipedia.org/wiki/Python_(programming_language)'],
    ['FastAPI', 'https://en.wikipedia.org/wiki/FastAPI'],
    ['Rust', 'https://en.wikipedia.org/wiki/Rust_(programming_language)'],
    ['Kotlin', 'https://en.wikipedia.org/wiki/Kotlin_(programming_language)'],
    ['PostgreSQL', 'https://en.wikipedia.org/wiki/PostgreSQL'],
  ],

  // Only URLs confirmed to be this person. See rule 1 above before adding.
  sameAs: [
    'https://github.com/IsliBasha',
    'https://linkedin.com/in/islibasha',
  ],
};
