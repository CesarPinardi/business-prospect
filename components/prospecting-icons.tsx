import type { IconName } from "./prospecting-workspace-types";

export function Icon({ name }: { name: IconName }) {
  const commonProps = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: false,
  };

  if (name === "dashboard") {
    return <svg {...commonProps}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>;
  }

  if (name === "search") {
    return <svg {...commonProps}><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></svg>;
  }

  if (name === "leads") {
    return <svg {...commonProps}><circle cx="9" cy="8" r="3" /><path d="M3.8 19c.6-3 2.2-4.6 5.2-4.6s4.6 1.6 5.2 4.6" /><path d="M16 5.5a3 3 0 0 1 0 5.8M17 14.7c1.9.7 3.1 2.1 3.5 4.3" /></svg>;
  }

  if (name === "pipeline") {
    return <svg {...commonProps}><path d="M4 6h16M4 12h11M4 18h7" /><circle cx="19" cy="12" r="2" /><circle cx="13" cy="18" r="2" /><circle cx="8" cy="6" r="2" /></svg>;
  }

  if (name === "settings") {
    return <svg {...commonProps}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.8 1.8 0 0 0 .4 2l.1.1-1.8 1.8-.1-.1a1.8 1.8 0 0 0-2-.4 1.8 1.8 0 0 0-1.1 1.7v.2h-2.6v-.2a1.8 1.8 0 0 0-1.1-1.7 1.8 1.8 0 0 0-2 .4l-.1.1-1.8-1.8.1-.1a1.8 1.8 0 0 0 .4-2 1.8 1.8 0 0 0-1.7-1.1H6v-2.6h.2a1.8 1.8 0 0 0 1.7-1.1 1.8 1.8 0 0 0-.4-2l-.1-.1 1.8-1.8.1.1a1.8 1.8 0 0 0 2 .4 1.8 1.8 0 0 0 1.1-1.7V5h2.6v.2a1.8 1.8 0 0 0 1.1 1.7 1.8 1.8 0 0 0 2-.4l.1-.1 1.8 1.8-.1.1a1.8 1.8 0 0 0-.4 2 1.8 1.8 0 0 0 1.7 1.1h.2V14h-.2a1.8 1.8 0 0 0-1.7 1Z" /></svg>;
  }

  if (name === "arrow") {
    return <svg {...commonProps}><path d="M5 12h13" /><path d="m13 6 6 6-6 6" /></svg>;
  }

  if (name === "spark") {
    return <svg {...commonProps}><path d="m12 3 1.3 5.7L19 10l-5.7 1.3L12 17l-1.3-5.7L5 10l5.7-1.3L12 3Z" /><path d="m19 16 .5 2.5L22 19l-2.5.5L19 22l-.5-2.5L16 19l2.5-.5L19 16Z" /></svg>;
  }

  if (name === "activity") {
    return <svg {...commonProps}><path d="M3 12h4l2-6 4 12 2-6h6" /></svg>;
  }

  if (name === "map") {
    return <svg {...commonProps}><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>;
  }

  return <svg {...commonProps}><circle cx="12" cy="8" r="3" /><path d="M5 20c.8-3.5 3.1-5.4 7-5.4s6.2 1.9 7 5.4" /></svg>;
}
