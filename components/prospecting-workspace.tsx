"use client";

import { useState } from "react";

import { Icon } from "./prospecting-icons";
import {
  DashboardView,
  LeadsView,
  PipelineView,
  SearchView,
  SettingsView,
} from "./prospecting-workspace-views";
import type { IconName, ViewId } from "./prospecting-workspace-types";

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

export function ProspectingWorkspace() {
  const [activeView, setActiveView] = useState<ViewId>("dashboard");

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
              onClick={() => setActiveView(item.id)}
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
          {activeView === "dashboard" && <DashboardView onNavigate={setActiveView} />}
          {activeView === "search" && <SearchView />}
          {activeView === "leads" && <LeadsView onNavigate={setActiveView} />}
          {activeView === "pipeline" && <PipelineView />}
          {activeView === "settings" && <SettingsView />}
        </main>
      </div>
    </div>
  );
}
