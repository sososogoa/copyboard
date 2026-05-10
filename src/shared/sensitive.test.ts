import { describe, expect, it } from 'vitest';
import { detectSensitive } from './sensitive';

describe('detectSensitive', () => {
  it.each<[string, string]>([
    [
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4ifQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      'jwt',
    ],
    ['AKIAIOSFODNN7EXAMPLE', 'aws-key'],
    ['ASIAIOSFODNN7EXAMPLE', 'aws-key'],
    ['AROA6EXAMPLEXYZ12345', 'aws-key'],
    ['900101-1234567', 'rrn'],
    ['000101-3234567', 'rrn'],
    // Visa test number (passes Luhn)
    ['4111111111111111', 'card'],
    ['4111-1111-1111-1111', 'card'],
    ['4111 1111 1111 1111', 'card'],
    // Mastercard test
    ['5555 5555 5555 4444', 'card'],
  ])('민감 패턴 %j 은 %s 로 감지', (input, kind) => {
    expect(detectSensitive(input)).toBe(kind);
  });

  it.each<[string]>([
    ['hello world'],
    ['https://example.com/path?token=abc'],
    ['{"a":1}'],
    // JWT prefix but only 2 segments
    ['eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0'],
    // 16 caps but no AWS prefix
    ['ABCDEFGHIJKLMNOP'],
    // AWS prefix but with lowercase
    ['AKIAioSfodnn7example'],
    // 16 digits but Luhn fails
    ['1234567890123456'],
    // Card-shape but wrong length (12)
    ['411111111111'],
    // RRN shape but invalid prefix (5)
    ['900101-5234567'],
    // 단순 빈 입력
    [''],
    ['   '],
  ])('일반 입력 %j 은 null 반환', (input) => {
    expect(detectSensitive(input)).toBeNull();
  });

  it('앞뒤 공백은 무시하고 매칭', () => {
    expect(detectSensitive('  AKIAIOSFODNN7EXAMPLE  ')).toBe('aws-key');
  });
});
