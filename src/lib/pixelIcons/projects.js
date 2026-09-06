// Per-project icons, keyed by the project id in src/data/projects.js: every id
// here is `proj-<that entry's id>` and every project's `icon` field is exactly
// that id — nothing falls back to a category picture any more. projects.test.js
// checks the equality in both directions, so a project renamed without its icon
// renamed fails the suite rather than quietly drawing the generic placeholder.
// The icons in categories.js label the explorer's sidebar folders and nothing
// else; no project draws one.
//
// Drawn to the same rule as system.js so a grid of 25 reads as one set: a 1px
// black outline, light from the top-left (`w` on the lit edge, `d` or a dark
// palette pair on the shaded one), flat fills, at most six colours each. The
// subject is a silhouette first — at 32px on the explorer grid the outline is
// all a visitor resolves before the fill, so two projects that would share a
// silhouette get different objects rather than different colours.
//
// Ids added here must not collide with system.js or games.js — pixelIcons.test.js
// fails the build if two registries claim the same id.

/**
 * Lead Engine — a funnel over a horseshoe magnet: the top of a sales funnel,
 * automated. The magnet rather than a second funnel because two cones stacked
 * read as an hourglass, which is the wrong story entirely.
 */
const leadEngine = [
  '.kkkkkkkkkkkkkk.',
  '.kwccccccccccCk.',
  '..kwccccccccCk..',
  '...kwccccccCk...',
  '....kwccccCk....',
  '.....kwccCk.....',
  '......kwCk......',
  '......kwCk......',
  '................',
  '.....kkkkkk.....',
  '...kkrrrrrrkk...',
  '..krrkkkkkkrrk..',
  '..krrk....krrk..',
  '..krrk....krrk..',
  '..kkkk....kkkk..',
  '..kddk....kddk..',
];

/**
 * Shared Data Schema — one table, header band and three body rows split by a
 * column divider. The divider is what makes it a table rather than a stack of
 * plates; without it the same shape reads as a to-do list.
 */
const sharedSchema = [
  '................',
  '.kkkkkkkkkkkkkk.',
  '.kBBBBBkBBBBBBk.',
  '.kkkkkkkkkkkkkk.',
  '.kwwwwwkggggggk.',
  '.kwwwwwkggggggk.',
  '.kkkkkkkkkkkkkk.',
  '.kwwwwwkggggggk.',
  '.kwwwwwkggggggk.',
  '.kkkkkkkkkkkkkk.',
  '.kwwwwwkggggggk.',
  '.kwwwwwkgggggdk.',
  '.kkkkkkkkkkkkkk.',
  '................',
  '................',
  '................',
];

/**
 * Cloud Provisioning — a cloud above a key: project bootstrap plus the IAM
 * half of the job. The key sits below rather than inside because a keyhole
 * punched into the cloud loses the cloud's silhouette.
 */
const cloudProvisioning = [
  '................',
  '......kkkk......',
  '....kkwwwwkk....',
  '...kwwwwwwwwk...',
  '..kkwwwwwwwwgk..',
  '.kwwwwwwwwwwggk.',
  '.kwwwwwwwwgggdk.',
  '.kkkkkkkkkkkkkk.',
  '................',
  '..kkkkk.........',
  '.kwyyyyk........',
  'kwyk..kyk.......',
  'kwyk..kykkkkkk..',
  'kwyk..kykyyyyk..',
  '.kwyyyykkkkkkkk.',
  '..kkkkk..kk.kk..',
];

/**
 * MOS VONO — a price tag with a green tick: a marketplace where a job is
 * priced and then confirmed. Dark green over yellow, not lime, because lime on
 * yellow is the one pairing in this palette that vanishes at icon size.
 */
const mosVono = [
  '................',
  '.....kkkkkkkkkk.',
  '....kwyyyyyyyyk.',
  '..kwykkkkyyyyyk.',
  '.kwyyk..kyyyyyk.',
  '.kwyyk..kyyyyyk.',
  '.kwyykkkkyyyyyk.',
  '.kwyyyyyyyyyyyk.',
  '.kwyyyyyyyyLLyk.',
  '.kwyyyyyyyLLyyk.',
  '.kwyyLLyyLLyyyk.',
  '.kwyyyLLLLyyyyk.',
  '.kwyyyyLLyyyyyk.',
  '.kYYYYYYYYYYYYk.',
  '.kkkkkkkkkkkkkk.',
  '................',
];

/**
 * EcoVolt — a lightning bolt on a dark panel: field electrical work, and the
 * only icon in the set drawn light-on-dark, which is what separates it from
 * the other four Ofive-era work entries at a glance.
 */
