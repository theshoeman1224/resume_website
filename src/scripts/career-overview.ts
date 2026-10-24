// Applies a view (rows shown, years in focus) to the career overview chart and
// keeps it in the URL, so a layout can be shared as a link. The server renders
// the default view; this rebuilds the layout with the same pure code
// (src/lib/overview.ts) and patches positions and visibility in place, so the
// DOM, and the highlighting in career-links.ts, never change shape.

import { buildOverview, itemStyle, parseOverviewInputs, yearLabel, type Overview } from "../lib/overview";
import { DEFAULT_VIEW, fullCareerView, parseView, sameView, serializeView, type TimelineView } from "../lib/timeline-view";

const VIEW_PARAMS = new Set(["from", "to", "show"]);
const STATUS_MS = 3000;

/** Elements keyed by a data attribute's value. */
function byData(root: HTMLElement, attribute: string): Map<string, HTMLElement[]> {
  const map = new Map<string, HTMLElement[]>();
  for (const element of root.querySelectorAll<HTMLElement>(`[data-${attribute}]`)) {
    const key = element.getAttribute(`data-${attribute}`) ?? "";
    map.set(key, [...(map.get(key) ?? []), element]);
  }
  return map;
}

/** The current query with the view's params replaced, other params (e.g. utm_*) kept as they were. */
function queryWith(viewQuery: string): string {
  const others = location.search
    .slice(1)
    .split("&")
    .filter((pair) => pair !== "" && !VIEW_PARAMS.has(decodeURIComponent(pair.split("=")[0])));
  const query = [...others, ...(viewQuery ? [viewQuery] : [])].join("&");
  return query ? `?${query}` : "";
}

export function initCareerOverview(root: HTMLElement): void {
  try {
    setUp(root);
  } finally {
    root.removeAttribute("data-pending");
  }
}

function setUp(root: HTMLElement): void {
  const source = root.querySelector<HTMLScriptElement>("script[data-overview-inputs]");
  const controls = root.querySelector<HTMLElement>("[data-overview-controls]");
  if (!source?.textContent || !controls) return;

  const inputs = parseOverviewInputs(source.textContent);
  const context = buildOverview(inputs).context;
  const lanes = byData(root, "lane");
  const items = byData(root, "item");
  const years = byData(root, "year");
  const nows = root.querySelectorAll<HTMLElement>("[data-now]");
  const bands = root.querySelectorAll<HTMLElement>("[data-band]");
  const toggles = controls.querySelectorAll<HTMLInputElement>('input[name="show"]');
  const from = controls.querySelector<HTMLSelectElement>('select[name="from"]')!;
  const to = controls.querySelector<HTMLSelectElement>('select[name="to"]')!;
  const status = controls.querySelector<HTMLElement>("[data-status]")!;
  const button = (action: string) => controls.querySelector<HTMLButtonElement>(`[data-action="${action}"]`)!;
  let view: TimelineView = DEFAULT_VIEW;
  let statusTimer: ReturnType<typeof setTimeout> | undefined;

  function patch(overview: Overview): void {
    for (const lane of overview.lanes) {
      for (const element of lanes.get(lane.id) ?? []) {
        element.hidden = lane.hidden;
        element.style.setProperty("--rows", String(lane.rows));
      }
      for (const item of lane.items) {
        for (const element of items.get(item.key) ?? []) {
          element.hidden = item.hidden;
          element.setAttribute("style", itemStyle(item));
          element.toggleAttribute("data-flip", item.flip);
          element.toggleAttribute("data-compact", item.compact);
        }
      }
    }
    for (const marker of overview.years) {
      for (const element of years.get(String(marker.year)) ?? []) {
        element.style.setProperty("--x", `${marker.position}%`);
        // Axis labels carry the text; gridlines are empty spans.
        if (element.tagName === "LI") {
          element.hidden = !marker.labelled;
          element.toggleAttribute("data-compressed", marker.compressed);
          element.textContent = yearLabel(marker);
        }
      }
    }
    nows.forEach((element) => element.style.setProperty("--x", `${overview.now}%`));
    bands.forEach((element, index) => {
      const band = overview.bands[index];
      element.hidden = !band;
      if (band) element.setAttribute("style", `--start: ${band.start}%; --end: ${band.end}%`);
    });
  }

  function syncControls(): void {
    toggles.forEach((toggle) => (toggle.checked = view.show === null || view.show.includes(toggle.value)));
    from.value = String(view.from);
    to.value = view.to === null ? "now" : String(view.to);
    // aria-disabled rather than disabled, so a button doesn't drop keyboard focus as it is used.
    button("reset").setAttribute("aria-disabled", String(sameView(view, DEFAULT_VIEW, context)));
    button("full").setAttribute("aria-disabled", String(sameView(view, fullCareerView(context), context)));
  }

  function show(next: TimelineView, { updateUrl }: { updateUrl: boolean }): void {
    const overview = buildOverview(inputs, next);
    view = overview.view;
    patch(overview);
    syncControls();
    if (updateUrl) {
      history.replaceState(history.state, "", `${location.pathname}${queryWith(serializeView(view, context))}${location.hash}`);
    }
  }

  function viewFromControls(): TimelineView {
    return {
      from: Number(from.value),
      to: to.value === "now" ? null : Number(to.value),
      show: [...toggles].filter((toggle) => toggle.checked).map((toggle) => toggle.value),
    };
  }

  function announce(message: string): void {
    status.textContent = message;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => (status.textContent = ""), STATUS_MS);
  }

  async function copyLink(): Promise<void> {
    const url = `${location.origin}${location.pathname}${queryWith(serializeView(view, context))}#timeline`;
    try {
      await navigator.clipboard.writeText(url);
      announce("Link copied");
    } catch {
      announce("Couldn't copy. The address bar has the link.");
    }
  }

  controls.addEventListener("change", () => show(viewFromControls(), { updateUrl: true }));
  button("full").addEventListener("click", () => show(fullCareerView(context), { updateUrl: true }));
  button("reset").addEventListener("click", () => show(DEFAULT_VIEW, { updateUrl: true }));
  button("copy").addEventListener("click", () => void copyLink());

  show(parseView(new URLSearchParams(location.search), context), { updateUrl: false });
}
