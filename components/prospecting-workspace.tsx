"use client";

import { useState } from "react";

type ViewId = "dashboard" | "search" | "leads" | "pipeline" | "settings";
type IconName = "dashboard" | "search" | "leads" | "pipeline" | "settings" | "arrow" | "spark" | "activity" | "map" | "profile";

type NavigationItem = {
  id: ViewId;
  label: string;
  icon: IconName;
};

const navigation: NavigationItem[] = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "search", label: "Search", icon: "search" },
  { id: "leads", label: "Leads", icon: "leads" },
  { id: "pipeline", label: "Pipeline", icon: "pipeline" },
  { id: "settings", label: "Settings", icon: "settings" },
];

const viewMeta: Record<ViewId, { eyebrow: string; title: string }> = {
  dashboard: { eyebrow: "Workspace", title: "Dashboard" },
  search: { eyebrow: "Prospecting", title: "Search" },
  leads: { eyebrow: "Prospecting", title: "Leads" },
  pipeline: { eyebrow: "Follow-up", title: "Pipeline" },
  settings: { eyebrow: "Workspace", title: "Settings" },
};

const pipelineStages = ["New", "Contacted", "Interested", "Follow-up", "Won", "Not interested"];

export function ProspectingWorkspace() {
  const [activeView, setActiveView] = useState<ViewId>("dashboard");

  const goTo = (view: ViewId) => {
    setActiveView(view);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Workspace sidebar">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div>
            <p className="brand-name">Prospect</p>
            <p className="brand-caption">local workspace</p>
          </div>
        </div>

        <nav className="primary-nav" aria-label="Primary navigation">
          <p className="nav-label">Workspace</p>
          {navigation.map((item) => (
            <button
              className={`nav-item${activeView === item.id ? " is-active" : ""}`}
              key={item.id}
              type="button"
              aria-current={activeView === item.id ? "page" : undefined}
              onClick={() => goTo(item.id)}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
              {item.id === "leads" && <span className="nav-count" aria-hidden="true">0</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="provider-card">
            <div className="provider-icon"><Icon name="spark" /></div>
            <div>
              <p className="provider-label">Provider</p>
              <p className="provider-name">Demo mode</p>
            </div>
            <span className="status-dot" aria-label="Active" />
          </div>
          <p className="local-note"><Icon name="activity" /> Data stays on this device</p>
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <div className="breadcrumb" aria-label="Current location">
            <span>{viewMeta[activeView].eyebrow}</span>
            <span className="breadcrumb-divider">/</span>
            <strong>{viewMeta[activeView].title}</strong>
          </div>
          <div className="topbar-actions">
            <div className="mode-pill"><span className="status-dot" /> Demo mode</div>
            <div className="avatar" aria-label="Local workspace profile">CP</div>
          </div>
        </header>

        <main className="page-content">
          {activeView === "dashboard" && <DashboardView onNavigate={goTo} />}
          {activeView === "search" && <SearchView />}
          {activeView === "leads" && <LeadsView onNavigate={goTo} />}
          {activeView === "pipeline" && <PipelineView />}
          {activeView === "settings" && <SettingsView />}
        </main>
      </div>
    </div>
  );
}

function DashboardView({ onNavigate }: { onNavigate: (view: ViewId) => void }) {
  return (
    <section className="view" aria-labelledby="dashboard-title">
      <div className="hero-grid">
        <div className="page-intro">
          <p className="eyebrow">Wednesday, September 2</p>
          <h1 id="dashboard-title">Good morning, prospector.</h1>
          <p className="intro-copy">Find the right local businesses, start useful conversations, and keep every follow-up in view.</p>
          <button className="button button-primary" type="button" onClick={() => onNavigate("search")}>
            Start a search <Icon name="arrow" />
          </button>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="hero-pin"><Icon name="map" /></div>
          <span className="hero-spark spark-one">✦</span>
          <span className="hero-spark spark-two">·</span>
          <span className="hero-spark spark-three">✦</span>
        </div>
      </div>

      <div className="stats-grid" aria-label="Workspace overview">
        <StatCard label="Saved leads" value="0" detail="Ready for your first find" icon="leads" tone="mint" />
        <StatCard label="Active follow-ups" value="0" detail="Nothing due today" icon="activity" tone="peach" />
        <StatCard label="Searches this week" value="0" detail="Demo search is available" icon="search" tone="lavender" />
      </div>

      <div className="dashboard-grid">
        <section className="panel activity-panel" aria-labelledby="activity-title">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Keep momentum</p>
              <h2 id="activity-title">Recent activity</h2>
            </div>
            <button className="text-button" type="button" onClick={() => onNavigate("pipeline")}>View pipeline <Icon name="arrow" /></button>
          </div>
          <EmptyState
            icon="activity"
            title="Your workspace is clear"
            description="Search for a business to start building your prospect list."
            actionLabel="Explore Search"
            onAction={() => onNavigate("search")}
            compact
          />
        </section>

        <section className="panel mode-panel" aria-labelledby="mode-title">
          <div className="mode-panel-top">
            <div className="mode-icon"><Icon name="spark" /></div>
            <span className="live-label"><span className="status-dot" /> Active</span>
          </div>
          <p className="eyebrow">Current provider</p>
          <h2 id="mode-title">Demo mode</h2>
          <p>Explore the workspace with deterministic sample data. No Google key or external service is needed.</p>
          <div className="mode-divider" />
          <p className="mode-footnote"><Icon name="activity" /> Local-first by design</p>
        </section>
      </div>
    </section>
  );
}

function SearchView() {
  return (
    <section className="view" aria-labelledby="search-title">
      <div className="page-intro compact-intro">
        <p className="eyebrow">Prospecting workspace</p>
        <h1 id="search-title">Find your next conversation.</h1>
        <p className="intro-copy">Set a location and niche to discover local businesses worth reaching out to.</p>
      </div>

      <div className="search-shell">
        <div className="search-form-panel panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Search setup</p>
              <h2>Define your area</h2>
            </div>
            <div className="step-badge">01 <span>of</span> 01</div>
          </div>
          <div className="form-stack">
            <label className="field-label" htmlFor="search-city">City</label>
            <select className="field-control" id="search-city" defaultValue="">
              <option value="">Select a city</option>
              <option value="jundiai">Jundiaí, Brazil</option>
              <option value="sao-paulo">São Paulo, Brazil</option>
              <option value="lisbon">Lisbon, Portugal</option>
            </select>

            <label className="field-label" htmlFor="search-niche">Business niche</label>
            <input className="field-control" id="search-niche" type="text" placeholder="e.g. dental clinics, coffee shops" />

            <label className="field-label" htmlFor="search-radius">Radius</label>
            <select className="field-control" id="search-radius" defaultValue="5">
              <option value="1">1 km</option>
              <option value="3">3 km</option>
              <option value="5">5 km</option>
              <option value="10">10 km</option>
            </select>
          </div>
          <div className="form-note"><Icon name="spark" /> Demo results will use sample businesses and stay on this device.</div>
          <button className="button button-primary button-wide" type="button" disabled>
            Search businesses <Icon name="arrow" />
          </button>
          <p className="disabled-note">Search setup is ready for your first Demo search.</p>
        </div>

        <div className="search-empty panel">
          <div className="empty-map" aria-hidden="true">
            <div className="map-grid" />
            <div className="map-circle" />
            <div className="map-marker marker-left"><Icon name="map" /></div>
            <div className="map-marker marker-right"><Icon name="map" /></div>
            <div className="map-marker marker-center"><Icon name="map" /></div>
          </div>
          <EmptyState
            icon="search"
            title="No search results yet"
            description="Choose a city and niche to see matching businesses here."
            compact
          />
        </div>
      </div>
    </section>
  );
}

function LeadsView({ onNavigate }: { onNavigate: (view: ViewId) => void }) {
  return (
    <section className="view" aria-labelledby="leads-title">
      <div className="page-intro compact-intro">
        <p className="eyebrow">Your prospects</p>
        <h1 id="leads-title">Leads worth following.</h1>
        <p className="intro-copy">Businesses you choose to save will live here, ready for a thoughtful next step.</p>
      </div>
      <section className="panel full-empty-panel">
        <EmptyState
          icon="leads"
          title="No leads saved yet"
          description="Your saved businesses will appear here. Start with a Demo search and choose the prospects that feel like a fit."
          actionLabel="Find businesses"
          onAction={() => onNavigate("search")}
        />
      </section>
    </section>
  );
}

function PipelineView() {
  return (
    <section className="view" aria-labelledby="pipeline-title">
      <div className="page-intro compact-intro">
        <p className="eyebrow">Move conversations forward</p>
        <h1 id="pipeline-title">Your pipeline, at a glance.</h1>
        <p className="intro-copy">Keep every prospect moving from first hello to a clear outcome.</p>
      </div>
      <div className="stage-strip" aria-label="Pipeline stages">
        {pipelineStages.map((stage, index) => (
          <div className="stage-chip" key={stage}>
            <span className="stage-number">0{index + 1}</span>
            <span>{stage}</span>
          </div>
        ))}
      </div>
      <section className="panel full-empty-panel pipeline-empty-panel">
        <EmptyState
          icon="pipeline"
          title="Your pipeline is clear"
          description="Saved leads will land in New. From there, you can keep the next action visible without losing the thread."
          compact
        />
      </section>
    </section>
  );
}

function SettingsView() {
  return (
    <section className="view" aria-labelledby="settings-title">
      <div className="page-intro compact-intro">
        <p className="eyebrow">Make it yours</p>
        <h1 id="settings-title">Your workspace settings.</h1>
        <p className="intro-copy">A few details will make future outreach feel personal and ready to send.</p>
      </div>
      <section className="panel settings-panel">
        <div className="settings-header">
          <div className="settings-icon"><Icon name="profile" /></div>
          <div>
            <p className="eyebrow">Personal profile</p>
            <h2>No profile details yet</h2>
            <p>Set up your name, business, service, and base message when you are ready.</p>
          </div>
        </div>
        <div className="settings-preview-grid">
          <SettingPreview label="Your name" />
          <SettingPreview label="Business name" />
          <SettingPreview label="Offered service" />
          <SettingPreview label="Base message" wide />
        </div>
        <button className="button button-secondary" type="button" disabled>Profile settings coming next</button>
      </section>
    </section>
  );
}

function SettingPreview({ label, wide = false }: { label: string; wide?: boolean }) {
  return (
    <div className={`setting-preview${wide ? " setting-preview-wide" : ""}`}>
      <span>{label}</span>
      <strong>Not set</strong>
    </div>
  );
}

function StatCard({ label, value, detail, icon, tone }: { label: string; value: string; detail: string; icon: IconName; tone: string }) {
  return (
    <div className={`stat-card stat-${tone}`}>
      <div className="stat-card-heading">
        <span className="stat-icon"><Icon name={icon} /></span>
        <span>{label}</span>
      </div>
      <strong className="stat-value">{value}</strong>
      <span className="stat-detail">{detail}</span>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  compact = false,
}: {
  icon: IconName;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
}) {
  return (
    <div className={`empty-state${compact ? " empty-state-compact" : ""}`}>
      <div className="empty-icon"><Icon name={icon} /></div>
      <div className="empty-copy">
        <h3>{title}</h3>
        <p>{description}</p>
        {actionLabel && onAction && (
          <button className="text-button" type="button" onClick={onAction}>{actionLabel} <Icon name="arrow" /></button>
        )}
      </div>
    </div>
  );
}

function Icon({ name }: { name: IconName }) {
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