const ecovolt = [
  '................',
  '.kkkkkkkkkkkkkk.',
  '.kwBBBBBBBBBBdk.',
  '.kwBBBBBByyBBdk.',
  '.kwBBBBByyyBBdk.',
  '.kwBBBByyyBBBdk.',
  '.kwBBByyyBBBBdk.',
  '.kwBByyyyyyBBdk.',
  '.kwBBBByyyBBBdk.',
  '.kwBBByyyBBBBdk.',
  '.kwBByyyBBBBBdk.',
  '.kwByyyBBBBBBdk.',
  '.kwBBBBBBBBBBdk.',
  '.kwBBBBBBBBBBdk.',
  '.kkkkkkkkkkkkkk.',
  '................',
];

/**
 * PreVisit — a clipboard carrying a red cross: intake paperwork done before a
 * clinic visit. The cross sits on the board rather than beside it because two
 * separate objects at 16px read as two icons crammed into one tile.
 */
const previsit = [
  '......kkkk......',
  '......kddk......',
  '.kkkkkkddkkkkkk.',
  '.kwwwwkkkkwwwwk.',
  '.kwwwwwwwwwwwwk.',
  '.kwwwwwwwwwwwdk.',
  '.kwwwwrrrrwwwdk.',
  '.kwwwwrrrrwwwdk.',
  '.kwwrrrrrrrrwdk.',
  '.kwwrrrrrrrrwdk.',
  '.kwwrrrrrrrrwdk.',
  '.kwwwwrrrrwwwdk.',
  '.kwwwwrrrrwwwdk.',
  '.kwwwwwwwwwwwdk.',
  '.kddddddddddddk.',
  '.kkkkkkkkkkkkkk.',
];

/**
 * Publer MCP — a month grid with a mains plug beneath it: a scheduling tool
 * exposed to an agent over MCP. The plug's prongs point up into the calendar,
 * which is the only way "plugs into" survives at this size.
 */
const publerMcp = [
  '.kkkkkkkkkkkkkk.',
  '.kBBBBBBBBBBBBk.',
  '.kkkkkkkkkkkkkk.',
  '.kwwwwwwwwwwwwk.',
  '.kwddwddwddwwwk.',
  '.kwwwwwwwwwwwwk.',
  '.kwddwddwddwwwk.',
  '.kwwwwwwwwwwwwk.',
  '.kwddwddwddwwwk.',
  '.kkkkkkkkkkkkkk.',
  '................',
  '...kwk...kwk....',
  '...kwk...kwk....',
  '.kkkkkkkkkkkkkk.',
  '.kwggggggggggdk.',
  '.kkkkkkkkkkkkkk.',
];

/**
 * Odoo fintech MCP — a coin whose right edge grows two plug prongs: an
 * accounting system turned into something an agent can connect to. Prongs on
 * the side, not below, so it does not share a silhouette with publer-mcp.
 */
const odooFintech = [
  '................',
  '....kkkkk.......',
  '..kkyyyyykk.....',
  '.kwyyyyyyyYk....',
  '.kwyyykyyyYk....',
  'kwyyyykyyyyYkkkk',
  'kwyykkkkkyyYkkkk',
  'kwyyyykyyyyYk...',
  'kwyykkkkkyyYkkkk',
  'kwyyyykyyyyYkkkk',
  '.kwyyykyyyYk....',
  '.kwyyyyyyyYk....',
  '..kkYYYYYkk.....',
  '....kkkkk.......',
  '................',
  '................',
];

/**
 * Playwright SaaS automator — a pointer sitting inside a browser window: a
 * script driving somebody else's UI. The window fill is silver rather than
 * white so the white pointer has something to be white against.
 */
const playwrightAutomator = [
  '.kkkkkkkkkkkkkk.',
  '.kBBBBBBBBBBggk.',
  '.kkkkkkkkkkkkkk.',
  '.kwggggggggggdk.',
  '.kwgkggggggggdk.',
  '.kwgkkgggggggdk.',
  '.kwgkwkggggggdk.',
  '.kwgkwwkgggggdk.',
  '.kwgkwwwkggggdk.',
  '.kwgkwwwwkgggdk.',
  '.kwgkwwwwwkggdk.',
  '.kwgkwwkkkkggdk.',
  '.kwgkwkgkwkggdk.',
  '.kwgkkggkkkggdk.',
  '.kkkkkkkkkkkkkk.',
  '................',
];

