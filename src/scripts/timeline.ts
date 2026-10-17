// Behaviour for the experience timeline (src/components/Timeline.astro).
//
// Each role's <details> element is the source of truth for whether it is open.
// Spine buttons, the URL hash, and the connector line follow its `toggle` event.

const ALL = "All";
// Deliberately not the <details> ids (role-detail-*), so the browser's own
// fragment scroll doesn't fight the script's.
const HASH_PREFIX = "#role-";

export function initTimeline(root: HTMLElement): void {
  const spine = root.querySelector<HTMLElement>("[data-timeline-spine]");
  const nodes = Array.from(root.querySelectorAll<HTMLButtonElement>("[data-role-node]"));
  const details = Array.from(root.querySelectorAll<HTMLDetailsElement>("[data-role-detail]"));
  const filterButtons = Array.from(root.querySelectorAll<HTMLButtonElement>("[data-timeline-filter]"));
  const status = root.querySelector<HTMLElement>("[data-timeline-status]");

  const nodeById = new Map(nodes.map((node) => [node.dataset.roleNode ?? "", node]));
  const detailById = new Map(details.map((detail) => [detail.dataset.roleDetail ?? "", detail]));

  /** The spine is hidden by CSS on narrow screens; then the <summary> rows are the controls. */
  const spineShown = () => spine !== null && spine.getClientRects().length > 0;

  function controlFor(id: string): HTMLElement | null {
    if (spineShown()) return nodeById.get(id) ?? null;
    return detailById.get(id)?.querySelector("summary") ?? null;
  }

  // Roving tabindex: the spine is one tab stop; arrow keys move between roles.
  function setTabStop(target: HTMLButtonElement): void {
    for (const node of nodes) node.tabIndex = node === target ? 0 : -1;
  }
  if (nodes[0]) setTabStop(nodes[0]);

  function open(id: string, options: { focus?: boolean; fromLink?: boolean } = {}): void {
    const detail = detailById.get(id);
    if (!detail) return;
    // `name` makes these an exclusive group; close the rest too for browsers without it.
    for (const other of details) if (other !== detail) other.open = false;
    detail.open = true;
    requestAnimationFrame(() => {
      // A deep link lands on the whole timeline so the selected spine marker is in view.
      if (options.fromLink && spineShown()) root.scrollIntoView({ block: "start" });
      else reveal(detail);
      if (options.focus) controlFor(id)?.focus({ preventScroll: true });
    });
  }

  function close(detail: HTMLDetailsElement, options: { focus?: boolean } = {}): void {
    detail.open = false;
    if (options.focus) controlFor(detail.dataset.roleDetail ?? "")?.focus();
  }

  /** Scrolls just enough to show the opened role without pushing its top under the sticky header. */
  function reveal(detail: HTMLElement): void {
    const header = document.querySelector(".site-header");
    const topLimit = (header?.getBoundingClientRect().height ?? 0) + 16;
    const rect = detail.getBoundingClientRect();
    const overflowBelow = rect.bottom - (window.innerHeight - 16);
    const roomAbove = rect.top - topLimit;
    const delta = Math.min(overflowBelow, roomAbove);
    // Smoothness follows the CSS scroll-behavior, which respects reduced motion.
    if (delta > 0) window.scrollBy({ top: delta });
  }

  function onToggle(detail: HTMLDetailsElement): void {
    const id = detail.dataset.roleDetail ?? "";
    const node = nodeById.get(id);
    node?.setAttribute("aria-expanded", String(detail.open));

    if (detail.open) {
      if (node) setTabStop(node);
      if (spine && node) {
        spine.style.setProperty("--selected-x", node.style.getPropertyValue("--role-x"));
        spine.dataset.selected = id;
      }
      showCard(detail, 0);
      history.replaceState(null, "", HASH_PREFIX + id);
    } else {
      if (spine?.dataset.selected === id) delete spine.dataset.selected;
      if (location.hash === HASH_PREFIX + id) {
        history.replaceState(null, "", location.pathname + location.search);
      }
    }
  }

  // Accomplishment carousel (wide screens only; CSS shows every card when narrow).
  function cards(detail: HTMLElement): HTMLElement[] {
    return Array.from(detail.querySelectorAll<HTMLElement>("[data-carousel-item]"));
  }

  function currentCard(detail: HTMLElement): number {
    return Math.max(0, cards(detail).findIndex((item) => item.hasAttribute("data-active")));
  }

  function showCard(detail: HTMLElement, index: number, direction = 0): void {
    const items = cards(detail);
    if (items.length < 2) return;
    const target = Math.max(0, Math.min(index, items.length - 1));
    items.forEach((item, i) => item.toggleAttribute("data-active", i === target));

    const count = detail.querySelector("[data-carousel-count]");
    if (count) count.textContent = `${target + 1} / ${items.length}`;

    const prev = detail.querySelector<HTMLButtonElement>("[data-carousel-prev]");
    const next = detail.querySelector<HTMLButtonElement>("[data-carousel-next]");
    const focused = document.activeElement;
    if (prev) prev.disabled = target === 0;
    if (next) next.disabled = target === items.length - 1;
    // Don't strand keyboard focus on a button that just became disabled.
    if (focused === prev && prev?.disabled) next?.focus();
    if (focused === next && next?.disabled) prev?.focus();

    if (direction !== 0) {
      const item = items[target];
      item.dataset.enter = direction > 0 ? "next" : "prev";
      item.addEventListener("animationend", () => delete item.dataset.enter, { once: true });
    }
  }

  function stepCard(detail: HTMLElement, delta: number): void {
    showCard(detail, currentCard(detail) + delta, delta);
  }

  function applyFilter(category: string): void {
    for (const button of filterButtons) {
      button.setAttribute("aria-pressed", String(button.dataset.timelineFilter === category));
    }
    let matching = 0;
    for (const [id, detail] of detailById) {
      const categories = (detail.dataset.categories ?? "").split("|");
      const matches = category === ALL || categories.includes(category);
      if (matches) matching += 1;
      for (const element of [detail, nodeById.get(id)]) {
        if (!element) continue;
        element.toggleAttribute("data-filtered-out", !matches);
        const note = element.querySelector<HTMLElement>("[data-filter-note]");
        if (note) note.hidden = matches;
      }
    }
    if (status) {
      const total = details.length;
      status.textContent =
        category === ALL ? `${total} roles` : `${matching} of ${total} roles match ${category}`;
    }
  }

  // Wiring

  for (const detail of details) {
    detail.addEventListener("toggle", () => onToggle(detail));
    detail.querySelector("[data-role-close]")?.addEventListener("click", () => close(detail, { focus: true }));
    detail.querySelector("[data-carousel-prev]")?.addEventListener("click", () => stepCard(detail, -1));
    detail.querySelector("[data-carousel-next]")?.addEventListener("click", () => stepCard(detail, 1));
  }

  for (const node of nodes) {
    node.addEventListener("click", () => {
      const detail = detailById.get(node.dataset.roleNode ?? "");
      if (!detail) return;
      if (detail.open) close(detail);
      else open(node.dataset.roleNode ?? "");
    });
  }

  root.addEventListener("click", (event) => {
    const link = (event.target as Element).closest<HTMLElement>("[data-role-link]");
    if (link) open(link.dataset.roleLink ?? "", { focus: true });
  });

  for (const button of filterButtons) {
    button.addEventListener("click", () => applyFilter(button.dataset.timelineFilter ?? ALL));
  }

  root.addEventListener("keydown", (event) => {
    const target = event.target as HTMLElement;

    if (event.key === "Escape") {
      const detail =
        target.closest<HTMLDetailsElement>("details[open][data-role-detail]") ??
        (target.matches("[data-role-node]") ? detailById.get(target.dataset.roleNode ?? "") : undefined);
      if (detail?.open) {
        event.preventDefault();
        close(detail, { focus: true });
      }
      return;
    }

    const horizontal = event.key === "ArrowLeft" || event.key === "ArrowRight";

    if (horizontal && target.closest("[data-carousel-nav]")) {
      const detail = target.closest<HTMLElement>("[data-role-detail]");
      if (detail) {
        event.preventDefault();
        stepCard(detail, event.key === "ArrowRight" ? 1 : -1);
      }
      return;
    }

    if (target.matches("[data-role-node]") && (horizontal || event.key === "Home" || event.key === "End")) {
      const index = nodes.indexOf(target as HTMLButtonElement);
      const last = nodes.length - 1;
      const next =
        event.key === "Home" ? 0
        : event.key === "End" ? last
        : event.key === "ArrowRight" ? Math.min(index + 1, last)
        : Math.max(index - 1, 0);
      event.preventDefault();
      setTabStop(nodes[next]);
      nodes[next].focus();
    }
  });

  applyFilter(ALL);

  const openFromHash = () => {
    if (location.hash.startsWith(HASH_PREFIX)) {
      open(location.hash.slice(HASH_PREFIX.length), { fromLink: true });
    }
  };
  openFromHash();
  window.addEventListener("hashchange", openFromHash);
}
