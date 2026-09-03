export type ViewId = "dashboard" | "search" | "leads" | "pipeline" | "settings";

export type ProfileSettings = {
  name: string;
  businessName: string;
  offeredService: string;
  baseMessage: string;
};

export type AppState = {
  settings: ProfileSettings;
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
