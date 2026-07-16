// Résumé content for the Nokia Resume screen — ported verbatim from
// public/cv.html (Experience + Education). Single source so the phone view and
// the printed CV never drift. The downloadable PDF is the desktop's /resume.pdf.
export const resume = {
  experience: [
    {
      role: 'Agent & Automation Specialist',
      org: 'Ofive Global',
      period: '07/2026 — Present',
      location: 'Onsite · Tirana, Albania',
    },
    {
      role: 'Freelance Software Engineer',
      org: 'Self-Employed',
      period: '01/2022 — 12/2024',
      location: 'Tirana, Albania',
    },
    {
      role: 'Web Developer',
      org: 'BS Concept',
      period: '01/2021 — 12/2021',
      location: 'Tirana, Albania',
    },
  ],
  education: [
    {
      role: "Bachelor's in Computer Science",
      org: 'Polis University',
      period: '09/2022 — 06/2026',
      location: 'Tirana',
    },
    {
      role: 'High School — Electronics',
      org: 'Harry T. Fultz',
      period: '09/2018 — 06/2022',
      location: 'Tirana',
    },
  ],
  pdf: '/resume.pdf',
};
