// Facts about Josh used by more than one page (home, resume), kept in one place
// so the printable resume never drifts from the site.

export const profile = {
  name: "Josh Shuman",
  title: "Principal Software Engineer",
  site: "joshshuman.com",
  summary:
    "Principal software engineer for real-time radar signal processing on embedded hardware: DSP code, software architecture, and the technical direction behind them. Open to principal or lead roles in DSP, embedded, or systems work.",
  contact: [
    { label: "Email", text: "contact@joshshuman.com", href: "mailto:contact@joshshuman.com" },
    { label: "LinkedIn", text: "josh-shuman", href: "https://www.linkedin.com/in/josh-shuman/" },
    { label: "GitHub", text: "theshoeman1224", href: "https://github.com/theshoeman1224" },
  ],
  skills: [
    { group: "Build", items: ["C / C++", "Rust", "Python", "TypeScript"] },
    { group: "Engineer", items: ["DSP systems", "Embedded systems", "Performance analysis", "Software architecture"] },
    { group: "Lead", items: ["Technical direction", "Engineering mentorship", "DevSecOps", "Applied AI"] },
  ],
} as const;
