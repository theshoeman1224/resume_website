// Cross-highlighting for the experience page. Every element with a `data-key`
// (a role, work project or win, in the overview chart or the record) lists the
// keys it is linked to in `data-related`. Pointing at or focusing one marks it
// and everything related with `data-lit`; CSS decides how that looks.
// Navigation itself is plain links, so the page works without this script.

export function initCareerLinks(root: HTMLElement): void {
  const items = Array.from(root.querySelectorAll<HTMLElement>("[data-key]"));
  let active: HTMLElement | null = null;

  function light(source: HTMLElement | null): void {
    if (source === active) return;
    active = source;
    const lit = new Set(source ? [source.dataset.key, ...(source.dataset.related ?? "").split(" ")] : []);
    for (const item of items) {
      item.toggleAttribute("data-lit", lit.has(item.dataset.key));
    }
  }

  const keyedAncestor = (target: EventTarget | null) =>
    target instanceof Element ? target.closest<HTMLElement>("[data-key]") : null;

  // Only fine pointers: on touch, a tap is a navigation, and a lingering highlight would be noise.
  const hover = window.matchMedia("(hover: hover)");
  root.addEventListener("pointerover", (event) => {
    if (hover.matches) light(keyedAncestor(event.target));
  });
  root.addEventListener("pointerleave", () => light(null));
  root.addEventListener("focusin", (event) => light(keyedAncestor(event.target)));
  root.addEventListener("focusout", (event) => {
    if (!root.contains(event.relatedTarget as Node | null)) light(null);
  });
}
