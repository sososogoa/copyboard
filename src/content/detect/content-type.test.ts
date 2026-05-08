import { describe, it, expect } from 'vitest';
import { classify, labelOf, type ContentKind } from './content-type';

describe('classify', () => {
  describe('URL', () => {
    it.each([
      'https://example.com',
      'http://localhost:3000',
      'https://www.google.com/search?q=hello',
      'https://sub.domain.co.kr/path/to/page#anchor',
    ])('인식: %s', (input) => {
      const result = classify(input);
      expect(result.kind).toBe('url');
      if (result.kind === 'url') expect(result.url).toBe(input);
    });

    it('http(s) 프리픽스가 없으면 URL 이 아니다', () => {
      expect(classify('example.com').kind).not.toBe('url');
    });

    it('여러 줄 텍스트는 URL 분류에서 제외된다', () => {
      expect(classify('https://example.com\nfollowed by text').kind).not.toBe('url');
    });
  });

  describe('Email', () => {
    it.each([
      'user@example.com',
      'a.b+tag@sub.example.co.kr',
      'CAPS@DOMAIN.COM',
    ])('인식: %s', (input) => {
      expect(classify(input).kind).toBe('email');
    });

    it('@ 가 없으면 email 이 아니다', () => {
      expect(classify('userexample.com').kind).not.toBe('email');
    });
  });

  describe('Color', () => {
    it.each([
      ['#fff', { r: 255, g: 255, b: 255, a: 1 }],
      ['#4f46e5', { r: 79, g: 70, b: 229, a: 1 }],
      ['#FFFFFFFF', { r: 255, g: 255, b: 255, a: 1 }],
    ])('hex: %s', (input, expected) => {
      const result = classify(input);
      expect(result.kind).toBe('color');
      if (result.kind === 'color') expect(result.rgb).toEqual(expected);
    });

    it('rgb() 함수형식 인식', () => {
      const result = classify('rgb(79, 70, 229)');
      expect(result.kind).toBe('color');
      if (result.kind === 'color') {
        expect(result.rgb.r).toBe(79);
        expect(result.rgb.g).toBe(70);
        expect(result.rgb.b).toBe(229);
      }
    });

    it('rgba() 알파값 포함 인식', () => {
      const result = classify('rgba(0, 0, 0, 0.5)');
      expect(result.kind).toBe('color');
      if (result.kind === 'color') expect(result.rgb.a).toBe(0.5);
    });

    it('hsl() 인식', () => {
      expect(classify('hsl(220, 100%, 50%)').kind).toBe('color');
    });

    it('잘못된 hex (#xyz) 는 color 가 아니다', () => {
      expect(classify('#xyz').kind).not.toBe('color');
    });

    it('rgb 범위 초과 (300) 은 color 가 아니다', () => {
      expect(classify('rgb(300, 0, 0)').kind).not.toBe('color');
    });
  });

  describe('JSON', () => {
    it('단순 객체 인식', () => {
      const result = classify('{"a": 1, "b": "x"}');
      expect(result.kind).toBe('json');
      if (result.kind === 'json') {
        expect(result.parsed).toEqual({ a: 1, b: 'x' });
        expect(result.pretty).toContain('\n');
      }
    });

    it('배열 인식', () => {
      expect(classify('[1, 2, 3]').kind).toBe('json');
    });

    it('숫자만 (스칼라) 은 JSON 으로 분류하지 않는다', () => {
      expect(classify('42').kind).not.toBe('json');
    });

    it('깨진 JSON 은 분류하지 않는다', () => {
      expect(classify('{ broken: }').kind).not.toBe('json');
    });
  });

  describe('Code', () => {
    it('TypeScript import 문 인식', () => {
      const result = classify("import { foo } from 'bar';");
      expect(result.kind).toBe('code');
      if (result.kind === 'code') expect(result.lang).toBe('ts');
    });

    it('JS 변수 선언 인식', () => {
      const result = classify('const router = useRouter()');
      expect(result.kind).toBe('code');
      if (result.kind === 'code') expect(result.lang).toBe('js');
    });

    it('HTML 태그 인식', () => {
      const result = classify('<div class="hello">world</div>');
      expect(result.kind).toBe('code');
      if (result.kind === 'code') expect(result.lang).toBe('html');
    });

    it('SQL 쿼리 인식', () => {
      const result = classify('SELECT * FROM users WHERE id = 1');
      expect(result.kind).toBe('code');
      if (result.kind === 'code') expect(result.lang).toBe('sql');
    });

    it('Python def 인식', () => {
      const result = classify('def hello():\n    print("hi")');
      expect(result.kind).toBe('code');
      if (result.kind === 'code') expect(result.lang).toBe('python');
    });

    it('Go func 인식', () => {
      const result = classify('package main\n\nfunc main() {}');
      expect(result.kind).toBe('code');
      if (result.kind === 'code') expect(result.lang).toBe('go');
    });
  });

  describe('Markdown', () => {
    it('헤딩 인식', () => {
      expect(classify('# Heading\nbody text').kind).toBe('markdown');
    });

    it('리스트 인식', () => {
      expect(classify('- item one\n- item two').kind).toBe('markdown');
    });

    it('링크 인식', () => {
      expect(classify('see [docs](https://example.com) here').kind).toBe('markdown');
    });
  });

  describe('Plain', () => {
    it('빈 문자열은 plain', () => {
      expect(classify('').kind).toBe('plain');
    });

    it('일반 산문은 plain', () => {
      expect(classify('Just a normal sentence with no signals.').kind).toBe('plain');
    });
  });

  describe('우선순위', () => {
    it('JSON 이 single-line code 보다 우선', () => {
      const result = classify('{"const": "x"}');
      expect(result.kind).toBe('json');
    });

    it('URL 이 plain 보다 우선', () => {
      expect(classify('https://x.com').kind).toBe('url');
    });
  });
});

describe('labelOf', () => {
  it.each<[ContentKind['kind'], string]>([
    ['url', 'URL'],
    ['email', 'Email'],
    ['phone', 'Phone'],
    ['color', 'Color'],
    ['json', 'JSON'],
    ['code', 'Code'],
    ['markdown', 'Markdown'],
    ['plain', 'Text'],
  ])('%s → %s', (kind, expected) => {
    expect(labelOf(kind)).toBe(expected);
  });
});
