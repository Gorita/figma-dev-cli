import { describe, it, expect, vi } from 'vitest';
import { createTransport } from '../../src/client/transports.js';

// StreamableHTTPClientTransport를 mock
vi.mock('@modelcontextprotocol/sdk/client/streamableHttp.js', () => {
  return {
    StreamableHTTPClientTransport: vi.fn().mockImplementation((url, opts) => ({
      url,
      opts,
      sessionId: opts?.sessionId,
    })),
  };
});

describe('createTransport', () => {
  it('URL 객체와 기본 Accept 헤더로 Transport 생성', async () => {
    const { StreamableHTTPClientTransport } = await import(
      '@modelcontextprotocol/sdk/client/streamableHttp.js'
    );

    const transport = createTransport('http://127.0.0.1:3845/mcp');

    expect(StreamableHTTPClientTransport).toHaveBeenCalledWith(
      new URL('http://127.0.0.1:3845/mcp'),
      expect.objectContaining({
        requestInit: {
          headers: {
            Accept: 'application/json, text/event-stream',
          },
        },
      }),
    );
    expect(transport).toBeDefined();
  });

  it('세션 ID를 전달하면 옵션에 포함', async () => {
    const { StreamableHTTPClientTransport } = await import(
      '@modelcontextprotocol/sdk/client/streamableHttp.js'
    );

    createTransport('http://127.0.0.1:3845/mcp', 'cached-session-123');

    expect(StreamableHTTPClientTransport).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({
        sessionId: 'cached-session-123',
      }),
    );
  });

  it('세션 ID 없으면 sessionId 옵션 미포함', async () => {
    const { StreamableHTTPClientTransport } = await import(
      '@modelcontextprotocol/sdk/client/streamableHttp.js'
    );
    vi.mocked(StreamableHTTPClientTransport).mockClear();

    createTransport('http://127.0.0.1:3845/mcp');

    const callArgs = vi.mocked(StreamableHTTPClientTransport).mock.calls[0];
    const opts = callArgs[1] as Record<string, unknown>;
    expect(opts.sessionId).toBeUndefined();
  });
});
