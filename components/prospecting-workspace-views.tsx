import { useEffect, useRef, useState } from "react";

import { Icon } from "./prospecting-icons";
import { CITIES, DEFAULT_SEARCH_CRITERIA, validateSettings } from "./prospecting-domain";
import type { Candidate, IconName, ProfileSettings, SearchCriteria, SearchSession, ViewId } from "./prospecting-workspace-types";

export function DashboardView({ onNavigate }: { onNavigate: (view: ViewId) => void }) {
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

export function SearchView({ session, nicheHistory, onSearch }: { session: SearchSession | null; nicheHistory: string[]; onSearch: (criteria: SearchCriteria) => void }) {
  const [criteria, setCriteria] = useState<SearchCriteria>(session?.criteria ?? DEFAULT_SEARCH_CRITERIA);
  const canSearch = Boolean(criteria.cityId && criteria.niche.trim() && Number.isInteger(criteria.radiusKm) && criteria.radiusKm >= 1 && criteria.radiusKm <= 10);

  return (
    <section className="view" aria-labelledby="search-title">
      <ViewIntro eyebrow="Prospecting workspace" title="Find your next conversation." titleId="search-title" description="Set a location and niche to discover local businesses worth reaching out to." />
      <div className="search-shell">
        <form className="search-form-panel panel" onSubmit={(event) => { event.preventDefault(); if (canSearch) onSearch(criteria); }}>
          <div className="panel-heading"><div><p className="eyebrow">Search setup</p><h2>Define your area</h2></div><div className="step-badge">01 <span>of</span> 01</div></div>
          <div className="form-stack">
            <label className="field-label" htmlFor="search-city">City</label>
            <select className="field-control" id="search-city" value={criteria.cityId} onChange={(event) => setCriteria((current) => ({ ...current, cityId: event.target.value }))}><option value="">Select a city</option>{CITIES.map((city) => <option key={city.id} value={city.id}>{city.displayName}</option>)}</select>
            <label className="field-label" htmlFor="search-niche">Business niche</label>
            <input className="field-control" id="search-niche" list="recent-niches" value={criteria.niche} onChange={(event) => setCriteria((current) => ({ ...current, niche: event.target.value }))} placeholder="e.g. dental clinics, coffee shops" />
            <datalist id="recent-niches">{nicheHistory.map((niche) => <option key={niche} value={niche} />)}</datalist>
            <label className="field-label" htmlFor="search-radius">Radius</label>
            <select className="field-control" id="search-radius" value={criteria.radiusKm} onChange={(event) => setCriteria((current) => ({ ...current, radiusKm: Number(event.target.value) }))}>{Array.from({ length: 10 }, (_, index) => index + 1).map((radius) => <option key={radius} value={radius}>{radius} km</option>)}</select>
          </div>
          <div className="form-note"><Icon name="spark" /> Demo businesses are sample data; counts do not represent every business in the area.</div>
          <button className="button button-primary button-wide" type="submit" disabled={!canSearch || session?.status === "loading"}>{session?.status === "loading" ? "Searching…" : "Search businesses"} <Icon name="arrow" /></button>
          {!canSearch && <p className="disabled-note">Select a city, enter a niche, and choose a radius from 1 to 10 km.</p>}
          {session?.status === "error" && <p className="form-error" role="alert">{session.error}</p>}
        </form>
        {!session ? <div className="search-empty panel"><EmptyState icon="search" title="No search results yet" description="Choose a city and niche to see matching businesses here." compact /></div> : session.status === "loading" ? <div className="search-empty panel" role="status"><div className="loading-state"><span className="loading-spinner" /><h2>Loading Demo businesses…</h2><p>Checking the selected radius and preparing sample results.</p></div></div> : session.status === "error" ? <div className="search-empty panel"><EmptyState icon="search" title="The Demo provider is unavailable" description="Your existing results were kept. Try the search again in a moment." compact /></div> : <section className="results-panel panel" aria-labelledby="results-title"><div className="results-header"><div><p className="eyebrow">{session.city.displayName} · {session.criteria.radiusKm} km radius</p><h2 id="results-title">Demo businesses</h2></div><span className="result-disclosure">{session.candidates.length} loaded</span></div><p className="disclosure-copy">Sample data only. This is not every business in the area.</p><div className="result-list" aria-label="Current search results">{session.candidates.length ? session.candidates.map((candidate) => <DemoCandidateCard candidate={candidate} key={candidate.providerId} />) : <p className="no-results">No businesses were found inside this radius.</p>}</div></section>}
      </div>
    </section>
  );
}

function DemoCandidateCard({ candidate }: { candidate: Candidate }) {
  return <article className="candidate-card"><div className={`candidate-photo${candidate.photoUrl ? " has-photo" : ""}`} aria-label={candidate.photoUrl ? "Photo listed" : "No photo listed"}>{candidate.photoUrl ? "Photo" : "—"}</div><div className="candidate-copy"><div className="candidate-title-row"><div><h3>{candidate.name}</h3><p>{candidate.category} · {candidate.distanceKm.toFixed(1)} km</p></div></div><p className="candidate-address">{candidate.address}</p><div className="candidate-metadata">{candidate.website ? <a href={candidate.website} target="_blank" rel="noreferrer">Website listed ↗</a> : <span>No website listed</span>}<span>{candidate.phone ?? "No phone listed"}</span><span>{candidate.photoUrl ? "Photo listed" : "No photo listed"}</span></div><small className="source-attribution">{candidate.sourceAttribution}</small></div></article>;
}

export function LeadsView({ onNavigate }: { onNavigate: (view: ViewId) => void }) {
  return (
    <section className="view" aria-labelledby="leads-title">
      <ViewIntro
        eyebrow="Your prospects"
        title="Leads worth following."
        titleId="leads-title"
        description="Businesses you choose to save will live here, ready for a thoughtful next step."
      />
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

export function PipelineView() {
  const pipelineStages = ["New", "Contacted", "Interested", "Follow-up", "Won", "Not interested"];

  return (
    <section className="view" aria-labelledby="pipeline-title">
      <ViewIntro
        eyebrow="Move conversations forward"
        title="Your pipeline, at a glance."
        titleId="pipeline-title"
        description="Keep every prospect moving from first hello to a clear outcome."
      />
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

export function SettingsView({ settings, onSave, persistenceError }: { settings: ProfileSettings; onSave: (settings: ProfileSettings) => Promise<boolean>; persistenceError?: string }) {
  const [draft, setDraft] = useState(settings);
  const draftDirty = useRef(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "validation-error" | "persistence-error">("idle");
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileSettings, string>>>({});

  useEffect(() => { if (!draftDirty.current) setDraft(settings); }, [settings]);

  function update(key: keyof ProfileSettings, value: string) {
    draftDirty.current = true;
    setDraft((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateSettings(draft);
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); setStatus("validation-error"); return; }
    setStatus("saving");
    if (await onSave(draft)) { draftDirty.current = false; setStatus("saved"); setErrors({}); } else setStatus("persistence-error");
  }

  return (
    <section className="view" aria-labelledby="settings-title">
      <ViewIntro
        eyebrow="Make it yours"
        title="Your workspace settings."
        titleId="settings-title"
        description="A few details will make future outreach feel personal and ready to send."
      />
      <form className="panel settings-panel" onSubmit={submit}>
        <div className="settings-header">
          <div className="settings-icon"><Icon name="profile" /></div>
          <div>
            <p className="eyebrow">Personal profile</p>
            <h2>No profile details yet</h2>
            <p>Saved locally on this device. These details are used to prepare, never send, outreach.</p>
          </div>
        </div>
        <div className="settings-form-grid">
          <SettingsField id="settings-name" label="Your name" value={draft.name} error={errors.name} onChange={(value) => update("name", value)} />
          <SettingsField id="settings-business" label="Business name" value={draft.businessName} error={errors.businessName} onChange={(value) => update("businessName", value)} />
          <SettingsField id="settings-service" label="Offered service" value={draft.offeredService} error={errors.offeredService} onChange={(value) => update("offeredService", value)} />
          <div className="settings-field settings-field-wide">
            <label className="field-label" htmlFor="settings-message">Base outreach message</label>
            <textarea className="field-control message-input" id="settings-message" value={draft.baseMessage} onChange={(event) => update("baseMessage", event.target.value)} placeholder="Hi {{name}}, I’m {{sender}} from {{business}}..." />
            {errors.baseMessage && <span className="field-error">{errors.baseMessage}</span>}
            <small>Optional placeholders: <code>{"{{name}}"}</code>, <code>{"{{business}}"}</code>, <code>{"{{service}}"}</code>, <code>{"{{sender}}"}</code>.</small>
          </div>
        </div>
        <div className="settings-actions">
          <button className="button button-primary" type="submit">{status === "saving" ? "Saving…" : "Save settings"}</button>
          <span className={`save-state save-state-${status}`} role={status === "validation-error" || status === "persistence-error" ? "alert" : "status"}>
            {status === "saved" ? "Saved locally." : status === "validation-error" ? "Check the highlighted fields." : status === "persistence-error" ? (persistenceError ?? "Could not save. Your input is still here.") : status === "saving" ? "Saving…" : ""}
          </span>
        </div>
      </form>
    </section>
  );
}

function SettingsField({ id, label, value, error, onChange }: { id: string; label: string; value: string; error?: string; onChange: (value: string) => void }) {
  return <div className="settings-field"><label className="field-label" htmlFor={id}>{label}</label><input className="field-control" id={id} value={value} onChange={(event) => onChange(event.target.value)} />{error && <span className="field-error">{error}</span>}</div>;
}

function ViewIntro({ eyebrow, title, titleId, description }: { eyebrow: string; title: string; titleId: string; description: string }) {
  return (
    <div className="page-intro compact-intro">
      <p className="eyebrow">{eyebrow}</p>
      <h1 id={titleId}>{title}</h1>
      <p className="intro-copy">{description}</p>
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
