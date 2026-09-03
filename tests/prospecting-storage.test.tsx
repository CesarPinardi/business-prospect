import { beforeEach, describe, expect, it } from "vitest";

import { createInitialState } from "../components/prospecting-domain";
import { loadAppState, resetStorageForTests, SQLITE_STORAGE_KEY, saveAppState, STORAGE_KEY } from "../components/prospecting-storage";

beforeEach(() => {
  window.localStorage.clear();
  resetStorageForTests();
});

describe("local SQLite persistence", () => {
  it("restores submitted profile data after reopening the database", async () => {
    const state = createInitialState();
    state.settings = { name: "Cesar", businessName: "North Star", offeredService: "Web design", baseMessage: "Hello" };

    await saveAppState(state, { validateSettings: true });
    expect(window.localStorage.getItem(SQLITE_STORAGE_KEY)).toBeTruthy();
    resetStorageForTests();
    expect((await loadAppState()).state.settings).toEqual(state.settings);
  });

  it("migrates the legacy JSON mirror and rejects invalid submitted settings", async () => {
    const state = createInitialState();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    expect((await loadAppState()).state.settings).toEqual(state.settings);
    expect(window.localStorage.getItem(SQLITE_STORAGE_KEY)).toBeTruthy();
    await expect(saveAppState(createInitialState(), { validateSettings: true })).rejects.toThrow("Invalid profile settings");
  });
});
