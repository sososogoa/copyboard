# Architecture

## 1. 두 개의 런타임 (Two Runtimes)

Chrome 확장은 본질적으로 **두 개의 분리된 자바스크립트 환경**에서 동시에 돈다.
이 분리를 흐리는 코드는 99% 의 버그의 원인이다.

| 런타임 | 위치 | 책임 | 코드 위치 |
|--------|------|------|----------|
| **Background (Service Worker)** | 브라우저 프로세스 | 영속 저장, 비즈니스 로직, 단축키, 컨텍스트 메뉴 | `src/background/` |
| **Content Script** | 호스트 페이지 안 | UI, 이벤트 감지, DOM 조작, 사용자 인터랙션 | `src/content/` |
| **공유 (둘 다 import)** | — | 타입, 메시지 스키마, 상수 | `src/shared/` |

**규칙:** Background 는 DOM 을 모른다. Content 는 영속 저장을 모른다. 그 사이의 모든 통신은 `src/shared/messages.ts` 의 타입 안전한 RPC 를 거친다.

## 2. 디렉토리

```
src/
├── shared/                  # background / content 양쪽 import 가능. 부수효과 없음.
│   ├── types.ts             # HistoryItem, LegacyHistoryItem
│   ├── messages.ts          # RpcRequest discriminated union + 타입 안전 sender
│   └── constants.ts         # 키, 길이 제한, ID
├── background/              # Service Worker 진입점만 외부 노출
│   ├── index.ts             # 메시지 라우터, 컨텍스트 메뉴, 단축키
│   ├── history.ts           # CRUD + 백업 (in-memory cache + persistence)
│   ├── storage.ts           # chrome.storage.local 어댑터
│   └── legacy-decompress.ts # v1 LZ 데이터 read-only 마이그레이션
└── content/
    ├── index.ts             # Content Script 부트스트랩
    ├── content.css          # ?inline 으로 import — Shadow DOM 에 주입
    ├── core/
    │   ├── host.ts          # Shadow DOM 호스트 (싱글톤)
    │   ├── rpc.ts           # background 호출 래퍼 (Promise 기반)
    │   ├── copy-detector.ts # copy / keydown 이벤트 → 콜백
    │   ├── theme.ts         # 라이트/다크 컨트롤러 (subscribe 패턴)
    │   └── toast.ts         # 토스트 레이어 (Shadow DOM 안에 mount)
    ├── detect/
    │   └── content-type.ts  # 텍스트 → ContentKind 분류 (순수 함수)
    ├── floating/
    │   ├── floating-ui.ts   # 사이드 패널 컴포넌트
    │   └── smart-card.ts    # 타입별 카드 렌더러 (순수: HistoryItem → HTMLElement)
    └── spotlight/
        ├── spotlight.ts     # Cmd+Shift+V 모달
        └── fuzzy.ts         # 퍼지 매처 + <mark> 하이라이트 (순수 함수)
```

## 3. 메시지 흐름 (RPC)

```
 ┌────────────────┐                         ┌─────────────────────┐
 │ Content Script │                         │ Background SW       │
 │                │  sendMessage(action)    │                     │
 │ core/rpc.ts    │ ──────────────────────► │ index.ts onMessage  │
 │                │                         │   ↓ switch(action)  │
 │                │ ◄────────────────────── │   handlers          │
 │                │     Promise<Response>   │                     │
 └────────────────┘                         └─────────────────────┘
```

**모든 메시지의 단일 진실은 `src/shared/messages.ts` 의 `RpcRequest` discriminated union.**
새 메시지를 추가하려면:
1. `RpcRequest` 에 새 variant 추가
2. `RpcResponse` 매핑 추가
3. background `index.ts` 의 `handle()` switch 에 case 추가
4. content `core/rpc.ts` 에 헬퍼 함수 추가 (선택)

이 4곳을 모두 안 고치면 TypeScript 가 컴파일 에러로 막는다 (이게 핵심).

## 4. Shadow DOM 격리

**왜:** content script 가 호스트 페이지에 주입되므로, 호스트의 CSS (`body { ... }`,
`* { box-sizing: ... }`) 가 우리 UI 를 깨뜨릴 수 있다. 거꾸로 우리 CSS 가
호스트로 새서도 안 된다. Shadow DOM 이 양방향을 차단한다.