/** Copycat — one page laid over another it has just reproduced. */
const copycat = [
  '................',
  '....kkkkkkkkkk..',
  '....kwwwwwwwwk..',
  '....kwwwwwwwwk..',
  '..kkkkkkkkkkwk..',
  '..kwwwwwwwwkwk..',
  '..kwddddddwkwk..',
  '..kwwwwwwwwkwk..',
  '..kwddddddwkwk..',
  '..kwwwwwwwwkwk..',
  '..kwddddddwkwk..',
  '..kwwwwwwwwkkk..',
  '..kwwwwwwwwk....',
  '..kwddddddwk....',
  '..kkkkkkkkkk....',
  '................',
];

/**
 * ME-DT Framework — an eye watching a factory: anomaly detection over a
 * cyber-physical plant. Saw-tooth roof and chimney, because a plain box under
 * an eye reads as a house and turns the thesis into a doorbell camera.
 */
const medt = [
  '....kkkkkkkk....',
  '..kkwwwwwwwwkk..',
  '.kwwwwkkkkwwwwk.',
  'kwwwwkbbbbkwwwwk',
  'kwwwwkbbbbkwwwwk',
  '.kwwwwkkkkwwwwk.',
  '..kkwwwwwwwwkk..',
  '....kkkkkkkk....',
  '.kkk............',
  '.kdk.k...k...k..',
  '.kdk.kk..kk..kk.',
  '.kkkkkkkkkkkkkk.',
  '.kwggggggggggdk.',
  '.kwgkkgggkkggdk.',
  '.kwgkkgggkkggdk.',
  '.kkkkkkkkkkkkkk.',
];

/** rust-scraper — a spider sitting in the hub of a gear: a crawler, built as a
 *  machine part rather than a script. The hub is genuinely transparent, so the
 *  legs read against the explorer grid and the selection highlight alike. */
const rustScraper = [
  '................',
  '...kk..kk..kk...',
  '.kkkkkkkkkkkkkk.',
  '.kwggggggggggdk.',
  'kkwggggggggggdkk',
  'kkwggk....kggdkk',
  'kkwgg.k..k.ggdkk',
  'kkwggk.kk.kggdkk',
  'kkwggk.kk.kggdkk',
  'kkwgg.k..k.ggdkk',
  'kkwggk....kggdkk',
  '.kwggggggggggdk.',
  '.kkkkkkkkkkkkkk.',
  '...kk..kk..kk...',
  '................',
  '................',
];

/**
 * cf-worker-rust — a gear running under an edge cloud. The cloud is pushed
 * left and smaller than the one on ofive-cloud-provisioning so the two do not
 * share a silhouette; the gear is the subject here, the cloud the setting.
 */
const cfWorkerRust = [
  '................',
  '....kkkk........',
  '..kkwwwwkk......',
  '.kwwwwwwwwwk....',
  'kwwwwwwwwwwgk...',
  'kwwwwwwwwgggk...',
  'kkkkkkkkkkkkk...',
  '.....kk..kk.....',
  '...kkkkkkkkkk...',
  '...kwggggggdk...',
  '.kkkwgkkkkgdkkk.',
  '.kkkwgk..kgdkkk.',
  '.kkkwgk..kgdkkk.',
  '...kwgkkkkgdk...',
  '...kkkkkkkkkk...',
  '.....kk..kk.....',
];

/** WhatsApp bot — a message bubble talking to a handset. */
const wabot = [
  '.kkkkkkkkkkk....',
  'kwlllllllllLk...',
  'kwlwwwwwwwlLk...',
  'kwlllllllllLk...',
  'kwlwwwwwlllLk...',
  'kwlllllllllLk...',
  'kLLLLLLLLLLLk...',
  'kkkkkkkkkkkkk...',
  '..kLLk...kkkkkk.',
  '..kLk....kwccdk.',
  '..kk.....kwccdk.',
  '.........kwccdk.',
  '.........kwccdk.',
  '.........kkkkkk.',
  '.........kwdddk.',
  '.........kkkkkk.',
];

/**
 * linkedin-banner — a framed picture, mat and all: a generator whose whole
 * output is one image hung where people look. Sun top-left keeps the light
 * direction the rest of the set uses.
 */
const linkedinBanner = [
  '................',
  '.kkkkkkkkkkkkkk.',
  '.kwwwwwwwwwwwdk.',
  '.kwkkkkkkkkkkdk.',
  '.kwkcccccccckdk.',
  '.kwkccyycccckdk.',
  '.kwkccyycccckdk.',
  '.kwkcccccccckdk.',
  '.kwkcccLcccckdk.',
  '.kwkccLLLccckdk.',
  '.kwkcLLLLLLckdk.',
  '.kwkLLLLLLLLkdk.',
  '.kwkkkkkkkkkkdk.',
  '.kwwwwwwwwwwwdk.',
  '.kkkkkkkkkkkkkk.',
  '................',
];

