"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Icon } from "./prospecting-icons";
import { candidateWithinRadius, createInitialState, createId, filterCandidates, getCity, getDemoProviderPage } from "./prospecting-domain";
import { loadAppState, saveAppState } from "./prospecting-storage";
import {
  DashboardView,
  LeadsView,
  PipelineView,
  SearchView,
  SettingsView,
} from "./prospecting-workspace-views";
import type { AppState, CandidateSelectionSource, IconName, SearchCriteria, SearchRecord, SearchSession, ViewId } from "./prospecting-workspace-types";

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
  const [state, setState] = useState<AppState>(() => createInitialState());
  const stateRef = useRef(state);
  const persistedStateRef = useRef(state);
  const commitQueue = useRef(Promise.resolve());
  const [persistenceError, setPersistenceError] = useState<string>();
  const [session, setSession] = useState<SearchSession | null>(null);

  useEffect(() => {
    let active = true;
    void loadAppState().then((loaded) => {
      if (!active) return;
      stateRef.current = loaded.state;
      persistedStateRef.current = loaded.state;
      setState(loaded.state);
      if (loaded.error) setPersistenceError(loaded.error);
    });
    return () => { active = false; };
  }, []);

  const commit = useCallback(async (next: AppState, options?: { validateSettings?: boolean }): Promise<boolean> => {
    stateRef.current = next;
    const operation = commitQueue.current.then(async () => {
      try {
        await saveAppState(next, options);
        persistedStateRef.current = next;
        setState(next);
        setPersistenceError(undefined);
        return true;
      } catch {
        if (stateRef.current === next) {
          stateRef.current = persistedStateRef.current;
          setState(persistedStateRef.current);
        }
        setPersistenceError("Could not save local data. Your current input was kept; try again or check browser storage permissions.");
        return false;
      }
    });
    commitQueue.current = operation.then(() => undefined);
    return operation;
  }, []);

  const handleSaveSettings = useCallback((settings: AppState["settings"]): Promise<boolean> => commit({ ...stateRef.current, settings }, { validateSettings: true }), [commit]);

  const handleSearch = useCallback((criteria: SearchCriteria) => {
    const city = getCity(criteria.cityId);
    if (!city || !criteria.niche.trim() || !Number.isInteger(criteria.radiusKm) || criteria.radiusKm < 1 || criteria.radiusKm > 10) return;
    const loadingSession: SearchSession = { criteria, city, candidates: [], providerPage: 0, hasNextPage: false, currentPage: 1, status: "loading" };
    setSession(loadingSession);
    window.setTimeout(() => {
      void (async () => {
        try {
          const providerPage = getDemoProviderPage(city, criteria.niche, 0);
          const candidates = providerPage.filter((candidate) => candidateWithinRadius(candidate, city, criteria.radiusKm));
          const search: SearchRecord = { ...criteria, id: createId("search"), name: `${criteria.niche.trim()} in ${city.displayName.split(",")[0]}`, city, providerMode: "Demo", executedAt: new Date().toISOString(), loadedCount: candidates.length, providerPage: 0, hasNextPage: providerPage.length === 10, candidates };
          const currentState = stateRef.current;
          const niche = criteria.niche.trim();
          const nextHistory = [niche, ...currentState.nicheHistory.filter((item) => item.toLowerCase() !== niche.toLowerCase())].slice(0, 10);
          if (!await commit({ ...currentState, searches: [search, ...currentState.searches], nicheHistory: nextHistory })) {
            setSession({ ...loadingSession, status: "error", error: "Search ran, but its history could not be saved locally." });
            return;
          }
          setSession({ searchId: search.id, criteria, city, candidates, providerPage: 0, hasNextPage: providerPage.length === 10, currentPage: 1, selectedCandidateId: candidates[0]?.providerId, status: "success" });
        } catch {
          setSession({ ...loadingSession, status: "error", error: "The Demo provider is unavailable. No existing results were discarded." });
        }
      })();
    }, 80);
  }, [commit]);

  const handleSelectCandidate = useCallback((candidateId: string, source: CandidateSelectionSource) => {
    if (session) setSession({ ...session, selectedCandidateId: candidateId, selectionSource: source });
  }, [session]);

  const updateSearchRecord = useCallback(async (searchId: string, update: (search: SearchRecord) => SearchRecord): Promise<boolean> => {
    const currentState = stateRef.current;
    const search = currentState.searches.find((item) => item.id === searchId);
    if (!search) return false;
    const next = { ...currentState, searches: currentState.searches.map((item) => item.id === searchId ? update(item) : item) };
    return commit(next);
  }, [commit]);

  const handleCriteriaChange = useCallback(async (criteria: SearchCriteria): Promise<boolean> => {
    if (!session || session.status !== "success" || !session.searchId) return false;
    const saved = await updateSearchRecord(session.searchId, (search) => ({ ...search, ...criteria }));
    if (saved) setSession({ ...session, criteria, currentPage: 1, selectedCandidateId: undefined, selectionSource: undefined });
    return saved;
  }, [session, updateSearchRecord]);

  const handlePageChange = useCallback((page: number) => {
    if (!session || page < 1) return;
    const filteredCount = filterCandidates(session.candidates, session.criteria).length;
    if (page > Math.max(1, Math.ceil(filteredCount / 10))) return;
    setSession({ ...session, currentPage: page, selectedCandidateId: undefined });
  }, [session]);

  const handleLoadMore = useCallback(async () => {
    if (!session || session.status !== "success" || !session.hasNextPage || !session.searchId) return;
    try {
      const nextPageNumber = session.providerPage + 1;
      const page = getDemoProviderPage(session.city, session.criteria.niche, nextPageNumber);
      const added = page.filter((candidate) => candidateWithinRadius(candidate, session.city, session.criteria.radiusKm) && !session.candidates.some((current) => current.providerId === candidate.providerId));
      const candidates = [...session.candidates, ...added];
      const saved = await updateSearchRecord(session.searchId, (search) => ({ ...search, candidates, providerPage: nextPageNumber, loadedCount: candidates.length, hasNextPage: page.length === 10 }));
      if (!saved) {
        setSession({ ...session, error: "The next Demo page could not be saved locally. Already loaded results remain available." });
        return;
      }
      setSession({ ...session, candidates, providerPage: nextPageNumber, hasNextPage: page.length === 10, currentPage: 1, selectedCandidateId: added[0]?.providerId, selectionSource: undefined, error: undefined });
    } catch {
      setSession({ ...session, error: "The next Demo page failed to load. Already loaded results remain available." });
    }
  }, [session, updateSearchRecord]);

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
          {activeView === "search" && <SearchView session={session} nicheHistory={state.nicheHistory} onSearch={handleSearch} onChangeCriteria={handleCriteriaChange} onChangePage={handlePageChange} onLoadMore={handleLoadMore} onSelectCandidate={handleSelectCandidate} />}
          {activeView === "leads" && <LeadsView onNavigate={setActiveView} />}
          {activeView === "pipeline" && <PipelineView />}
          {activeView === "settings" && <SettingsView settings={state.settings} onSave={handleSaveSettings} persistenceError={persistenceError} />}
        </main>
      </div>
    </div>
  );
}
