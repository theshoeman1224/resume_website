import { defineConfig, fontProviders } from "astro/config";

export default defineConfig({
  site: "https://joshshuman.com",
  trailingSlash: "always",
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
      weights: [400, 600],
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