/**
 * Stani i Hoxhës — a pine beside a pitched-roof cabin: a mountain guesthouse.
 * The tree is load-bearing, not decoration; the cabin on its own is the same
 * shape as any house icon ever drawn.
 */
const staniHoxhes = [
  '................',
  '................',
  '..kk............',
  '.klLk...........',
  '.klLk...........',
  'klLLLk....kk....',
  'klLLLk...kddk...',
  'klLLLk..kddddk..',
  'kkkkkk.kddddddk.',
  '..kRk.kddddddddk',
  '..kRk.kwRRRRRRk.',
  '..kRk.kwRRRRRRk.',
  '..kkk.kwRkkRRRk.',
  '......kwRkkRRRk.',
  '......kwRRRRRRk.',
  '......kkkkkkkkk.',
];

/**
 * Meridian Build — a hard hat. A tower crane was the other candidate and lost:
 * its jib is a one-pixel line at this size, which disappears the moment the
 * icon is drawn on the navy selection highlight.
 */
const meridianBuild = [
  '................',
  '................',
  '................',
  '......kkkk......',
  '.....kkyykk.....',
  '....kwykkyYk....',
  '...kwyykkyyYk...',
  '...kwyykkyyYk...',
  '..kwyyykkyyyYk..',
  '..kwyyykkyyyYk..',
  '..kwyyyyyyyyYk..',
  '.kkkkkkkkkkkkkk.',
  'kwyyyyyyyyyyyyYk',
  'kYYYYYYYYYYYYYYk',
  'kkkkkkkkkkkkkkkk',
  '................',
];

/** FloraCare — a two-leaf sprout in a terracotta pot: houseplant care. */
const floracare = [
  '................',
  '..........kkk...',
  '.........kllLk..',
  '........klllLk..',
  '.......kkllLk...',
  '..kkk..kk.......',
  '.klllLkkk.......',
  '..klllLkk.......',
  '...kkkkkk.......',
  '.......kk.......',
  '.kkkkkkkkkkkkkk.',
  '.kwrrrrrrrrrrRk.',
  '.kkkkkkkkkkkkkk.',
  '..kwrrrrrrrrRk..',
  '...kwrrrrrrRk...',
  '...kkkkkkkkkk...',
];

/** Mira Study — an open book under a lit bulb: revision, not reading. */
const miraStudy = [
  '.....kkkk.......',
  '...kkwwyykk.....',
  '..kwyyyyyyk.....',
  '..kwyyyyyyk.....',
  '..kwyyyyyyk.....',
  '...kyyyyyk......',
  '....kkkkk.......',
  '....kdddk.......',
  '..kkkkkkkkkkkk..',
  '.kwwwwwkkwwwwwk.',
  '.kwdddwkkwdddwk.',
  '.kwwwwwkkwwwwwk.',
  '.kwdddwkkwdddwk.',
  '.kwwwwwkkwwwwwk.',
  '.kdddddkkdddddk.',
  '.kkkkkkkkkkkkkk.',
];

/**
 * Win95 Architecture Deck — a presentation screen on its stand, carrying a bar
 * chart. The stand is what keeps this from reading as the same framed
 * rectangle as the schema table and the browser window.
 */
const win95Arch = [
  '.kkkkkkkkkkkkkk.',
  '.kwwwwwwwwwwwdk.',
  '.kwkkkkkkkwwwdk.',
  '.kwwwwwwwwwwwdk.',
  '.kwwwwwrrwwwwdk.',
  '.kwwwwwrrwLLwdk.',
  '.kwwwwwrrwLLwdk.',
  '.kwwbbwrrwLLwdk.',
  '.kwwbbwrrwLLwdk.',
  '.kwwbbwrrwLLwdk.',
  '.kwkkkkkkkkkkdk.',
  '.kkkkkkkkkkkkkk.',
  '.......kk.......',
  '.......kk.......',
  '.....kkkkkk.....',
  '....kkkkkkkk....',
];

/** Java Advanced Programming — the cup, steam and all. */
const javaAdvanced = [
  '....k..k..k.....',
  '...k..k..k......',
  '....k..k..k.....',
  '................',
  '.kkkkkkkkkkk....',
  '.kRRRRRRRRRk....',
  '.kwwwwwwwwdk....',
  '.kwwwwwwwwdkkkk.',
  '.kwwwwwwwwdk..k.',
  '.kwwwwwwwwdk..k.',
  '.kwwwwwwwwdkkkk.',
  '.kwwwwwwwwdk....',
  '..kwwwwwwwdk....',
  '..kkkkkkkkkk....',
  '.kkkkkkkkkkkkkk.',
  '.kddddddddddddk.',
];

