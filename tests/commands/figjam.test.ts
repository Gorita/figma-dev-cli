import { describe, it, expect, vi, beforeEach } from 'vitest';
import { figjamAction } from '../../src/commands/figjam.js';
import type { FigmaMCPClient } from '../../src/client/FigmaMCPClient.js';

describe('figjamAction', () => {
  let mockClient: {
    connect: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    getFigJam: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockClient = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      getFigJam: vi.fn(),
    };
  });

  it('FigJam 코드를 반환', async () => {
    mockClient.getFigJam.mockResolvedValue({
      code: '<figjam>board</figjam>',
    });

    const result = await figjamAction(
      '52:590',
      {},
      mockClient as unknown as FigmaMCPClient,
    );

    expect(mockClient.connect).toHaveBeenCalled();
    expect(mockClient.getFigJam).toHaveBeenCalledWith('52:590', {});
    expect(mockClient.disconnect).toHaveBeenCalled();
    expect(result.code).toBe('<figjam>board</figjam>');
  });

  it('noImages 옵션 전달', async () => {
    mockClient.getFigJam.mockResolvedValue({ code: '' });

    await figjamAction(
      '52:590',
      { includeImagesOfNodes: false },
      mockClient as unknown as FigmaMCPClient,
    );

    expect(mockClient.getFigJam).toHaveBeenCalledWith('52:590', { includeImagesOfNodes: false });
  });

  it('에러 시 disconnect 보장', async () => {
    mockClient.getFigJam.mockRejectedValue(new Error('FigJam 전용'));

    await expect(
      figjamAction('52:590', {}, mockClient as unknown as FigmaMCPClient),
    ).rejects.toThrow('FigJam 전용');

    expect(mockClient.disconnect).toHaveBeenCalled();
  });
});
