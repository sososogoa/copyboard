# Testing

## 철학

**테스트는 회귀 방지가 80%, 설계 도구가 20%.** 모든 코드를 테스트하려 하지 않는다.
테스트로 얻는 안전망 가치가 작성/유지 비용을 명확히 넘는 곳만 테스트한다.

## 무엇을 테스트하는가

### ✅ 반드시 테스트
- **순수 함수.** 입력 → 출력이 결정적인 코드. 테스트 작성 비용이 가장 낮고 ROI 가 가장 높다.
  - `content/detect/content-type.ts::classify()` — URL/JSON/Color/Code/Email 분류 로직 (정규식 회귀가 가장 자주 일어남)
  - `content/spotlight/fuzzy.ts::fuzzyMatch()` — 매칭 알고리즘 + 점수 계산
  - `content/spotlight/fuzzy.ts::highlight()` — 하이라이트 문자열 → DOM 변환
  - `background/history.ts` 의 cleanText, dedup, maxSize cap 로직
  - `background/legacy-decompress.ts` — v1 → v2 마이그레이션 (한 번 깨지면 사용자 데이터 영구 손실)

### ⚠️ 조건부 테스트
- **상태를 들고 있는 클래스.** 핵심 메서드만. 모든 메서드를 테스트하지 않는다.
- **Background 라우팅.** 새 메시지 타입을 추가할 때만.

### ❌ 테스트하지 않음
- DOM 렌더링 결과 (스냅샷). UI 변경마다 수정 비용 폭증, 시각적 회귀를 잡지도 못함.
- chrome.* API 자체. mock 비용 대비 가치 낮음. 실제 브라우저에서 검증.
- CSS. 시각 회귀는 사람 눈으로.
- 사이드이펙트만 있는 함수. (`saveHistory()` 의 broadcast 등)

## 도구

```
vitest          // 테스트 러너 + assertions
happy-dom       // DOM 시뮬레이션 (jsdom 보다 빠르고 가벼움)
```

설정:
- `vitest.config.ts` — Vite 설정과 alias 공유
- `happy-dom` 환경 (`environment: 'happy-dom'`)
- chrome.* 글로벌은 테스트 setup 에서 stub

## 파일 위치 / 명명

테스트 파일은 **테스트 대상 옆**에 둔다 (코로케이션). `.test.ts` 접미사.

```
src/content/detect/
├── content-type.ts
└── content-type.test.ts   ← 옆에
```

이유: import 경로가 짧고, 코드를 옮길 때 테스트가 따라간다.

## 작성 스타일

### Table-driven 우선
같은 함수의 여러 입력을 검증할 땐 `it.each` 또는 `describe.each` 로 묶는다.
케이스를 추가할 때 코드 라인이 아니라 데이터 라인이 늘어난다.

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

### Arrange / Act / Assert 분리
3 줄 이하의 단순 케이스도 명시적으로 빈 줄로 분리.

### 한 테스트 한 단언
한 `it` 블록에 `expect` 가 5개 넘어가면 분해 검토.

### 도메인 언어로 이름
`it('returns null when text is empty')` 가 아니라 `it('빈 문자열은 plain 으로 분류된다')`.

## 실행

```bash
npm run test          # watch 모드 (개발 중)
npm run test:run      # 1회 실행 (CI / pre-commit)
npm run test:ui       # vitest UI (선택, npm install --save-dev @vitest/ui)
```

모든 PR / 커밋 전 `npm run test:run` 그린 + `npm run typecheck` 그린이 최저선.

## 새 테스트를 쓸 때 묻는 것

1. 이 함수는 *순수* 한가? 그렇다면 테스트 가치 매우 높음.
2. 이미 테스트되는 다른 함수의 표면 아래로 숨길 수 있는가?
3. 같은 함수의 더 많은 케이스를 추가하는 게, 새 테스트 파일을 만드는 것보다 낫지 않은가?

테스트는 코드보다 *덜* 중요하지 않지만, 코드보다 *더* 많지도 않아야 한다.
