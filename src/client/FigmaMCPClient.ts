import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import type { CallToolResult, TextContent, ImageContent } from '@modelcontextprotocol/sdk/types.js';
import { createRequire } from 'node:module';
import type { FigmaClientOptions } from '../types/client.js';
import { DEFAULT_SERVER_URL, DEFAULT_TIMEOUT } from '../types/client.js';
import type {
  DesignContext,
  NodeMetadata,
  Screenshot,
  VariableDefs,
  CodeConnectMap,
  FigJamContext,
  ExtractDesignParams,
  AddCodeConnectMapParams,
  GetFigJamParams,
} from '../types/figma.js';
import { ConnectionError, ToolExecutionError } from '../utils/errors.js';
import { createTransport } from './transports.js';

const require = createRequire(import.meta.url);
const { version } = require('../../package.json') as { version: string };

export class FigmaMCPClient {
  private mcpClient: Client;
  private transport: Transport | null = null;
  private connected = false;

  private readonly serverUrl: string;
  private readonly timeout: number;
  private readonly clientLanguages?: string;
  private readonly clientFrameworks?: string;
  private readonly transportFactory: (url: string, sessionId?: string) => Transport;

  constructor(options: FigmaClientOptions = {}) {
    this.serverUrl = options.serverUrl ?? DEFAULT_SERVER_URL;
    this.timeout = options.timeout ?? DEFAULT_TIMEOUT;
    this.clientLanguages = options.clientLanguages;
    this.clientFrameworks = options.clientFrameworks;

    this.transportFactory = options.transportFactory
      ? (url: string, sessionId?: string) => options.transportFactory!(new URL(url), sessionId)
      : (url: string, sessionId?: string) => createTransport(url, sessionId);

    this.mcpClient = new Client(
      { name: 'figma-cli', version },
      { capabilities: {} },
    );
  }

  async connect(): Promise<void> {
    this.transport = this.transportFactory(this.serverUrl);
    await this.mcpClient.connect(this.transport);
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    await this.mcpClient.close();
    this.connected = false;
    this.transport = null;
  }

  isConnected(): boolean {
    return this.connected;
  }

  // === 8개 도구 래핑 메서드 ===

  async getMetadata(nodeId?: string): Promise<NodeMetadata> {
    const result = await this.callTool('get_metadata', { nodeId });
    const texts = this.extractTexts(result);
    return {
      xml: texts[0] ?? '',
      guidance: texts[1] ?? '',
    };
  }

  async extractDesign(nodeId?: string, options?: Omit<ExtractDesignParams, 'nodeId'>): Promise<DesignContext> {
    const result = await this.callTool('get_design_context', {
      nodeId,
      ...options,
    });
    const texts = this.extractTexts(result);
    return { texts };
  }

  async getScreenshot(nodeId?: string): Promise<Screenshot> {
    const result = await this.callTool('get_screenshot', { nodeId });
    const imageContent = result.content.find(
      (c) => 'type' in c && c.type === 'image',
    ) as { type: 'image'; data: string; mimeType: string } | undefined;

    if (!imageContent) {
      throw new ToolExecutionError('스크린샷 응답에 이미지가 없습니다.');
    }

    return {
      data: Buffer.from(imageContent.data, 'base64'),
      mimeType: imageContent.mimeType,
    };
  }

  async getVariableDefs(nodeId?: string): Promise<VariableDefs> {
    const result = await this.callTool('get_variable_defs', { nodeId });
    const text = this.extractTexts(result)[0] ?? '{}';
    return {
      definitions: JSON.parse(text) as Record<string, string>,
    };
  }

  async getCodeConnectMap(nodeId?: string): Promise<CodeConnectMap> {
    const result = await this.callTool('get_code_connect_map', { nodeId });
    const text = this.extractTexts(result)[0] ?? '{}';
    return {
      mappings: JSON.parse(text) as CodeConnectMap['mappings'],
    };
  }

  async addCodeConnectMap(params: AddCodeConnectMapParams): Promise<void> {
    await this.callTool('add_code_connect_map', { ...params });
  }

  async createDesignSystemRules(): Promise<string> {
    const result = await this.callTool('create_design_system_rules', {});
    return this.extractTexts(result)[0] ?? '';
  }

  async getFigJam(nodeId?: string, options?: Omit<GetFigJamParams, 'nodeId'>): Promise<FigJamContext> {
    const result = await this.callTool('get_figjam', { nodeId, ...options });
    return {
      code: this.extractTexts(result)[0] ?? '',
    };
  }

  // === 내부 헬퍼 ===

  private async callTool(
    toolName: string,
    args: Record<string, unknown>,
  ): Promise<CallToolResult> {
    if (!this.connected) {
      throw new ConnectionError('MCP 서버에 연결되지 않았습니다. connect()를 먼저 호출하세요.');
    }

    // undefined 값 제거 + 공통 파라미터 추가
    const cleanArgs: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(args)) {
      if (value !== undefined) {
        cleanArgs[key] = value;
      }
    }
    if (this.clientLanguages) cleanArgs.clientLanguages = this.clientLanguages;
    if (this.clientFrameworks) cleanArgs.clientFrameworks = this.clientFrameworks;

    const result = await this.mcpClient.callTool(
      { name: toolName, arguments: cleanArgs },
      undefined,
      { signal: AbortSignal.timeout(this.timeout) },
    );

    // callTool은 content가 없는 union도 반환할 수 있으므로 보장
    if (!('content' in result) || !Array.isArray(result.content)) {
      throw new ToolExecutionError('서버 응답에 content가 없습니다.');
    }

    const typedResult = result as CallToolResult;

    if (typedResult.isError) {
      const errorText = this.extractTexts(typedResult)[0] ?? '알 수 없는 도구 실행 에러';
      throw new ToolExecutionError(errorText);
    }

    return typedResult;
  }

  private extractTexts(result: CallToolResult): string[] {
    return result.content
      .filter((c): c is TextContent => 'type' in c && c.type === 'text')
      .map((c) => c.text);
  }
}
