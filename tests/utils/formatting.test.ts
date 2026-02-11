import { describe, it, expect } from 'vitest';
import { formatSuccess, formatFileOutput, formatError } from '../../src/utils/formatting.js';

describe('formatSuccess', () => {
  it('data와 metadata를 포함한 JSON 구조 반환', () => {
    const result = formatSuccess({ xml: '<frame />' }, { nodeId: '52:590' });

    expect(result.status).toBe('success');
    expect(result.data).toEqual({ xml: '<frame />' });
    expect(result.metadata.nodeId).toBe('52:590');
  });
});

describe('formatFileOutput', () => {
  it('파일 경로와 크기를 포함한 JSON 구조 반환', () => {
    const result = formatFileOutput('./output/52-590.png', 38100, { nodeId: '52:590' });

    expect(result.status).toBe('success');
    expect(result.outputFile).toBe('./output/52-590.png');
    expect(result.outputSize).toBe('37.2KB');
    expect(result.metadata.nodeId).toBe('52:590');
  });
});

describe('formatError', () => {
  it('에러 코드와 메시지를 포함한 JSON 구조 반환', () => {
    const result = formatError('CONNECTION_ERROR', '서버에 연결할 수 없습니다.');

    expect(result.status).toBe('error');
    expect(result.error.code).toBe('CONNECTION_ERROR');
    expect(result.error.message).toBe('서버에 연결할 수 없습니다.');
  });
});
