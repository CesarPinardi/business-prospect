export type ViewId = "dashboard" | "search" | "leads" | "pipeline" | "settings";

export type ProfileSettings = {
  name: string;
  businessName: string;
  offeredService: string;
  baseMessage: string;
};

export type AppState = {
  settings: ProfileSettings;
  searches: SearchRecord[];
  nicheHistory: string[];
};

export type SearchFilter = "all" | "listed" | "not-listed";
export type SearchSort = "relevance" | "distance" | "name";
export type CandidateSelectionSource = "card" | "marker";

export type CityOption = {
  id: string;
  displayName: string;
  country: string;
  latitude: number;
  longitude: number;
  providerId: string;
};

export type SearchCriteria = {
  cityId: string;
  niche: string;
  radiusKm: number;
  websiteFilter: SearchFilter;
  photoFilter: SearchFilter;
  phoneFilter: SearchFilter;
  sort: SearchSort;
};

export type Candidate = {
  providerId: string;
  name: string;
  category: string;
  address: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  phone?: string;
  website?: string;
  photoUrl?: string;
  providerUrl: string;
  sourceAttribution: string;
  relevanceOrder: number;
};

export type SearchRecord = SearchCriteria & {
  id: string;
  name: string;
  city: CityOption;
  providerMode: "Demo";
  executedAt: string;
  loadedCount: number;
  providerPage: number;
  hasNextPage: boolean;
  candidates: Candidate[];
};

export type SearchSession = {
  searchId?: string;
  criteria: SearchCriteria;
  city: CityOption;
  candidates: Candidate[];
  providerPage: number;
  hasNextPage: boolean;
  currentPage: number;
  selectedCandidateId?: string;
  selectionSource?: CandidateSelectionSource;
  status: "idle" | "loading" | "success" | "error";
  error?: string;
};

export type IconName =
  | "dashboard"
  | "search"
  | "leads"
  | "pipeline"
  | "settings"
  | "arrow"
  | "spark"
  | "activity"
  | "map"
  | "profile";
