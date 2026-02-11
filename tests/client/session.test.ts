import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SessionManager } from '../../src/client/session.js';
import { mkdtempSync, mkdirSync, rmSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('SessionManager', () => {
  let tempDir: string;
  let manager: SessionManager;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'figma-cli-test-'));
    manager = new SessionManager(tempDir);
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('파일 없을 때 loadSession은 undefined 반환', () => {
    const result = manager.loadSession('http://127.0.0.1:3845/mcp');
    expect(result).toBeUndefined();
  });

  it('세션 저장 후 로드', () => {
    const url = 'http://127.0.0.1:3845/mcp';
    const sessionId = 'test-session-id-123';

    manager.saveSession(url, sessionId);
    const loaded = manager.loadSession(url);

    expect(loaded).toBe(sessionId);
  });

  it('서로 다른 서버 URL의 세션을 독립적으로 관리', () => {
    const url1 = 'http://127.0.0.1:3845/mcp';
    const url2 = 'http://127.0.0.1:4000/mcp';

    manager.saveSession(url1, 'session-1');
    manager.saveSession(url2, 'session-2');

    expect(manager.loadSession(url1)).toBe('session-1');
    expect(manager.loadSession(url2)).toBe('session-2');
  });

  it('세션 삭제', () => {
    const url = 'http://127.0.0.1:3845/mcp';
    manager.saveSession(url, 'to-delete');
    manager.clearSession(url);

    expect(manager.loadSession(url)).toBeUndefined();
  });

  it('존재하지 않는 세션 삭제해도 에러 없음', () => {
    expect(() => manager.clearSession('http://unknown')).not.toThrow();
  });

  it('디렉토리 자동 생성', () => {
    const nestedDir = join(tempDir, 'nested', 'config');
    const nestedManager = new SessionManager(nestedDir);

    nestedManager.saveSession('http://127.0.0.1:3845/mcp', 'auto-create');

    expect(existsSync(nestedDir)).toBe(true);
    expect(nestedManager.loadSession('http://127.0.0.1:3845/mcp')).toBe('auto-create');
  });

  it('세션 저장 시 createdAt 포함', () => {
    const url = 'http://127.0.0.1:3845/mcp';
    const before = new Date();
    manager.saveSession(url, 'with-timestamp');
    const after = new Date();

    const data = manager.getSessionData(url);
    expect(data).toBeDefined();
    expect(new Date(data!.createdAt).getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(new Date(data!.createdAt).getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it('손상된 JSON 파일은 무시하고 undefined 반환', () => {
    mkdirSync(tempDir, { recursive: true });
    writeFileSync(join(tempDir, 'session.json'), 'invalid json{{{');

    const result = manager.loadSession('http://127.0.0.1:3845/mcp');
    expect(result).toBeUndefined();
  });
});
