# Architecture

## 두 런타임

| Runtime | 위치 | 책임 | 코드 |
|---|---|---|---|
| Background (Service Worker) | 브라우저 프로세스 | 영속 저장, 비즈니스 로직, 단축키, 컨텍스트 메뉴 | `src/background/` |
| Content Script | 호스트 페이지 안 | UI, 이벤트 감지, DOM, 사용자 인터랙션 | `src/content/` |
| 공유 | — | 타입, 메시지 스키마, 상수 | `src/shared/` |

Background 는 DOM 을 모르고, Content 는 영속 저장을 모른다. 모든 통신은 `src/shared/messages.ts` 의 타입 안전 RPC.

## 디렉토리

```
src/
├── shared/                  # 양쪽 import 가능, 부수효과 없음
│   ├── types.ts             # HistoryItem, LegacyHistoryItem
│   ├── messages.ts          # RpcRequest discriminated union
│   ├── sensitive.ts         # 민감정보 감지 (순수)
│   ├── site-policy.ts       # 도메인 매칭 (순수)
│   └── constants.ts
├── background/
│   ├── index.ts             # 메시지 라우터 + 컨텍스트 메뉴 + 단축키
│   ├── history.ts           # CRUD + 백업
│   ├── storage.ts           # chrome.storage.local 어댑터
│   ├── site-policy.ts       # storage 어댑터 (defaults + user list)
│   └── legacy-decompress.ts # v1 LZ read-only (만료는 NEXT.md 참조)
└── content/
    ├── index.ts             # 부트스트랩
    ├── styles/              # host.ts 가 ?inline 5개 concat → Shadow DOM 주입
    │   ├── base.css         # OKLCH 토큰, 리셋, dark 토큰, reduced-motion
    │   ├── floating.css     # 사이드 패널
    │   ├── cards.css        # Smart Cards
    │   ├── spotlight.css    # 모달
    │   └── toast.css
    ├── core/
    │   ├── host.ts          # Shadow DOM 호스트 (싱글톤) + CSS 주입
    │   ├── rpc.ts           # background 호출 래퍼
    │   ├── copy-detector.ts # copy/keydown → 콜백
    │   ├── theme.ts         # 라이트/다크 컨트롤러
    │   └── toast.ts
    ├── detect/
    │   └── content-type.ts  # 텍스트 → ContentKind (순수)
    ├── floating/
    │   ├── floating-ui.ts       # 조립 + 라이프사이클
    │   ├── floating-header.ts   # 헤더 + site pill 컨트롤러
    │   ├── floating-toolbar.ts  # 검색 + 직접 입력
    │   └── smart-card.ts        # 타입별 렌더 (순수)
    └── spotlight/
        ├── spotlight.ts     # Cmd+Shift+V 모달
        └── fuzzy.ts         # 매처 + <mark> 하이라이트 (순수)
```

## RPC

```
Content (core/rpc.ts) ──sendMessage──► Background (index.ts onMessage → switch)
                      ◄─Promise<Response>─
```

새 메시지 추가:
1. `shared/messages.ts` 의 `RpcRequest` 에 variant 추가
2. `RpcResponse` 매핑
3. `background/index.ts` 의 `handle()` switch case
4. `content/core/rpc.ts` 헬퍼 (선택)

4곳 중 하나라도 빠지면 TypeScript 가 컴파일 에러로 막는다.

## Shadow DOM 격리

호스트 페이지 CSS 와 양방향 차단.

- `core/host.ts` 가 `<div id="copyboard-host">` + `attachShadow({ mode: 'open' })`.
- CSS 5파일을 `?inline` 으로 문자열 import → shadow root `<style>` 주입.
- 모든 UI 는 `ensureShadowRoot()` 안에 mount.
- 호스트 div: `position: fixed; 0×0; pointer-events: none; z-index: 2147483647`. 자식이 본인 `position: fixed` + `pointer-events: auto` 를 가짐.

호스트 div 에 `transform / filter / contain` 등 containing block 생성 속성 금지 — 자식 `position: fixed` 가 viewport 가 아니라 호스트 기준이 되어 깨진다.

## 부트스트랩 (content/index.ts)

```
1. styles/* import (사이드이펙트 없음, string export)
2. ensureShadowRoot()
3. detector = new CopyDetector()
4. theme = new ThemeController() + void theme.init() (비동기, 그리기 안 막음)
5. floating, spotlight 인스턴스 생성 (mount 안 함)
6. detector.setListener(saveHistory) + detector.start()
7. chrome.runtime.onMessage 등록
```

페이지 로드 즉시 DOM 안 건드림. 사용자 액션이 와야 mount.

## 데이터 스키마

```ts
interface HistoryItem {
  id: string;          // base36 timestamp + random suffix
  text: string;
  timestamp: number;
  dateString: string;  // toLocaleString('ko-KR') 표시 캐시
  size: number;
  url?: string;
}
```

불변식:
- `id` 재사용 금지.
- 동일 `text` 중복 추가 시 기존 항목을 맨 위로 promote.
- `cache.length <= MAX_HISTORY_SIZE` (현재 50).

## 의존성 그래프 (비순환)

```
shared/* ── background/storage ── background/legacy
                              └── background/site-policy
                                  background/history ── background/index

shared/* ── content/core/* ── content/detect/*
                              content/floating/*
                              content/spotlight/* ── content/index
```

역방향 import 즉시 거절.

## 새 기능 추가 체크

1. background / content / 둘 다?
2. 새 메시지 필요? → `shared/messages.ts` 부터.
3. 새 컴포넌트면 어느 폴더?
4. 외부 라이브러리 필요? gzip 5KB 이하인가? 정말 필요한가?
5. 순수 함수로 분리 가능한가?

명확하지 않으면 사용자와 먼저 합의.
