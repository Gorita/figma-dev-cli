import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shotAction } from '../../src/commands/shot.js';
import type { FigmaMCPClient } from '../../src/client/FigmaMCPClient.js';

describe('shotAction', () => {
  let mockClient: {
    connect: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    getScreenshot: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockClient = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      getScreenshot: vi.fn(),
    };
  });

  it('스크린샷 Buffer와 mimeType을 반환', async () => {
    const fakeBuffer = Buffer.from('fake-png');
    mockClient.getScreenshot.mockResolvedValue({
      data: fakeBuffer,
      mimeType: 'image/png',
    });

    const result = await shotAction(
      '52:590',
      {},
      mockClient as unknown as FigmaMCPClient,
    );

    expect(mockClient.connect).toHaveBeenCalled();
    expect(mockClient.getScreenshot).toHaveBeenCalledWith('52:590');
    expect(mockClient.disconnect).toHaveBeenCalled();
    expect(result.data).toBeInstanceOf(Buffer);
    expect(result.mimeType).toBe('image/png');
  });

  it('nodeId 없으면 undefined 전달', async () => {
    mockClient.getScreenshot.mockResolvedValue({
      data: Buffer.from(''),
      mimeType: 'image/png',
    });

    await shotAction(undefined, {}, mockClient as unknown as FigmaMCPClient);

    expect(mockClient.getScreenshot).toHaveBeenCalledWith(undefined);
  });

  it('에러 시 disconnect 호출 보장', async () => {
    mockClient.getScreenshot.mockRejectedValue(new Error('캡처 실패'));

    await expect(
      shotAction('52:590', {}, mockClient as unknown as FigmaMCPClient),
    ).rejects.toThrow('캡처 실패');

    expect(mockClient.disconnect).toHaveBeenCalled();
  });
});
