import { describe, it, expect, vi, beforeEach } from 'vitest';
import { designRulesAction } from '../../src/commands/design-rules.js';
import type { FigmaMCPClient } from '../../src/client/FigmaMCPClient.js';

describe('designRulesAction', () => {
  let mockClient: {
    connect: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    createDesignSystemRules: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockClient = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      createDesignSystemRules: vi.fn(),
    };
  });

  it('디자인 시스템 규칙 프롬프트를 반환', async () => {
    mockClient.createDesignSystemRules.mockResolvedValue('디자인 시스템 규칙 분석 프롬프트...');

    const result = await designRulesAction(mockClient as unknown as FigmaMCPClient);

    expect(mockClient.connect).toHaveBeenCalled();
    expect(mockClient.createDesignSystemRules).toHaveBeenCalled();
    expect(mockClient.disconnect).toHaveBeenCalled();
    expect(result).toBe('디자인 시스템 규칙 분석 프롬프트...');
  });

  it('에러 시 disconnect 보장', async () => {
    mockClient.createDesignSystemRules.mockRejectedValue(new Error('규칙 생성 실패'));

    await expect(
      designRulesAction(mockClient as unknown as FigmaMCPClient),
    ).rejects.toThrow('규칙 생성 실패');

    expect(mockClient.disconnect).toHaveBeenCalled();
  });
});
