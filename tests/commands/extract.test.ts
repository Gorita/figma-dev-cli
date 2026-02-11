import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractAction } from '../../src/commands/extract.js';
import type { FigmaMCPClient } from '../../src/client/FigmaMCPClient.js';

describe('extractAction', () => {
  let mockClient: {
    connect: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    extractDesign: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockClient = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      extractDesign: vi.fn(),
    };
  });

  it('extractDesign 결과를 stdout에 JSON으로 출력', async () => {
    mockClient.extractDesign.mockResolvedValue({
      code: '<div>Hello</div>',
      downloadUrls: { 'icon.svg': 'http://localhost:3845/assets/abc.svg' },
    });

    const output = await extractAction(
      '52:590',
      {},
      mockClient as unknown as FigmaMCPClient,
    );

    expect(mockClient.connect).toHaveBeenCalled();
    expect(mockClient.extractDesign).toHaveBeenCalledWith('52:590', {});
    expect(mockClient.disconnect).toHaveBeenCalled();
    expect(output.code).toBe('<div>Hello</div>');
  });

  it('nodeId 없으면 undefined 전달 (현재 선택 노드)', async () => {
    mockClient.extractDesign.mockResolvedValue({
      code: '<div/>',
      downloadUrls: {},
    });

    await extractAction(undefined, {}, mockClient as unknown as FigmaMCPClient);

    expect(mockClient.extractDesign).toHaveBeenCalledWith(undefined, {});
  });

  it('forceCode 옵션 전달', async () => {
    mockClient.extractDesign.mockResolvedValue({
      code: '<div/>',
      downloadUrls: {},
    });

    await extractAction(
      '52:590',
      { forceCode: true },
      mockClient as unknown as FigmaMCPClient,
    );

    expect(mockClient.extractDesign).toHaveBeenCalledWith('52:590', { forceCode: true });
  });

  it('에러 시 disconnect 호출 보장', async () => {
    mockClient.extractDesign.mockRejectedValue(new Error('서버 에러'));

    await expect(
      extractAction('52:590', {}, mockClient as unknown as FigmaMCPClient),
    ).rejects.toThrow('서버 에러');

    expect(mockClient.disconnect).toHaveBeenCalled();
  });
});
