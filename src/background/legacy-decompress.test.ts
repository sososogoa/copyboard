import { describe, it, expect } from 'vitest';
import { migrateLegacyItem } from './legacy-decompress';
import type { LegacyHistoryItem } from '@/shared/types';

const baseItem = {
  id: 'abc123',
  timestamp: 1700000000000,
  dateString: '2023-11-14',
};

describe('migrateLegacyItem', () => {
  it('비압축 v1 항목을 그대로 v2 모양으로 변환', () => {
    const legacy: LegacyHistoryItem = {
      ...baseItem,
      text: 'hello',
      size: 5,
      compressed: false,
    };
    const result = migrateLegacyItem(legacy);
    expect(result.id).toBe('abc123');
    expect(result.text).toBe('hello');
    expect(result.size).toBe(5);
    expect((result as Partial<LegacyHistoryItem>).compressed).toBeUndefined();
    expect((result as Partial<LegacyHistoryItem>).data).toBeUndefined();
  });

  it('size 가 누락되면 text.length 로 채움', () => {
    const legacy: LegacyHistoryItem = {
      ...baseItem,
      text: 'world',
    };
    expect(migrateLegacyItem(legacy).size).toBe(5);
  });

  it('url 이 있으면 보존, 없으면 누락', () => {
    const withUrl = migrateLegacyItem({
      ...baseItem,
      text: 't',
      url: 'https://example.com',
    });
    expect(withUrl.url).toBe('https://example.com');

    const withoutUrl = migrateLegacyItem({ ...baseItem, text: 't' });
    expect(withoutUrl.url).toBeUndefined();
  });

  it('압축 해제 실패 시 원본 text 로 폴백 (사용자 데이터 손실 방지)', () => {
    const legacy: LegacyHistoryItem = {
      ...baseItem,
      text: 'fallback text',
      size: 13,
      compressed: true,
      data: 'this is not valid LZ JSON',
    };
    const result = migrateLegacyItem(legacy);
    expect(result.text).toBe('fallback text');
  });
});
