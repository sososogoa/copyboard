# Testing

테스트는 회귀 방지가 80%, 설계 도구가 20%. 모든 코드를 테스트하지 않는다 — 안전망 가치가 작성/유지 비용을 넘는 곳만.

## 무엇을 테스트하는가

### 반드시
순수 함수 (입력 → 출력 결정적):
- `content/detect/content-type.ts::classify()` — 정규식 회귀 잦음
- `content/spotlight/fuzzy.ts::fuzzyMatch() / highlight()`
- `background/history.ts` 의 cleanText, dedup, maxSize cap
- `background/legacy-decompress.ts` — 깨지면 사용자 데이터 손실
- `shared/sensitive.ts`, `shared/site-policy.ts`

### 조건부
- 상태를 들고 있는 클래스는 핵심 메서드만.
- Background 라우팅은 새 메시지 추가 시.

### 하지 않음
- DOM 렌더링 스냅샷 — 수정 비용 폭증, 시각 회귀 못 잡음.
- `chrome.*` API 자체 — mock 비용 대비 가치 낮음, 실제 브라우저에서 검증.
- CSS — 사람 눈으로.
- 사이드이펙트만 있는 함수.

## 도구

- `vitest` + `happy-dom`.
- `vitest.config.ts` 가 Vite alias 공유.
- `chrome.*` 글로벌은 테스트 setup 에서 stub.

## 파일 위치

테스트는 대상 옆 (`.test.ts` 접미사). 코로케이션. 코드를 옮길 때 테스트가 따라간다.

## 스타일

- Table-driven (`it.each`) 우선 — 케이스 추가는 데이터 줄만 늘어난다.
- Arrange / Act / Assert 빈 줄로 분리.
- 한 `it` 에 `expect` 5개 넘으면 분해.
- 이름은 도메인 언어: `it('빈 문자열은 plain 으로 분류된다')`.

```ts
describe('classify', () => {
  it.each([
    ['https://example.com', 'url'],
    ['user@example.com', 'email'],
    ['#4f46e5', 'color'],
    ['{"a": 1}', 'json'],
  ])('classifies %j as %s', (input, expected) => {
    expect(classify(input).kind).toBe(expected);
  });
});
```

## 실행

```bash
npm run test          # watch
npm run test:run      # 1회 (CI / pre-commit)
```

PR / 커밋 전 `test:run` + `typecheck` 그린이 최저선.

## 새 테스트 묻기

1. 이 함수는 순수한가? 그렇다면 가치 매우 높음.
2. 이미 테스트되는 다른 함수에 흡수 가능한가?
3. 같은 함수에 케이스 추가가 새 파일보다 낫지 않은가?
