/**
 * Tiny fuzzy matcher: case-insensitive, character-by-character match with
 * proximity bonus. Returns null when query characters can't be matched in order.
 */

export interface FuzzyResult {
  score: number;
  /** matched character indices in the source */
  matches: number[];
}

export function fuzzyMatch(query: string, source: string): FuzzyResult | null {
  if (!query) return { score: 0, matches: [] };
  const q = query.toLowerCase();
  const s = source.toLowerCase();

  let qi = 0;
  let lastMatch = -1;
  let score = 0;
  const matches: number[] = [];

  for (let i = 0; i < s.length && qi < q.length; i++) {
    if (s[i] === q[qi]) {
      const isWordStart = i === 0 || /[\s_\-/.@:]/.test(s[i - 1] ?? '');
      const adjacent = lastMatch === i - 1;
      let bonus = 1;
      if (adjacent) bonus += 4;
      if (isWordStart) bonus += 6;
      score += bonus;
      matches.push(i);
      lastMatch = i;
      qi++;
    }
  }

  if (qi < q.length) return null;
  // shorter strings rank higher when score ties
  score += Math.max(0, 50 - source.length) * 0.05;
  return { score, matches };
}

export function highlight(text: string, matches: number[]): DocumentFragment {
  const frag = document.createDocumentFragment();
  if (matches.length === 0) {
    frag.appendChild(document.createTextNode(text));
    return frag;
  }
  const set = new Set(matches);
  let buf = '';
  let inMatch = false;

  const flush = () => {
    if (!buf) return;
    if (inMatch) {
      const mark = document.createElement('mark');
      mark.textContent = buf;
      frag.appendChild(mark);
    } else {
      frag.appendChild(document.createTextNode(buf));
    }
    buf = '';
  };

  for (let i = 0; i < text.length; i++) {
    const isMatch = set.has(i);
    if (isMatch !== inMatch) {
      flush();
      inMatch = isMatch;
    }
    buf += text[i];
  }
  flush();
  return frag;
}
