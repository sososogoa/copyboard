import { describe, it, expect } from 'vitest';
import { fuzzyMatch, highlight } from './fuzzy';

describe('fuzzyMatch', () => {
  it('빈 쿼리는 score 0, 매칭 없음으로 통과', () => {
    const result = fuzzyMatch('', 'anything');
    expect(result).not.toBeNull();
    expect(result!.score).toBe(0);
    expect(result!.matches).toEqual([]);
  });

  it('완전 일치 매칭', () => {
    const result = fuzzyMatch('cat', 'cat');
    expect(result).not.toBeNull();
    expect(result!.matches).toEqual([0, 1, 2]);
  });

  it('순서대로 매칭되지 않으면 null', () => {
    expect(fuzzyMatch('cat', 'tac')).toBeNull();
  });

  it('빠진 글자가 있으면 null', () => {
    expect(fuzzyMatch('xyz', 'abc')).toBeNull();
  });

  it('대소문자 무관', () => {
    expect(fuzzyMatch('CAT', 'cat')).not.toBeNull();
    expect(fuzzyMatch('cat', 'CAT')).not.toBeNull();
  });

  it('단어 시작 매칭이 더 높은 점수를 받는다', () => {
    const wordStart = fuzzyMatch('fb', 'foo bar');
    const middle = fuzzyMatch('fb', 'fubar');
    expect(wordStart).not.toBeNull();
    expect(middle).not.toBeNull();
    expect(wordStart!.score).toBeGreaterThan(middle!.score);
  });

  it('인접 매칭이 흩어진 매칭보다 높은 점수 (단어 경계 효과 배제)', () => {
    // 'bc' 가 'abcdef' 안에선 인접(b@1, c@2). 'abXcdef' 안에선 떨어짐(b@1, c@3).
    // X 는 word boundary 가 아닌 일반 문자라 word-start 보너스가 동일.
    const adjacent = fuzzyMatch('bc', 'abcdef');
    const scattered = fuzzyMatch('bc', 'abXcdef');
    expect(adjacent).not.toBeNull();
    expect(scattered).not.toBeNull();
    expect(adjacent!.score).toBeGreaterThan(scattered!.score);
  });

  it('짧은 소스가 긴 소스보다 약간 높은 점수 (tie-break)', () => {
    const short = fuzzyMatch('abc', 'abc');
    const long = fuzzyMatch('abc', 'abc' + 'x'.repeat(100));
    expect(short).not.toBeNull();
    expect(long).not.toBeNull();
    expect(short!.score).toBeGreaterThan(long!.score);
  });

  it('한글 매칭', () => {
    const result = fuzzyMatch('ㄱㅅ', 'ㄱㅅ ㅎㅂ');
    expect(result).not.toBeNull();
  });
});

describe('highlight', () => {
  it('매칭 없으면 단일 텍스트 노드', () => {
    const frag = highlight('hello', []);
    expect(frag.childNodes.length).toBe(1);
    expect(frag.textContent).toBe('hello');
    expect(frag.firstChild?.nodeType).toBe(Node.TEXT_NODE);
  });

  it('연속 매칭은 한 개의 mark 로 묶인다', () => {
    const frag = highlight('foobar', [0, 1, 2]);
    const marks = (frag as unknown as ParentNode).querySelectorAll
      ? Array.from((frag as unknown as ParentNode).querySelectorAll('mark'))
      : Array.from(frag.childNodes).filter((n) => (n as Element).tagName === 'MARK');
    expect(marks.length).toBe(1);
    expect((marks[0] as Element).textContent).toBe('foo');
  });

  it('떨어진 매칭은 여러 mark 로 분리', () => {
    const frag = highlight('abcde', [0, 2, 4]);
    const wrap = document.createElement('div');
    wrap.appendChild(frag);
    const marks = Array.from(wrap.querySelectorAll('mark'));
    expect(marks).toHaveLength(3);
    expect(marks.map((m) => m.textContent)).toEqual(['a', 'c', 'e']);
  });

  it('전체 텍스트가 보존된다', () => {
    const frag = highlight('hello world', [0, 1, 2, 3, 4]);
    const wrap = document.createElement('div');
    wrap.appendChild(frag);
    expect(wrap.textContent).toBe('hello world');
  });
});
