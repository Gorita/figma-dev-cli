import { describe, it, expect, vi, beforeEach } from 'vitest';
import { tokensAction } from '../../src/commands/tokens.js';
import type { FigmaMCPClient } from '../../src/client/FigmaMCPClient.js';

describe('tokensAction', () => {
  let mockClient: {
    connect: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    getVariableDefs: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockClient = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      getVariableDefs: vi.fn(),
    };
  });

  it('토큰 정의를 반환', async () => {
    mockClient.getVariableDefs.mockResolvedValue({
      definitions: {
        'Text color/normal': '#0C1120',
        'Brand/primary': '#2D91FF',
      },
    });

    const result = await tokensAction(
      '52:590',
      {},
      mockClient as unknown as FigmaMCPClient,
    );

    expect(mockClient.connect).toHaveBeenCalled();
    expect(mockClient.getVariableDefs).toHaveBeenCalledWith('52:590');
    expect(mockClient.disconnect).toHaveBeenCalled();
    expect(result.definitions['Text color/normal']).toBe('#0C1120');
    expect(result.definitions['Brand/primary']).toBe('#2D91FF');
  });

  it('nodeId 없으면 undefined 전달', async () => {
    mockClient.getVariableDefs.mockResolvedValue({
      definitions: {},
    });

    await tokensAction(undefined, {}, mockClient as unknown as FigmaMCPClient);

    expect(mockClient.getVariableDefs).toHaveBeenCalledWith(undefined);
  });

  it('에러 시 disconnect 호출 보장', async () => {
    mockClient.getVariableDefs.mockRejectedValue(new Error('토큰 조회 실패'));

    await expect(
      tokensAction('52:590', {}, mockClient as unknown as FigmaMCPClient),
    ).rejects.toThrow('토큰 조회 실패');

    expect(mockClient.disconnect).toHaveBeenCalled();
  });
});
