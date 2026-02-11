import { describe, it, expect, vi, beforeEach } from 'vitest';
import { inspectAction } from '../../src/commands/inspect.js';
import type { FigmaMCPClient } from '../../src/client/FigmaMCPClient.js';

describe('inspectAction', () => {
  let mockClient: {
    connect: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    getMetadata: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockClient = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      getMetadata: vi.fn(),
    };
  });

  it('getMetadata 결과의 xml을 반환', async () => {
    mockClient.getMetadata.mockResolvedValue({
      xml: '<frame id="52:590" name="Page" />',
      guidance: 'get_design_context로 상세 코드를 가져오세요.',
    });

    const output = await inspectAction(
      '52:590',
      {},
      mockClient as unknown as FigmaMCPClient,
    );

    expect(mockClient.connect).toHaveBeenCalled();
    expect(mockClient.getMetadata).toHaveBeenCalledWith('52:590');
    expect(mockClient.disconnect).toHaveBeenCalled();
    expect(output.xml).toContain('52:590');
    expect(output.guidance).toContain('get_design_context');
  });

  it('nodeId 없으면 undefined 전달', async () => {
    mockClient.getMetadata.mockResolvedValue({
      xml: '<frame />',
      guidance: '',
    });

    await inspectAction(undefined, {}, mockClient as unknown as FigmaMCPClient);

    expect(mockClient.getMetadata).toHaveBeenCalledWith(undefined);
  });

  it('에러 시 disconnect 호출 보장', async () => {
    mockClient.getMetadata.mockRejectedValue(new Error('연결 실패'));

    await expect(
      inspectAction('52:590', {}, mockClient as unknown as FigmaMCPClient),
    ).rejects.toThrow('연결 실패');

    expect(mockClient.disconnect).toHaveBeenCalled();
  });
});
