// Builds the JSON-LD @graph for the site from src/data/identity.js and
// src/data/projects.js. Pure functions — scripts/generate-static.js writes the
// result into index.html and public/cv.html between markers.
//
// Design notes, because the shape here is deliberate:
//
//   * One Person node with a stable @id. Every other node references it by @id
//     instead of restating the person. Search engines and LLM retrieval
//     pipelines use that identifier to reconcile scattered mentions into a
//     single entity; five half-described Person objects resolve to nothing.
//   * ProfilePage wraps the Person via mainEntity. Google documents mainEntity
//     and name as the only required properties, and lists an "About Me" page on
//     a personal site as a valid use.
//   * hasOccupation -> Occupation.occupationLocation is the one property pair
//     schema.org provides for "this role, in this place". It is the closest
//     machine-readable expression of "software engineer in Tirana".
//   * knowsAbout entries are Things with a Wikipedia sameAs rather than bare
//     strings, so a topic resolves to a known entity instead of a token.
//
// What this does NOT do: make anyone rank. Google has been explicit that
// structured data is not a ranking factor. This is disambiguation plumbing —
// it makes a correct answer possible, it does not manufacture authority.

import { identity, IDS } from '../src/data/identity.js';
import { projects } from '../src/data/projects.js';

function place(scope) {
  return scope === 'city'
    ? {
        '@type': 'City',
        name: identity.city.name,
        sameAs: identity.city.wikidata,
        containedInPlace: {
          '@type': 'Country',
          name: identity.country.name,
          sameAs: identity.country.wikidata,
        },
      }
    : {
        '@type': 'Country',
        name: identity.country.name,
        sameAs: identity.country.wikidata,
      };
}

export function buildPerson() {
  return {
    '@type': 'Person',
    '@id': IDS.person,
    name: identity.name,
    givenName: identity.givenName,
    familyName: identity.familyName,
    jobTitle: identity.jobTitle,
    description: identity.description,
    url: `${identity.origin}/`,
    // The URL form, not an @id reference: the CV page emits this same Person
    // node without declaring the home ProfilePage, and a node reference that
    // resolves to nothing is worse than a plain canonical URL.
    mainEntityOfPage: `${identity.origin}/`,
    email: `mailto:${identity.email}`,
    worksFor: { '@id': IDS.employer },
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: identity.alumniOf.name,
      url: identity.alumniOf.url,
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: identity.city.name,
      addressCountry: identity.country.code,
    },
    homeLocation: place('city'),
    nationality: {
      '@type': 'Country',
      name: identity.country.name,
      sameAs: identity.country.wikidata,
    },
    knowsLanguage: identity.languages.map((l) => ({
      '@type': 'Language',
      name: l.name,
      alternateName: l.code,
    })),
    hasOccupation: identity.occupations.map((o) => ({
      '@type': 'Occupation',
      name: o.name,
      occupationLocation: place(o.scope),
      skills: o.skills,
    })),
    knowsAbout: identity.knowsAbout.map(([name, sameAs]) => ({
      '@type': 'Thing',
      name,
      sameAs,
    })),
    sameAs: identity.sameAs,
  };
}

export function buildEmployer() {
  return {
    '@type': 'Organization',
    '@id': IDS.employer,
    name: identity.employer.name,
    url: identity.employer.url,
  };
}

export function buildWebSite() {
  return {
    '@type': 'WebSite',
    '@id': IDS.website,
    url: `${identity.origin}/`,
    name: identity.name,
    inLanguage: 'en',
    about: { '@id': IDS.person },
    publisher: { '@id': IDS.person },
  };
}

export function buildProfilePage({ id, url, dateModified }) {
  return {
    '@type': 'ProfilePage',
    '@id': id,
    url,
    name: `${identity.name} — ${identity.jobTitle}`,
    dateModified,
    isPartOf: { '@id': IDS.website },
    mainEntity: { '@id': IDS.person },
  };
}

// Only projects with a public destination become nodes. A SoftwareSourceCode
// node whose url 404s (or points at a private repo) is a claim nothing can
// verify, which is the opposite of what this markup is for.
export function buildProjects(list = projects) {
  return list
    .filter((p) => p.link)
    .map((p) => {
      const isRepo = p.link.href.includes('github.com');
      return {
        '@type': isRepo ? 'SoftwareSourceCode' : 'CreativeWork',
        '@id': `${identity.origin}/#project-${p.id}`,
        name: p.name,
        description: p.description,
        url: p.link.href,
        ...(isRepo ? { codeRepository: p.link.href } : {}),
        ...(isRepo ? { programmingLanguage: p.stack.slice(0, 3) } : {}),
        keywords: p.stack.join(', '),
        author: { '@id': IDS.person },
        isPartOf: { '@id': IDS.website },
      };
    });
}

export function buildGraph({ page = 'home', dateModified }) {
  const profile =
    page === 'cv'
      ? buildProfilePage({
          id: IDS.cvPage,
          url: `${identity.origin}/cv.html`,
          dateModified,
        })
      : buildProfilePage({
          id: IDS.profilePage,
          url: `${identity.origin}/`,
          dateModified,
        });

  // The CV is a second view of the same person, not a second person. It carries
  // the identity nodes by reference and skips the project list, which lives on
  // the home page graph.
  const nodes =
    page === 'cv'
      ? [buildPerson(), buildEmployer(), buildWebSite(), profile]
      : [buildPerson(), buildEmployer(), buildWebSite(), profile, ...buildProjects()];

  return { '@context': 'https://schema.org', '@graph': nodes };
}

export function renderGraph(options) {
  return JSON.stringify(buildGraph(options), null, 2);
}
