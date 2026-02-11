import { describe, it, expect, vi, beforeEach } from 'vitest';
import { connectListAction, connectAddAction } from '../../src/commands/connect.js';
import type { FigmaMCPClient } from '../../src/client/FigmaMCPClient.js';

describe('connectListAction', () => {
  let mockClient: {
    connect: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    getCodeConnectMap: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockClient = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      getCodeConnectMap: vi.fn(),
    };
  });

  it('매핑 정보를 반환', async () => {
    mockClient.getCodeConnectMap.mockResolvedValue({
      mappings: {
        '1:2': { codeConnectSrc: 'src/Button.tsx', codeConnectName: 'Button' },
      },
    });

    const result = await connectListAction(
      '52:590',
      mockClient as unknown as FigmaMCPClient,
    );

    expect(mockClient.connect).toHaveBeenCalled();
    expect(mockClient.getCodeConnectMap).toHaveBeenCalledWith('52:590');
    expect(mockClient.disconnect).toHaveBeenCalled();
    expect(result.mappings['1:2'].codeConnectName).toBe('Button');
  });

  it('에러 시 disconnect 보장', async () => {
    mockClient.getCodeConnectMap.mockRejectedValue(new Error('조회 실패'));

    await expect(
      connectListAction('52:590', mockClient as unknown as FigmaMCPClient),
    ).rejects.toThrow('조회 실패');

    expect(mockClient.disconnect).toHaveBeenCalled();
  });
});

describe('connectAddAction', () => {
  let mockClient: {
    connect: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    addCodeConnectMap: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockClient = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      addCodeConnectMap: vi.fn(),
    };
  });

  it('매핑 등록 파라미터를 전달', async () => {
    await connectAddAction(
      {
        nodeId: '52:590',
        source: 'src/Button.tsx',
        name: 'Button',
        label: 'React',
      },
      mockClient as unknown as FigmaMCPClient,
    );

    expect(mockClient.addCodeConnectMap).toHaveBeenCalledWith({
      nodeId: '52:590',
      source: 'src/Button.tsx',
      componentName: 'Button',
      label: 'React',
    });
    expect(mockClient.disconnect).toHaveBeenCalled();
  });

  it('에러 시 disconnect 보장', async () => {
    mockClient.addCodeConnectMap.mockRejectedValue(new Error('등록 실패'));

    await expect(
      connectAddAction(
        { source: 'src/X.tsx', name: 'X', label: 'React' },
        mockClient as unknown as FigmaMCPClient,
      ),
    ).rejects.toThrow('등록 실패');

    expect(mockClient.disconnect).toHaveBeenCalled();
  });
});
