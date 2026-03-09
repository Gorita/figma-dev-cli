/**
 * 필드 경로로 데이터에서 값을 추출한다.
 * 경로 형식: "key", "key.subkey", "arr[0]", "arr[0].name"
 */
function getByPath(data: unknown, path: string): unknown {
  let current: unknown = data;
  // "items[0].name" → ["items", "[0]", "name"] 식으로 분해
  const segments = path.match(/[^.[\]]+|\[\d+\]/g);
  if (!segments) return undefined;

  for (const seg of segments) {
    if (current == null) return undefined;

    if (seg.startsWith('[') && seg.endsWith(']')) {
      // 배열 인덱스
      const idx = Number(seg.slice(1, -1));
      if (!Array.isArray(current)) return undefined;
      current = current[idx];
    } else {
      // 객체 키
      if (typeof current !== 'object') return undefined;
      current = (current as Record<string, unknown>)[seg];
    }
  }

  return current;
}

/**
 * 지정된 필드 경로들로 데이터를 필터링한다.
 * fields가 비어있으면 원본을 그대로 반환한다.
 */
export function pickFields(data: unknown, fields: string[]): unknown {
  if (fields.length === 0) return data;

  const result: Record<string, unknown> = {};
  for (const field of fields) {
    result[field] = getByPath(data, field);
  }
  return result;
}