**구현:**
- `src/content/core/host.ts` 가 단일 호스트 `<div id="copyboard-host">` 를
  `document.body` 에 붙이고, 그 위에 `attachShadow({ mode: 'open' })`.
- `import cssText from '../content.css?inline'` 로 CSS 를 *문자열* 로 가져와
  shadow root 안의 `<style>` 에 주입. 페이지 `document.head` 로는 새지 않는다.
- 모든 UI 컴포넌트(floating, spotlight, toast)는 `ensureShadowRoot()` 로 root 를
  얻고 그 안에 mount.
- 호스트 div 는 `position: fixed; top:0; left:0; width:0; height:0; pointer-events: none; z-index: 2147483647`. 자식들은 본인이 필요한 `position: fixed` + `pointer-events: auto` 를 가짐.

**카비앗:**
- `?inline` 은 dev 모드 HMR 일부 제약 (이슈 #600). 운영 빌드는 영향 없음.
- 호스트 div 에 `transform`, `filter`, `contain: strict` 같은 *containing block 생성 속성*은 절대 넣지 않는다 — 자식의 `position: fixed` 가 viewport 가 아닌 호스트 기준이 되어 깨진다.

## 5. 부트스트랩 순서

```
content/index.ts:
  1. import './content.css?inline'        // 사이드이펙트 없음 (string export)
  2. ensureShadowRoot()                   // 호스트 + style 주입
  3. detector = new CopyDetector()        // localStorage 에서 enabled 상태 로드
  4. theme = new ThemeController()        // chrome.storage 비동기 로드
  5. void theme.init()                    // 비동기 — 화면 그리기는 안 막음
  6. floating = new FloatingUI({ deps })  // 아직 mount 안 함
  7. spotlight = new Spotlight({ deps })  // 아직 mount 안 함
  8. detector.setListener(saveHistory)
  9. detector.start()                     // copy / keydown 리스너 부착
 10. chrome.runtime.onMessage 등록        // toggleFloating, openSpotlight 등 수신
```

**미는 게 아니라 `대기 중`:** 4–7 이 비동기지만 사용자 액션 (단축키, 클릭) 이 와야 mount 된다. 페이지 로드 즉시 DOM 을 건드리지 않는다 — 호스트 페이지 부담 최소화.

## 6. 데이터 스키마

```ts
interface HistoryItem {
  id: string;          // base36 timestamp + random suffix, 고유성 보장
  text: string;        // 검증 + clean 거친 텍스트 (trim, 길이 제한)
  timestamp: number;   // Date.now()
  dateString: string;  // toLocaleString('ko-KR') — 표시용 캐시
  size: number;        // text.length
  url?: string;        // 복사 발생 페이지 (선택)
}
```

**불변식:**
- `id` 는 절대 재사용 금지.
- 동일 `text` 는 히스토리에 두 번 들어가지 않음 (중복 추가 시 기존 항목을 맨 위로 promote).
- `cache.length <= MAX_HISTORY_SIZE` (현재 50).

## 7. 모듈 의존성 그래프 (의도된 비순환)

```
shared/* ────────────────────────────────────────┐
   ↑                                             │
   ├─── background/storage ── background/legacy  │
   │                       ↑                     │
   │                       └──── background/history
   │                                  ↑
   └──────────────────────────────────┴── background/index

shared/* ────────────────────────────────────────┐
   ↑                                             │
   ├──── content/core/* ── content/detect/*      │
   │                                ↑            │
   │                                ├── content/floating/*
   │                                └── content/spotlight/*
   │                                ↑
   └────────────────────────────────┴── content/index
```

**규칙:** 화살표는 한 방향만. 역방향 import 가 보이면 즉시 거절.

## 8. 새 기능을 추가할 때

자신에게 묻는다 (이 순서로):
1. 이건 background 일인가, content 일인가? 아니면 둘 다?
2. 새 메시지 타입이 필요한가? 그렇다면 `shared/messages.ts` 부터 시작.
3. 새 컴포넌트인가, 기존 확장인가? 새 컴포넌트면 어느 폴더?
4. 외부 라이브러리가 필요한가? gzipped 5KB 이하인가? 정말 *필요* 한가?
5. 테스트할 수 있는 순수 함수로 분리할 수 있는 부분이 있는가? (예: classify, fuzzy)

답이 명확하지 않다면 코드 쓰지 말고 사용자와 먼저 합의한다.
