import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MockTransport } from '../__mocks__/mockTransport.js';
import { FigmaMCPClient } from '../../src/client/FigmaMCPClient.js';
import { ToolExecutionError, ConnectionError } from '../../src/utils/errors.js';
import type { SessionCache } from '../../src/types/client.js';

class FailingMockTransport extends MockTransport {
  async start(): Promise<void> {
    throw new Error('invalid session');
  }
}

describe('FigmaMCPClient', () => {
  let transport: MockTransport;
  let client: FigmaMCPClient;
  let sessionCache: SessionCache;

  beforeEach(() => {
    transport = new MockTransport();
    sessionCache = {
      loadSession: vi.fn(() => undefined),
      saveSession: vi.fn(),
      clearSession: vi.fn(),
    };
    client = new FigmaMCPClient({
      transportFactory: () => transport,
      sessionCache,
    });
  });

  // === 연결 관리 ===

  describe('connect / disconnect', () => {
    it('연결 성공', async () => {
      await client.connect();
      expect(client.isConnected()).toBe(true);
    });

    it('연결 후 disconnect', async () => {
      await client.connect();
      await client.disconnect();
      expect(client.isConnected()).toBe(false);
    });

    it('연결 안 된 상태에서 도구 호출 시 ConnectionError', async () => {
      await expect(client.getMetadata()).rejects.toThrow(ConnectionError);
    });

    it('캐시된 세션 ID가 있으면 transportFactory에 전달', async () => {
      const transportFactory = vi.fn((_url: URL, _sessionId?: string) => transport);
      const cachedSessionCache: SessionCache = {
        loadSession: vi.fn(() => 'cached-session-123'),
        saveSession: vi.fn(),
        clearSession: vi.fn(),
      };
      const cachedClient = new FigmaMCPClient({
        transportFactory,
        sessionCache: cachedSessionCache,
      });

      await cachedClient.connect();

      expect(transportFactory).toHaveBeenCalledWith(
        new URL('http://127.0.0.1:3845/mcp'),
        'cached-session-123',
      );
      expect(cachedSessionCache.clearSession).not.toHaveBeenCalled();
    });

    it('캐시 세션 연결 실패 시 세션 제거 후 fresh 연결 재시도', async () => {
      const freshTransport = new MockTransport();
      freshTransport.sessionId = 'fresh-session-456';
      const transportFactory = vi.fn((_url: URL, sessionId?: string) => {
        if (sessionId === 'stale-session') return new FailingMockTransport();
        return freshTransport;
      });
      const staleSessionCache: SessionCache = {
        loadSession: vi.fn(() => 'stale-session'),
        saveSession: vi.fn(),
        clearSession: vi.fn(),
      };
      const staleClient = new FigmaMCPClient({
        transportFactory,
        sessionCache: staleSessionCache,
      });

      await staleClient.connect();

      expect(staleSessionCache.clearSession).toHaveBeenCalledWith('http://127.0.0.1:3845/mcp');
      expect(transportFactory.mock.calls[0][1]).toBe('stale-session');
      expect(transportFactory.mock.calls[1][1]).toBeUndefined();
      expect(staleSessionCache.saveSession).toHaveBeenCalledWith(
        'http://127.0.0.1:3845/mcp',
        'fresh-session-456',
      );
      expect(staleClient.isConnected()).toBe(true);
    });

    it('연결 성공 시 transport sessionId를 캐시에 저장', async () => {
      transport.sessionId = 'new-session-789';
      await client.connect();
      expect(sessionCache.saveSession).toHaveBeenCalledWith(
        'http://127.0.0.1:3845/mcp',
        'new-session-789',
      );
    });
  });

  // === get_metadata ===

  describe('getMetadata', () => {
    it('XML과 guidance를 파싱하여 반환', async () => {
      transport.setToolResponse('get_metadata', {
        content: [
          { type: 'text', text: '<frame id="52:590" name="Page" />' },
          { type: 'text', text: 'get_design_context로 상세 코드를 가져오세요.' },
        ],
      });

      await client.connect();
      const result = await client.getMetadata('52:590');

      expect(result.xml).toBe('<frame id="52:590" name="Page" />');
      expect(result.guidance).toBe('get_design_context로 상세 코드를 가져오세요.');
    });

    it('nodeId 미지정 시 파라미터에 nodeId 없음', async () => {
      await client.connect();
      await client.getMetadata();

      const callMsg = transport.sentMessages.find(
        (m) => 'method' in m && m.method === 'tools/call',
      ) as Record<string, unknown> | undefined;

      const params = callMsg?.params as Record<string, unknown>;
      const args = params?.arguments as Record<string, unknown>;
      expect(args.nodeId).toBeUndefined();
    });
  });

  // === get_design_context ===

  describe('extractDesign', () => {
    it('MCP 텍스트 배열을 그대로 반환', async () => {
      transport.setToolResponse('get_design_context', {
        content: [
          { type: 'text', text: '<div>Hello</div>' },
          { type: 'text', text: '프레임워크에 맞게 변환하세요' },
          { type: 'text', text: '에셋 URL: http://localhost:3845/assets/abc.svg' },
        ],
      });

      await client.connect();
      const result = await client.extractDesign('52:590');

      expect(result.texts).toHaveLength(3);
      expect(result.texts[0]).toBe('<div>Hello</div>');
      expect(result.texts[1]).toBe('프레임워크에 맞게 변환하세요');
      expect(result.texts[2]).toContain('에셋 URL');
    });
  });

  // === get_screenshot ===

  describe('getScreenshot', () => {
    it('Base64 이미지를 Buffer로 변환하여 반환', async () => {
      const base64Data = Buffer.from('fake-png-data').toString('base64');
      transport.setToolResponse('get_screenshot', {
        content: [{ type: 'image', data: base64Data, mimeType: 'image/png' }],
      });

      await client.connect();
      const result = await client.getScreenshot('52:590');

      expect(result.data).toBeInstanceOf(Buffer);
      expect(result.data.toString()).toBe('fake-png-data');
      expect(result.mimeType).toBe('image/png');
    });
  });

  // === get_variable_defs ===

  describe('getVariableDefs', () => {
    it('토큰 정의를 파싱하여 반환', async () => {
      const defs = { 'Text color/normal': '#0C1120', 'Brand/primary': '#2D91FF' };
      transport.setToolResponse('get_variable_defs', {
        content: [{ type: 'text', text: JSON.stringify(defs) }],
      });

      await client.connect();
      const result = await client.getVariableDefs('52:590');

      expect(result.definitions['Text color/normal']).toBe('#0C1120');
    });
  });

  // === get_code_connect_map ===

  describe('getCodeConnectMap', () => {
    it('매핑 정보를 파싱하여 반환', async () => {
      const mappings = {
        '1:2': { codeConnectSrc: 'src/Button.tsx', codeConnectName: 'Button' },
      };
      transport.setToolResponse('get_code_connect_map', {
        content: [{ type: 'text', text: JSON.stringify(mappings) }],
      });

      await client.connect();
      const result = await client.getCodeConnectMap('52:590');

      expect(result.mappings['1:2'].codeConnectName).toBe('Button');
    });
  });

  // === create_design_system_rules ===

  describe('createDesignSystemRules', () => {
    it('프롬프트 텍스트를 반환', async () => {
      transport.setToolResponse('create_design_system_rules', {
        content: [{ type: 'text', text: '디자인 시스템 규칙 분석 프롬프트...' }],
      });

      await client.connect();
      const result = await client.createDesignSystemRules();

      expect(result).toBe('디자인 시스템 규칙 분석 프롬프트...');
    });
  });

  // === get_figjam ===

  describe('getFigJam', () => {
    it('FigJam 코드를 반환', async () => {
      transport.setToolResponse('get_figjam', {
        content: [{ type: 'text', text: '<figjam>board content</figjam>' }],
      });

      await client.connect();
      const result = await client.getFigJam('52:590');

      expect(result.code).toBe('<figjam>board content</figjam>');
    });
  });

  // === 에러 처리 ===

  describe('에러 처리', () => {
    it('isError: true → ToolExecutionError 발생', async () => {
      transport.setToolResponse('get_metadata', {
        content: [{ type: 'text', text: 'FigJam 파일에서만 사용 가능합니다.' }],
        isError: true,
      });

      await client.connect();
      await expect(client.getMetadata('52:590')).rejects.toThrow(ToolExecutionError);
    });

    it('ToolExecutionError 메시지에 서버 에러 텍스트 포함', async () => {
      transport.setToolResponse('get_metadata', {
        content: [{ type: 'text', text: '노드를 찾을 수 없습니다.' }],
        isError: true,
      });

      await client.connect();
      await expect(client.getMetadata('52:590')).rejects.toThrow('노드를 찾을 수 없습니다.');
    });
  });

  // === clientLanguages / clientFrameworks ===

  describe('공통 파라미터 전달', () => {
    it('clientLanguages, clientFrameworks가 도구 호출에 포함', async () => {
      const customClient = new FigmaMCPClient({
        transportFactory: () => transport,
        clientLanguages: 'typescript',
        clientFrameworks: 'react',
      });

      await customClient.connect();
      await customClient.getMetadata('52:590');

      const callMsg = transport.sentMessages.find(
        (m) => 'method' in m && m.method === 'tools/call',
      ) as Record<string, unknown> | undefined;

      const params = callMsg?.params as Record<string, unknown>;
      const args = params?.arguments as Record<string, unknown>;
      expect(args.clientLanguages).toBe('typescript');
      expect(args.clientFrameworks).toBe('react');
    });
  });
});
