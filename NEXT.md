# NEXT — 다음 세션에 이어서 할 일

> v2.0 마이그레이션은 끝났고, 빌드/테스트는 그린.
> 이 파일은 다음 작업을 시작할 때 가장 먼저 보는 진입점.

## 🚨 우선순위 1 — 실제 브라우저 검증 (코드 손대기 전에)

`npm run build` → `dist/` 를 Chrome 개발자 모드로 로드하고 다음을 확인:

- [ ] **로드 자체** 가 깨지지 않는지 (`chrome://extensions` 에 에러 표시 없음)
- [ ] 빈 페이지(`about:blank` 또는 단순 HTML)에서 `Cmd+Shift+C` → 플로팅 패널 열림
- [ ] `Cmd+Shift+V` → Spotlight 모달 등장, 입력 자동 포커스
- [ ] 텍스트 선택 + `Cmd+C` → "저장됨" 토스트 + 히스토리에 추가됨
- [ ] **Smart Card 렌더링 확인**:
  - URL 복사 → favicon + host + path 카드
  - `#4f46e5` 복사 → 컬러칩 카드
  - `{"a": 1}` 복사 → JSON 카드 (pretty-print)
  - `const x = 1` 복사 → Code 카드 (lang 라벨)
  - 일반 문장 복사 → Plain 카드
- [ ] Spotlight 에서 `↑↓ Enter Esc` 동작
- [ ] **다크 모드 토글** (헤더 ☀️/🌙 버튼) 정상 작동
- [ ] **시스템 테마 자동 감지** — OS 다크 모드 켜면 첫 실행 시 자동 적용
- [ ] **Shadow DOM 격리** — 무거운 CSS 사이트에서도 UI 가 정상 렌더:
  - Twitter / X
  - Notion
  - GitHub
  - Naver / Daum (한국 사이트)
- [ ] **클릭 통과** — 플로팅 패널 *바깥* 영역 클릭이 호스트 페이지에 정상 도달
  (host 의 `pointer-events: none` 검증)
- [ ] **Spotlight 백드롭 클릭** 으로 모달 닫힘
- [ ] **컨텍스트 메뉴** — 텍스트 우클릭 → "📋 CopyBoard에 저장" 동작
- [ ] **v1 데이터 호환** — 기존 사용자가 있다면 (이미 설치된 v1 위에 v2 로드),
  옛 히스토리가 깨지지 않고 마이그레이션 되는지

**깨지는 게 발견되면 NEXT.md 하단에 issue 메모 후 수정.**

---

## 🎨 우선순위 2 — `/impeccable polish` 1회 (디자인 doctrine 반영)

DESIGN.md 에 박아둔 룰 중 코드와 충돌하는 게 하나 있음:

> **The Tinted Neutral Rule.** 모든 neutral 은 Indigo hue 쪽으로 미세하게 기울어야 한다. `#ffffff` / `#000` 같은 무채색은 사용하지 않는다.

현재 `src/content/content.css` 토큰:
```css
--cb-bg: #ffffff;          /* 순백 — 룰 위반 */
--cb-bg-elevated: #f9fafb; /* slate, 인디고 hue 아님 */
--cb-text: #111827;        /* 무채색 가까움 */
```

다음 세션에 `/impeccable polish src/content/content.css` 한 번 돌려서:
- 라이트 모드 neutral 을 indigo hue 방향 chroma 0.005~0.01 로 미세 틴트
- DESIGN.json 의 `colorMeta.*.canonical` (OKLCH) 값을 source of truth 로 사용
- 다크 모드도 동일 hue 정렬

목표: 카테고리 reflex (생산성 → 인디고) 가 *우연이 아니라 의도* 로 보이도록.

---

## ⚙️ 우선순위 3 — 기능 후보 (택1)

다음 중 하나를 골라 phase 1개로 작업. 시간 단위 X, 기능 단위로.

### A. 변환 드로어 (Transform Drawer)
선택한 항목에 한 클릭 변환:
- 대소문자 / camelCase / kebab-case / snake_case
- URL encode/decode, Base64, JWT decode
- JSON pretty / minify
- 줄바꿈 정리, 공백 trim

원본을 덮지 않고 **새 항목으로 push** 가 핵심 (실수 복구 가능).

### B. 핀 + 즐겨찾기
- 카드 우상단에 📌 토글
- 핀된 항목은 상단 고정, 50개 한도에서 제외
- `chrome.storage.local` 의 `pinnedIds: string[]` 추가

### C. 도메인별 ON/OFF + 민감정보 마스킹
- 도메인 화이트/블랙리스트 (`localhost` 자동 제외 같은 기본 정책 포함)
- 카드번호 / JWT / AWS 키 정규식 자동 감지 → 저장 거부 또는 마스킹
- 신뢰도/심사 측면에서 가장 임팩트 큼

### D. IndexedDB 마이그레이션 + 무제한 히스토리
- 현재 50개 → 사실상 무제한 (가상 스크롤 필요)
- chrome.storage.local 은 인덱스/검색 한계가 있어, 대량 데이터는 IndexedDB 권장
- `idb` 라이브러리 ~1KB, 표준 wrapper

**추천 순서**: C (보안 신뢰도) → A (사용자 락인) → B → D

---

## 🚀 우선순위 4 — 배포 준비 (선택)

본격 배포할 거면:
- [ ] Chrome Web Store 개발자 등록 ($5 일회성)
- [ ] 스크린샷 / 프로모 이미지 (1280×800)
- [ ] LICENSE 파일 (MIT 추천 — 1인 OSS)
- [ ] CHANGELOG.md 작성 + v2.0.0 git tag
- [ ] GitHub Actions CI: `test:run` + `build` on push
- [ ] README 에 Chrome Web Store 배지 추가

---

## 📋 운영 메모

- **개발 명령어**: `CLAUDE.md` 참조
- **모듈 / 메시지 흐름**: `docs/ARCHITECTURE.md`
- **테스트 작성 규칙**: `docs/TESTING.md`
- **디자인 룰 (Don'ts!)**: `DESIGN.md` 의 6번 섹션
- **전략 / 안티 레퍼런스**: `PRODUCT.md`

---

## 🐛 발견된 이슈 (다음 세션에 수정)

> 이 섹션은 비어있다가, 브라우저 검증에서 깨진 게 발견되면 채워나간다.

(없음 — 아직 검증 전)
