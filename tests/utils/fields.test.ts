import { describe, it, expect } from 'vitest';
import { pickFields } from '../../src/utils/fields.js';

describe('pickFields', () => {
  it('단일 키 선택', () => {
    const data = { xml: '<frame />', guidance: '참고 사항' };
    expect(pickFields(data, ['xml'])).toEqual({ xml: '<frame />' });
  });

  it('여러 키 선택', () => {
    const data = { xml: '<frame />', guidance: '참고', extra: 123 };
    expect(pickFields(data, ['xml', 'guidance'])).toEqual({
      xml: '<frame />',
      guidance: '참고',
    });
  });

  it('배열 인덱스 접근 (texts[0])', () => {
    const data = { texts: ['코드', 'guidance1', 'guidance2'] };
    expect(pickFields(data, ['texts[0]'])).toEqual({ 'texts[0]': '코드' });
  });

  it('배열 인덱스 범위 초과 시 undefined', () => {
    const data = { texts: ['코드'] };
    expect(pickFields(data, ['texts[5]'])).toEqual({ 'texts[5]': undefined });
  });

  it('중첩 점 표기법 (definitions.primary-color)', () => {
    const data = { definitions: { 'primary-color': '#ff0000', 'font-size': '16px' } };
    expect(pickFields(data, ['definitions.primary-color'])).toEqual({
      'definitions.primary-color': '#ff0000',
    });
  });

  it('존재하지 않는 키 선택 시 undefined', () => {
    const data = { xml: '<frame />' };
    expect(pickFields(data, ['nonexistent'])).toEqual({ nonexistent: undefined });
  });

  it('빈 필드 목록이면 원본 데이터 그대로 반환', () => {
    const data = { xml: '<frame />', guidance: '참고' };
    expect(pickFields(data, [])).toEqual(data);
  });

  it('data가 배열이면 인덱스 접근', () => {
    const data = ['첫번째', '두번째', '세번째'];
    expect(pickFields(data, ['[1]'])).toEqual({ '[1]': '두번째' });
  });

  it('복합 경로: 배열 인덱스 + 점 표기법', () => {
    const data = {
      items: [
        { name: 'Button', source: './Button.tsx' },
        { name: 'Card', source: './Card.tsx' },
      ],
    };
    expect(pickFields(data, ['items[0].name'])).toEqual({ 'items[0].name': 'Button' });
  });
});
