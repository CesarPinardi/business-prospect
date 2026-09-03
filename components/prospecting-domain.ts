import type { AppState, ProfileSettings } from "./prospecting-workspace-types";

export const DEFAULT_SETTINGS: ProfileSettings = {
  name: "",
  businessName: "",
  offeredService: "",
  baseMessage: "",
};

export function createInitialState(): AppState {
  return { settings: { ...DEFAULT_SETTINGS } };
}

export function validateSettings(settings: ProfileSettings): Partial<Record<keyof ProfileSettings, string>> {
  const errors: Partial<Record<keyof ProfileSettings, string>> = {};
  const labels: Record<keyof ProfileSettings, string> = {
    name: "Name",
    businessName: "Business name",
    offeredService: "Offered service",
    baseMessage: "Base outreach message",
  };
  for (const key of Object.keys(labels) as (keyof ProfileSettings)[]) {
    const value = settings[key].trim();
    if (!value) errors[key] = `${labels[key]} is required.`;
    if (value.length > 500) errors[key] = `${labels[key]} must be 500 characters or fewer.`;
  }
  return errors;
}
