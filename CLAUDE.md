# CLAUDE.md — CopyBoard 프로젝트 헌법

이 파일은 CopyBoard 코드베이스에서 작업하는 모든 AI 에이전트(및 사람 기여자)가
**가장 먼저** 읽어야 하는 단일 진입점이다.

---

## 5가지 개발 원칙 (절대 우선순위)

이 다섯 항목은 다른 모든 가이드보다 우선한다. 충돌하면 이 원칙이 이긴다.

### 1. 단일 책임 원칙 (Single Responsibility)
하나의 파일은 하나의 책임만 가진다. 한 파일이 두 역할을 겸하기 시작하는 순간 분리한다.
**구체 기준:**
- 한 파일 길이 약 250–300줄을 상한 가이드로 본다. 넘어가면 분해를 검토.
- 토스트 그리는 코드가 history-manager 안에 들어있는 식의 혼재 금지.
- `index.ts`는 조립만 하고, 로직은 같은 폴더의 형제 모듈에 위임.

### 2. 표준 업계 방식 (Industry Standard)
실험적/특이한 패턴 대신 검증된 표준 패턴을 사용한다.
- 빌드: Vite (Rollup) — 표준
- 테스트: Vitest + happy-dom — 2025+ Vite 프로젝트 기본
- 타입: TypeScript strict + `noUncheckedIndexedAccess`
- Chrome Extension: Manifest V3, `@crxjs/vite-plugin`
- Shadow DOM: `attachShadow({ mode: 'open' })` + `?inline` CSS 주입 패턴
- 의문이 들면 *"GitHub trending Chrome extension 들이 어떻게 하는가"* 가 기본 기준.

### 3. Perf-aware (성능 항상 고려)
모든 결정에 성능을 고려한다. 측정 없이 추측하지 않는다.
**상시 체크리스트:**
- DOM 쓰기 직전에 `requestAnimationFrame` / `IntersectionObserver` 으로 묶을 수 있는가
- 이벤트 리스너에 디바운스/스로틀이 필요한가 (300ms는 임의 값 — 측정 후 결정)
- 큰 리스트는 가상 스크롤 / 키 기반 diff 가 필요한가
- 불필요한 chrome.runtime.sendMessage 라운드트립이 있는가
- 프로덕션 번들 크기 — gzipped 30KB 이하 유지 목표

### 4. 신중한 검증 (Careful Verification)
**오만하지 않는다.** 모든 것을 안다고 가정하지 않는다.
- 처음 쓰는 API/라이브러리는 공식 문서를 fetch 후 사용
- 최신 권장 패턴은 web search로 확인 (특히 Chrome 확장은 변경이 잦음)
- 코드를 수정하기 전 *현재 어떻게 동작하는지* 를 먼저 읽고 이해
- 가정에 기반한 수정 금지 — 가정은 명시적으로 검증할 것
- 실제 브라우저 테스트가 필요하면 사용자에게 *"확인 부탁"* 하고 멈춘다 — 빌드만 통과한 걸 "동작" 이라 보고하지 않는다

### 5. 스파게티 코드 금지 (No Spaghetti)
"기능이 실행되면 OK" 라는 사고는 금지. 정밀한 구조가 없는 코드는 받아들이지 않는다.
**구체 가드레일:**
- 순환 의존(circular import) 금지. 발견 즉시 모듈 경계 재설계.
- 양방향 결합(`a.ts` ↔ `b.ts`) 금지. 한쪽이 다른 쪽을 *모르도록* 인터페이스/이벤트로 분리.
- 전역 변수 (`window.xxx`) 금지. `import` 로만 의존성 표현.
- "혹시 모르니까" 코드 (defensive try-catch 남발, 안 쓰는 매개변수) 금지.
- 함수 한 개의 분기가 cyclomatic complexity ≥ 7 이면 분해.

---

## 프로젝트 구조 한 눈에

```
copyboard/
├── PRODUCT.md         ← 전략 (사용자, 브랜드, 안티 레퍼런스, 원칙)
├── DESIGN.md          ← 비주얼 시스템 (컬러, 타이포, 컴포넌트 가이드)
├── DESIGN.json        ← DESIGN.md 의 머신 리더블 사이드카
├── CLAUDE.md          ← 이 파일 (개발 헌법)
├── docs/
│   ├── ARCHITECTURE.md   ← 모듈 경계, 메시지 흐름, 부트스트랩 순서
│   └── TESTING.md        ← 테스트 철학, 무엇을 / 어떻게 테스트하는가
├── src/               ← 모든 소스 코드 (자세한 구조는 ARCHITECTURE.md)
└── README.md          ← 사용자/기여자 진입점
```

---

## 작업 시작 전 체크리스트

새 작업을 시작할 때 항상 다음 순서를 지킨다:

1. **PRODUCT.md** 를 읽고 이 변경이 전략적 원칙과 충돌하지 않는지 확인.
2. **DESIGN.md** 를 읽고 비주얼 변경이 Named Rules 를 위반하지 않는지 확인.
3. **docs/ARCHITECTURE.md** 를 읽고 변경이 모듈 경계를 침범하지 않는지 확인.
4. 새 파일을 만들기 전, 기존 파일에 더할 자리가 있는지 먼저 검토.
5. 외부 라이브러리 추가는 마지막 카드. 5KB gzipped 이하만 검토 후보.

---

## 명령어 단축

```bash
npm run dev         # Vite dev (HMR — content script HMR 일부 제약)
npm run build       # tsc + vite build (CI gate)
npm run typecheck   # tsc --noEmit
npm run test        # vitest (watch 모드)
npm run test:run    # vitest 1회 실행 (CI gate)
```

빌드/테스트가 빨강이면 작업이 끝난 게 아니다.

---

## 추가 참조

- 비주얼 doctrine: [DESIGN.md](./DESIGN.md)
- 모듈 / 메시지 흐름: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- 테스트 가이드: [docs/TESTING.md](./docs/TESTING.md)
- 사용자 README: [README.md](./README.md)
