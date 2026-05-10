/**
 * Detects whether a clipboard string is "obviously sensitive" — credentials,
 * tokens, or PII that the user almost certainly does not want sitting in a
 * 50-slot clipboard history. Pure function, no side effects, no chrome.*.
 *
 * Strategy: full-string match only (after trim). We refuse to flag substrings
 * — a code block that happens to embed a token should not silently fail to
 * save. The user explicitly copied just the token if the whole string matches.
 *
 * Adding a new pattern: append to `detectSensitive`'s switch + a row to
 * sensitive.test.ts. Keep regexes anchored (`^...$`).
 */

export type SensitiveKind = 'jwt' | 'aws-key' | 'card' | 'rrn';

export function detectSensitive(text: string): SensitiveKind | null {
  const t = text.trim();
  if (!t) return null;

  if (JWT_RE.test(t)) return 'jwt';
  if (AWS_KEY_RE.test(t)) return 'aws-key';
  if (RRN_RE.test(t)) return 'rrn';
  if (looksLikeCard(t)) return 'card';
  return null;
}

export function sensitiveLabel(kind: SensitiveKind): string {
  switch (kind) {
    case 'jwt':
      return 'JWT 토큰';
    case 'aws-key':
      return 'AWS 액세스 키';
    case 'card':
      return '카드 번호';
    case 'rrn':
      return '주민등록번호';
  }
}

// Three base64url-ish segments separated by dots; the typical JWT header
// starts with `eyJ` (base64 of `{"`). Tight enough to avoid flagging plain
// base64 blobs while still catching real-world tokens.
const JWT_RE = /^eyJ[A-Za-z0-9_-]+={0,2}\.[A-Za-z0-9_-]+={0,2}\.[A-Za-z0-9_-]+={0,2}$/;

// AWS access key prefixes per the IAM identifier docs (AKIA = user, ASIA =
// session, AROA = role, etc.) followed by exactly 16 uppercase alphanumeric.
const AWS_KEY_RE = /^(?:AKIA|ASIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASCA)[A-Z0-9]{16}$/;

// 한국 주민등록번호: 6자리 - (1|2|3|4)5자리. 90년 이전 출생자는 1/2, 이후는 3/4.
const RRN_RE = /^\d{6}-[1-4]\d{6}$/;

function looksLikeCard(t: string): boolean {
  if (!/^[\d\s-]+$/.test(t)) return false;
  const digits = t.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  return luhnValid(digits);
}

function luhnValid(digits: string): boolean {
  let sum = 0;
  let dbl = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits.charCodeAt(i) - 48;
    if (dbl) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}