/** MIPS Voting System — a marked ballot going into the slot of a sealed box. */
const mipsVoting = [
  '......kkkkk.....',
  '......kwwwk.....',
  '......kwddk.....',
  '......kwwwk.....',
  '......kwddk.....',
  '......kwwwk.....',
  '.kkkkkkkkkkkkkk.',
  '.kwggkkkkkkggdk.',
  '.kwggggggggggdk.',
  '.kwggggggggggdk.',
  '.kwgkkkkkkkkgdk.',
  '.kwgkwwwwwwkgdk.',
  '.kwgkkkkkkkkgdk.',
  '.kwggggggggggdk.',
  '.kkkkkkkkkkkkkk.',
  '................',
];

/** HamsterFaceRecognition — the hamster, since the dataset is the joke. */
const hamster = [
  '................',
  '..kkk......kkk..',
  '.kwyyk....kyyYk.',
  '.kwyykkkkkkyyYk.',
  '.kwyyyyyyyyyyYk.',
  'kwyyyyyyyyyyyyYk',
  'kwyykkyyyykkyyYk',
  'kwyykkyyyykkyyYk',
  'kwyyyyykkyyyyyYk',
  'kwyyyykwwkyyyyYk',
  'kwyyyyykkyyyyyYk',
  'kwyyyyyyyyyyyyYk',
  '.kwyyyyyyyyyyYk.',
  '..kkYYYYYYYYkk..',
  '....kkkkkkkk....',
  '................',
];

/** warehouse-inventory — a stock carton wearing its barcode label. */
const warehouse = [
  '................',
  '.kkkkkkkkkkkkkk.',
  '.kwYYYYYYYYYYYk.',
  '.kwYYYYYYYYYYYk.',
  '.kkkkkkkkkkkkkk.',
  '.kwyyyyyyyyyyYk.',
  '.kwyyyyyyyyyyYk.',
  '.kwykkkkkkkkyYk.',
  '.kwykwkwkkwkyYk.',
  '.kwykwkwkkwkyYk.',
  '.kwykwkwkkwkyYk.',
  '.kwykkkkkkkkyYk.',
  '.kwyyyyyyyyyyYk.',
  '.kwyyyyyyyyyyYk.',
  '.kkkkkkkkkkkkkk.',
  '................',
];

/**
 * ionic-project-work-1 — one handset whose screen is split on the diagonal
 * into two colours: a single codebase compiled to two native targets. The
 * split runs corner to corner so it cannot be mistaken for a loading bar.
 */
const ionicWork = [
  '..kkkkkkkkkkkk..',
  '..kwggggggggdk..',
  '..kwkkkkkkkkdk..',
  '..kwkbbbbbbkdk..',
  '..kwkbbbbbLkdk..',
  '..kwkbbbbLLkdk..',
  '..kwkbbbLLLkdk..',
  '..kwkbbLLLLkdk..',
  '..kwkbLLLLLkdk..',
  '..kwkLLLLLLkdk..',
  '..kwkLLLLLLkdk..',
  '..kwkkkkkkkkdk..',
  '..kwggggggggdk..',
  '..kwgggkkgggdk..',
  '..kwggggggggdk..',
  '..kkkkkkkkkkkk..',
];

export default {
  'proj-ofive-lead-engine': leadEngine,
  'proj-ofive-shared-schema': sharedSchema,
  'proj-ofive-cloud-provisioning': cloudProvisioning,
  'proj-mos-vono': mosVono,
  'proj-ecovolt': ecovolt,
  'proj-previsit': previsit,
  'proj-publer-mcp': publerMcp,
  'proj-mcp-odoo-fintech': odooFintech,
  'proj-playwright-saas-automator': playwrightAutomator,
  'proj-copycat': copycat,
  'proj-medt': medt,
  'proj-rust-scraper': rustScraper,
  'proj-cf-worker-rust': cfWorkerRust,
  'proj-wabot': wabot,
  'proj-linkedin-banner': linkedinBanner,
  'proj-stani-hoxhes': staniHoxhes,
  'proj-meridian-build': meridianBuild,
  'proj-floracare': floracare,
  'proj-mira-study': miraStudy,
  'proj-win95-arch': win95Arch,
  'proj-java-advanced': javaAdvanced,
  'proj-mips-voting': mipsVoting,
  'proj-hamster': hamster,
  'proj-warehouse': warehouse,
  'proj-ionic-work': ionicWork,
};
