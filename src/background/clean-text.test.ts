import { describe, it, expect } from 'vitest';
import { cleanText, newId } from './clean-text';
import { MAX_TEXT_LENGTH, MIN_TEXT_LENGTH } from '@/shared/constants';

describe('cleanText', () => {
  it('일반 문자열은 그대로 반환', () => {
    expect(cleanText('hello world')).toBe('hello world');
  });

  it('앞뒤 공백 제거', () => {
    expect(cleanText('   spaced   ')).toBe('spaced');
  });

  it('null / undefined / 숫자 등 비-문자열은 null', () => {
    expect(cleanText(null)).toBeNull();
    expect(cleanText(undefined)).toBeNull();
    expect(cleanText(42)).toBeNull();
    expect(cleanText({})).toBeNull();
  });

  it(`최소 길이(${MIN_TEXT_LENGTH}) 미만이면 null`, () => {
    expect(cleanText('ab')).toBeNull();
    expect(cleanText('  a  ')).toBeNull();
    expect(cleanText('')).toBeNull();
  });

  it('정확히 최소 길이는 통과', () => {
    expect(cleanText('abc')).toBe('abc');
  });

  it(`최대 길이(${MAX_TEXT_LENGTH}) 초과 시 잘림 표시`, () => {
    const long = 'x'.repeat(MAX_TEXT_LENGTH + 100);
    const result = cleanText(long);
    expect(result).not.toBeNull();
    expect(result!.endsWith('... (잘림)')).toBe(true);
    expect(result!.length).toBeLessThanOrEqual(MAX_TEXT_LENGTH + '... (잘림)'.length);
  });

  it('정확히 최대 길이는 잘리지 않는다', () => {
    const exact = 'x'.repeat(MAX_TEXT_LENGTH);
    const result = cleanText(exact);
    expect(result).toBe(exact);
  });
});

describe('newId', () => {
  it('동일 시각/랜덤 입력은 결정적', () => {
    expect(newId(1000, 0.5)).toBe(newId(1000, 0.5));
  });

  it('다른 시각이면 다른 id', () => {
    expect(newId(1000, 0.5)).not.toBe(newId(2000, 0.5));
  });

  it('충돌 방지: 같은 ms 안에서도 random 으로 갈라진다', () => {
    expect(newId(1000, 0.1)).not.toBe(newId(1000, 0.9));
  });

  it('출력은 영숫자(base36)만 포함', () => {
    const id = newId();
    expect(/^[0-9a-z]+$/.test(id)).toBe(true);
  });

  it('합리적인 길이 (8자 이상)', () => {
    expect(newId().length).toBeGreaterThanOrEqual(8);
  });
});
