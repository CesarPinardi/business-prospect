import type { Database, SqlJsStatic } from "sql.js";

import { createInitialState, validateSettings } from "./prospecting-domain";
import type { AppState } from "./prospecting-workspace-types";

export const STORAGE_KEY = "prospect.local.workspace.v1";
export const SQLITE_STORAGE_KEY = "prospect.local.workspace.sqlite.v1";

let databasePromise: Promise<Database> | undefined;
let activeDatabase: Database | undefined;

export function resetStorageForTests(): void {
  activeDatabase?.close();
  activeDatabase = undefined;
  databasePromise = undefined;
}

function getStorage(): Storage | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function normalizeState(value: unknown): AppState | undefined {
  if (!value || typeof value !== "object") return undefined;
  const parsed = value as Partial<AppState>;
  const defaults = createInitialState();
  return { ...defaults, ...parsed, settings: { ...defaults.settings, ...(parsed.settings ?? {}) }, searches: Array.isArray(parsed.searches) ? parsed.searches : [], leads: Array.isArray(parsed.leads) ? parsed.leads : [], nicheHistory: Array.isArray(parsed.nicheHistory) ? parsed.nicheHistory : [] };
}

function parseState(raw: string | null | undefined): AppState | undefined {
  if (!raw) return undefined;
  try {
    return normalizeState(JSON.parse(raw));
  } catch {
    return undefined;
  }
}

function encodeDatabase(database: Database): string {
  let binary = "";
  for (const byte of database.export()) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function decodeDatabase(value: string): Uint8Array {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function readDatabaseState(database: Database): AppState | undefined {
  const result = database.exec("SELECT state_json FROM workspace_state WHERE id = 1");
  const raw = result[0]?.values[0]?.[0];
  return typeof raw === "string" ? parseState(raw) : undefined;
}

function writeDatabaseState(database: Database, state: AppState): void {
  database.run(
    "INSERT INTO workspace_state (id, state_json, updated_at) VALUES (1, ?, ?) ON CONFLICT(id) DO UPDATE SET state_json = excluded.state_json, updated_at = excluded.updated_at",
    [JSON.stringify(state), new Date().toISOString()],
  );
}

function persistEncodedDatabase(database: Database, storage: Storage): void {
  storage.setItem(SQLITE_STORAGE_KEY, encodeDatabase(database));
}

async function getDatabase(): Promise<Database> {
  if (!databasePromise) {
    databasePromise = import("sql.js/dist/sql-asm.js")
      .then(({ default: initializeSqlJs }) => initializeSqlJs())
      .then((SQL: SqlJsStatic) => {
        const storage = getStorage();
        const encodedDatabase = storage?.getItem(SQLITE_STORAGE_KEY);
        let database: Database;
        try {
          database = encodedDatabase ? new SQL.Database(decodeDatabase(encodedDatabase)) : new SQL.Database();
          database.exec("SELECT 1");
        } catch {
          database = new SQL.Database();
        }
        database.run("CREATE TABLE IF NOT EXISTS workspace_state (id INTEGER PRIMARY KEY CHECK (id = 1), state_json TEXT NOT NULL, updated_at TEXT NOT NULL)");
        if (!readDatabaseState(database)) writeDatabaseState(database, parseState(storage?.getItem(STORAGE_KEY)) ?? createInitialState());
        activeDatabase = database;
        if (storage) persistEncodedDatabase(database, storage);
        return database;
      })
      .catch((error) => {
        databasePromise = undefined;
        throw error;
      });
  }
  return databasePromise;
}

export async function loadAppState(): Promise<{ state: AppState; error?: string }> {
  try {
    const storage = getStorage();
    if (storage && !storage.getItem(SQLITE_STORAGE_KEY) && !storage.getItem(STORAGE_KEY)) resetStorageForTests();
    const database = await getDatabase();
    return { state: readDatabaseState(database) ?? createInitialState() };
  } catch {
    return { state: parseState(getStorage()?.getItem(STORAGE_KEY)) ?? createInitialState(), error: "Could not load local SQLite data. Your current session is still available." };
  }
}

export async function saveAppState(state: AppState, options: { validateSettings?: boolean } = {}): Promise<void> {
  if (options.validateSettings && Object.keys(validateSettings(state.settings)).length > 0) throw new Error("Invalid profile settings");
  const database = await getDatabase();
  writeDatabaseState(database, state);
  const storage = getStorage();
  if (!storage && typeof window !== "undefined") throw new Error("Browser storage unavailable");
  if (!storage) return;
  persistEncodedDatabase(database, storage);
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // SQLite is the source of truth. Keep the older mirror best effort.
  }
}
