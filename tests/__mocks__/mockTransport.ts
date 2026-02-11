import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import type { JSONRPCMessage } from '@modelcontextprotocol/sdk/types.js';

/**
 * 테스트용 Mock Transport.
 * MCP Client가 보내는 메시지를 기록하고, 미리 설정된 응답을 반환한다.
 */
export class MockTransport implements Transport {
  sessionId?: string;
  sentMessages: JSONRPCMessage[] = [];

  onclose?: () => void;
  onerror?: (error: Error) => void;
  onmessage?: (message: JSONRPCMessage) => void;

  private _started = false;
  private _closed = false;

  // tools/call 응답을 미리 설정
  private _toolResponses = new Map<string, unknown>();

  async start(): Promise<void> {
    this._started = true;
  }

  async send(message: JSONRPCMessage): Promise<void> {
    this.sentMessages.push(message);

    // JSON-RPC 요청에 대한 자동 응답
    if ('method' in message && 'id' in message) {
      const response = this.buildResponse(message);
      if (response && this.onmessage) {
        // 비동기로 응답 (실제 네트워크 동작 모방)
        queueMicrotask(() => this.onmessage!(response as JSONRPCMessage));
      }
    }
  }

  async close(): Promise<void> {
    this._closed = true;
    this.onclose?.();
  }

  get started(): boolean {
    return this._started;
  }

  get closed(): boolean {
    return this._closed;
  }

  /**
   * 특정 도구 호출에 대한 응답을 미리 설정한다.
   */
  setToolResponse(toolName: string, result: unknown): void {
    this._toolResponses.set(toolName, result);
  }

  private buildResponse(message: JSONRPCMessage): unknown | null {
    if (!('method' in message) || !('id' in message)) return null;

    const msg = message as { method: string; id: number; params?: Record<string, unknown> };

    switch (msg.method) {
      case 'initialize':
        return {
          jsonrpc: '2.0',
          id: msg.id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: { tools: {} },
            serverInfo: { name: 'Figma Dev Mode MCP Server', version: '1.0.0' },
          },
        };

      case 'tools/call': {
        const toolName = (msg.params as Record<string, unknown>)?.name as string;
        const preset = this._toolResponses.get(toolName);
        if (preset) {
          return {
            jsonrpc: '2.0',
            id: msg.id,
            result: preset,
          };
        }
        // 기본: 빈 텍스트 응답
        return {
          jsonrpc: '2.0',
          id: msg.id,
          result: {
            content: [{ type: 'text', text: '{}' }],
          },
        };
      }

      default:
        return null;
    }
  }
}
