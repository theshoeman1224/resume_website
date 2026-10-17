// Shared by the content schema (src/content.config.ts) and the metadata sync
// script (scripts/lib/validate-project.mjs). Plain JS so Node can import it
// without a TypeScript build step.

export const PROJECT_STATUSES = /** @type {const} */ ([
  "active",
  "complete",
  "experimental",
  "prototype",
  "archived",
]);

export const PROJECT_DEMO_TYPES = /** @type {const} */ (["none", "wasm", "web", "external"]);
