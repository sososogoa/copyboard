# CopyBoard 2.0

복사한 콘텐츠를 자동 저장하고, **Smart Card** UI 와 **Spotlight** 빠른 붙여넣기로
다시 꺼내쓰는 Chrome 확장 프로그램.

## 새로 추가된 핵심 기능

### ⚡ Spotlight (`Ctrl/Cmd + Shift + V`)
- 화면 중앙에 모달 검색창
- 퍼지(fuzzy) 매칭 + 매칭 글자 하이라이트
- 키보드만으로 항해: `↑↓` 이동, `Enter` 복사, `Esc` 닫기
- 마우스 클릭으로도 동작

### 🃏 Smart Content Cards
복사한 텍스트의 **종류를 감지**해 카드 모양이 달라집니다.

| 종류 | 카드 |
| --- | --- |
| URL | favicon + host + 풀 URL |
| Email | `mailto:` 링크 |
| Phone | `tel:` 링크 |
| Color (`#hex`, `rgb()`, `hsl()`) | 색상 칩 + RGB 변환 |
| JSON | pretty-print (12 lines preview) |
| Code | 언어 자동 감지 라벨 + monospace |
| Markdown | 줄바꿈 보존 |
| Plain | 일반 텍스트 |

### 🔍 검색 + 무제한 히스토리
- 플로팅 박스 상단 검색 인풋 (실시간 필터)
- 최대 저장 항목 `10 → 50` 으로 확장

### 🌗 시스템 테마 자동 따라가기
- 처음에는 OS 다크/라이트 모드를 자동 감지
- 수동 토글 시점부터 사용자 선택 우선

---

## 기술 스택

- **언어**: TypeScript 5 (strict + `noUncheckedIndexedAccess`)
- **빌드**: Vite + `@crxjs/vite-plugin` (Manifest V3, HMR 지원)
- **번들러**: Rollup (Vite 내장)
- **저장소**: `chrome.storage.local` (LZ 압축은 v1 데이터 마이그레이션용으로만 잔존)

## 디렉토리 구조

```
src/
├── shared/              # 양쪽에서 공유
│   ├── types.ts         # HistoryItem
│   ├── messages.ts      # 타입 안전한 RPC
│   └── constants.ts
├── background/
│   ├── index.ts         # 진입점 (메시지 라우팅, 단축키, 컨텍스트 메뉴)
│   ├── history.ts       # CRUD + 백업/복원
│   ├── storage.ts       # chrome.storage 어댑터
│   └── legacy-decompress.ts  # v1 LZ 압축 해제 (read 전용)
└── content/
    ├── index.ts         # 진입점 + 메시지 핸들러
    ├── content.css      # 스코프된 스타일
    ├── core/
    │   ├── rpc.ts           # background 호출 래퍼
    │   ├── copy-detector.ts # copy/keydown 감지
    │   ├── theme.ts         # 라이트/다크 컨트롤러
    │   └── toast.ts         # 토스트 레이어
    ├── detect/
    │   └── content-type.ts  # 콘텐츠 종류 분류 (URL/JSON/색상/...)
    ├── floating/
    │   ├── floating-ui.ts   # 사이드 패널
    │   └── smart-card.ts    # 타입별 카드 렌더러
    └── spotlight/
        ├── spotlight.ts     # 중앙 모달 + 키보드 네비
        └── fuzzy.ts         # 퍼지 매처 + 하이라이트
```

## 개발

```bash
npm install
npm run dev        # Vite + HMR (chrome://extensions 에서 dist/ 로드)
npm run build      # 프로덕션 빌드 → dist/
npm run typecheck  # tsc --noEmit
```

### 확장 설치 (개발자 모드)
1. `npm run build`
2. Chrome → `chrome://extensions/`
3. **개발자 모드** 활성화 → **압축해제된 확장 프로그램을 로드** → `dist/` 선택

## 키보드 단축키

| 단축키 | 동작 |
| --- | --- |
| `Ctrl/Cmd + Shift + C` | 플로팅 박스 토글 |
| `Ctrl/Cmd + Shift + V` | Spotlight 열기 |
| Spotlight: `Enter` | 선택 항목 복사 |
| Spotlight: `↑/↓` | 이동 |
| Spotlight: `Esc` | 닫기 |
| 플로팅 박스 textarea: `Ctrl/Cmd + Enter` | 수동 추가 |

## v1 → v2 마이그레이션

기존 `chrome.storage.local` 의 v1 데이터(`copyHistory` 키, LZ 압축 포함)는
첫 실행 시 자동으로 plain text 형식으로 변환됩니다. 사용자 액션 불필요.
