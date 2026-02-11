import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';

/**
 * Figma MCP 서버용 StreamableHTTP Transport 생성.
 * Accept 헤더 설정과 세션 ID 재사용을 처리한다.
 */
export function createTransport(
  serverUrl: string,
  sessionId?: string,
): Transport {
  return new StreamableHTTPClientTransport(new URL(serverUrl), {
    requestInit: {
      headers: {
        Accept: 'application/json, text/event-stream',
      },
    },
    ...(sessionId != null && { sessionId }),
  });
}
