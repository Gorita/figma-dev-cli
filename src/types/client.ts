import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';

export interface SessionCache {
  loadSession(serverUrl: string): string | undefined;
  saveSession(serverUrl: string, sessionId: string): void;
  clearSession(serverUrl: string): void;
}

export interface FigmaClientOptions {
  serverUrl?: string;
  clientLanguages?: string;
  clientFrameworks?: string;
  configDir?: string;
  timeout?: number;
  transportFactory?: (url: URL, sessionId?: string) => Transport;
  sessionCache?: SessionCache;
}

export const DEFAULT_SERVER_URL = 'http://127.0.0.1:3845/mcp';
export const DEFAULT_CONFIG_DIR = '~/.figma-cli';
export const DEFAULT_TIMEOUT = 60_000;
