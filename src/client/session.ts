import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

interface SessionEntry {
  sessionId: string;
  createdAt: string;
}

interface SessionStore {
  [serverUrl: string]: SessionEntry;
}

const SESSION_FILE = 'session.json';

export class SessionManager {
  private readonly configDir: string;

  constructor(configDir: string) {
    this.configDir = configDir;
  }

  loadSession(serverUrl: string): string | undefined {
    return this.getSessionData(serverUrl)?.sessionId;
  }

  getSessionData(serverUrl: string): SessionEntry | undefined {
    const store = this.readStore();
    return store[serverUrl];
  }

  saveSession(serverUrl: string, sessionId: string): void {
    const store = this.readStore();
    store[serverUrl] = {
      sessionId,
      createdAt: new Date().toISOString(),
    };
    this.writeStore(store);
  }

  clearSession(serverUrl: string): void {
    const store = this.readStore();
    delete store[serverUrl];
    this.writeStore(store);
  }

  private filePath(): string {
    return join(this.configDir, SESSION_FILE);
  }

  private readStore(): SessionStore {
    try {
      if (!existsSync(this.filePath())) return {};
      const raw = readFileSync(this.filePath(), 'utf-8');
      return JSON.parse(raw) as SessionStore;
    } catch {
      return {};
    }
  }

  private writeStore(store: SessionStore): void {
    mkdirSync(this.configDir, { recursive: true });
    writeFileSync(this.filePath(), JSON.stringify(store, null, 2), 'utf-8');
  }
}
