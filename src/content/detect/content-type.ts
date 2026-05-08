/**
 * Classifies a clipboard text into a discriminated content kind so the UI
 * can render type-specific cards.
 */

export type ContentKind =
  | { kind: 'url'; url: string }
  | { kind: 'email'; address: string }
  | { kind: 'phone'; number: string }
  | { kind: 'color'; css: string; rgb: { r: number; g: number; b: number; a: number } }
  | { kind: 'json'; parsed: unknown; pretty: string }
  | { kind: 'code'; lang: CodeLang; lines: number }
  | { kind: 'markdown'; lines: number }
  | { kind: 'plain' };

export type CodeLang =
  | 'js'
  | 'ts'
  | 'json'
  | 'html'
  | 'css'
  | 'sql'
  | 'shell'
  | 'python'
  | 'go'
  | 'java'
  | 'unknown';

const URL_RE = /^https?:\/\/[^\s]+$/i;
const EMAIL_RE = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
const PHONE_RE = /^[+()0-9\s.-]{7,}$/;
const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const RGB_RE = /^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)(?:[\s,/]+(\d*\.?\d+))?\s*\)$/i;
const HSL_RE = /^hsla?\(\s*(\d+)[\s,]+(\d+)%[\s,]+(\d+)%(?:[\s,/]+(\d*\.?\d+))?\s*\)$/i;
const MD_HEADING_RE = /^#{1,6}\s+\S/m;
const MD_LIST_RE = /^[-*+]\s+\S/m;
const MD_LINK_RE = /\[[^\]]+\]\([^)]+\)/;

const CODE_HINTS: Array<[RegExp, CodeLang]> = [
  [/^\s*(import|export)\s.+from\s+['"]/m, 'ts'],
  [/^\s*(const|let|var)\s+\w+\s*=/, 'js'],
  [/^\s*function\s+\w+\s*\(/, 'js'],
  [/^\s*<!DOCTYPE html|<html|<\/?[a-z]+(\s|>)/i, 'html'],
  [/^\s*[.#]?[\w-]+\s*\{[^}]*:\s*[^;]+;/m, 'css'],
  [/^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER)\s/i, 'sql'],
  [/^\s*#!\/.*\b(bash|sh|zsh)\b/, 'shell'],
  [/^\s*\$\s+\w+/, 'shell'],
  [/^\s*(def|class)\s+\w+|^\s*import\s+\w+(\s+as\s+\w+)?$/m, 'python'],
  [/^\s*package\s+\w+|^\s*func\s+\w+\s*\(/m, 'go'],
  [/^\s*(public|private|protected)\s+(class|interface)\s+\w+/m, 'java'],
];

export function classify(rawText: string): ContentKind {
  const text = rawText.trim();
  if (!text) return { kind: 'plain' };

  const single = !text.includes('\n');

  if (single) {
    if (URL_RE.test(text)) return { kind: 'url', url: text };
    if (EMAIL_RE.test(text)) return { kind: 'email', address: text };
    if (HEX_RE.test(text)) {
      const rgb = parseHex(text);
      if (rgb) return { kind: 'color', css: text.toLowerCase(), rgb };
    }
    const rgbMatch = RGB_RE.exec(text);
    if (rgbMatch) {
      const r = clamp255(rgbMatch[1]);
      const g = clamp255(rgbMatch[2]);
      const b = clamp255(rgbMatch[3]);
      const a = rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1;
      if (r !== null && g !== null && b !== null) {
        return { kind: 'color', css: text, rgb: { r, g, b, a } };
      }
    }
    if (HSL_RE.test(text)) {
      // We render the css value as-is; parsed rgb fallback to mid-gray.
      return { kind: 'color', css: text, rgb: { r: 128, g: 128, b: 128, a: 1 } };
    }
    if (PHONE_RE.test(text) && /\d{3,}/.test(text) && text.replace(/\D/g, '').length >= 7) {
      return { kind: 'phone', number: text };
    }
  }

  const json = tryJson(text);
  if (json) return { kind: 'json', parsed: json.parsed, pretty: json.pretty };

  for (const [re, lang] of CODE_HINTS) {
    if (re.test(text)) return { kind: 'code', lang, lines: text.split('\n').length };
  }

  if (MD_HEADING_RE.test(text) || MD_LIST_RE.test(text) || MD_LINK_RE.test(text)) {
    return { kind: 'markdown', lines: text.split('\n').length };
  }

  return { kind: 'plain' };
}

function tryJson(text: string): { parsed: unknown; pretty: string } | null {
  if (!text.startsWith('{') && !text.startsWith('[')) return null;
  try {
    const parsed = JSON.parse(text) as unknown;
    if (typeof parsed !== 'object' || parsed === null) return null;
    return { parsed, pretty: JSON.stringify(parsed, null, 2) };
  } catch {
    return null;
  }
}

function parseHex(hex: string): { r: number; g: number; b: number; a: number } | null {
  let h = hex.slice(1);
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length === 4) h = h.split('').map((c) => c + c).join('');
  if (h.length !== 6 && h.length !== 8) return null;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
  if ([r, g, b].some((v) => Number.isNaN(v))) return null;
  return { r, g, b, a };
}

function clamp255(s: string | undefined): number | null {
  if (!s) return null;
  const n = parseInt(s, 10);
  if (Number.isNaN(n) || n < 0 || n > 255) return null;
  return n;
}

export function labelOf(kind: ContentKind['kind']): string {
  switch (kind) {
    case 'url':
      return 'URL';
    case 'email':
      return 'Email';
    case 'phone':
      return 'Phone';
    case 'color':
      return 'Color';
    case 'json':
      return 'JSON';
    case 'code':
      return 'Code';
    case 'markdown':
      return 'Markdown';
    case 'plain':
      return 'Text';
  }
}
