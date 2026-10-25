import sitemap from "@astrojs/sitemap";
import { defineConfig, fontProviders } from "astro/config";

export default defineConfig({
  site: "https://joshshuman.com",
  trailingSlash: "always",
  // No code blocks on the site; Shiki's inline styles would conflict with the CSP.
  markdown: { syntaxHighlight: false },
  integrations: [sitemap({ filter: (page) => !page.endsWith("/404/") })],
  // Astro adds a CSP <meta> to every page with hashes of its own scripts and
  // styles. Directives a <meta> can't carry (frame-ancestors) live in
  // public/_headers, along with the policy for the Snake game page.
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ],
      styleDirective: {
        // The career timeline positions items with style="--x: …" attributes.
        resources: [
          { resource: "'self'", kind: "element" },
          { resource: "'unsafe-inline'", kind: "attribute" },
        ],
      },
    },
  },
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "IBM Plex Serif",
      cssVariable: "--font-serif",
      weights: [400],
      styles: ["normal", "italic"],
      subsets: ["latin"],
      fallbacks: ["Georgia", "Times New Roman", "serif"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "IBM Plex Sans",
      cssVariable: "--font-sans",
      weights: [400],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["system-ui", "sans-serif"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "IBM Plex Mono",
      cssVariable: "--font-mono",
      weights: [500],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["ui-monospace", "Consolas", "monospace"],
    },
  ],
});
