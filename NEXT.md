# NEXT — 다음 세션에 이어서 할 일

> v2.0 마이그레이션 끝 → Phase 1 브라우저 검증 그린 → Phase 2 (보안 신뢰도) 코드 머지.
> 다음은 Phase 2 의 브라우저 검증 + Phase 3 (배포 준비).

## 🚨 우선순위 0 — Phase 2 브라우저 검증 (먼저)

`npm run build` 후 `dist/` 재로드 (이미 로드된 확장이면 `chrome://extensions` 의 ↻ 버튼).
**기존 Naver 탭처럼 이미 열린 탭은 새로고침 (`Cmd+R`)** 해야 새 콘텐츠 스크립트 주입됨.

- [ ] **링크 우클릭 저장** — YouTube 썸네일에서 우클릭 → "📋 링크 주소를 CopyBoard에 저장" 메뉴 등장 → 클릭 → 토스트 + 히스토리에 URL 카드(favicon) 추가
- [ ] **이미지 우클릭 저장** — 일반 이미지에서 우클릭 → "📋 미디어 주소를 CopyBoard에 저장" → 저장
- [ ] **민감정보 거부** — `AKIAIOSFODNN7EXAMPLE` 같은 더미를 페이지에서 선택 후 `Cmd+C` → "AWS 액세스 키 감지 — 저장하지 않음" 토스트 + 히스토리에 안 들어감
- [ ] **JWT 거부** — jwt.io 의 샘플 토큰 전체 선택 + `Cmd+C` → "JWT 토큰 감지 — 저장하지 않음"
- [ ] **카드/RRN 거부** — `4111-1111-1111-1111` (Visa 테스트), `900101-1234567` (RRN 더미) 도 동일하게 거부
- [ ] **localhost 자동 차단** — `http://localhost:3000` 같은 페이지에서 헤더 pill 이 **"이 사이트 OFF (기본 차단)"** 로 보이고 클릭 비활성, 페이지에서 복사해도 히스토리에 안 들어감
- [ ] **사이트 토글** — 일반 사이트(예: github.com)에서 헤더의 "이 사이트 ON" pill 클릭 → "OFF" 로 바뀌고 토스트 → 그 도메인에서는 `Cmd+C` 자동 저장 거부 → 다시 클릭 → "ON" 복귀
- [ ] **수동 입력은 자유** — 플로팅 textarea 에 그냥 텍스트 입력 후 추가는 (URL 안 붙으니) 사이트 정책 미적용. 단 민감정보 입력 시는 거부됨 (예: `AKIAIOSFODNN7EXAMPLE` 직접 입력)
- [ ] **컨텍스트 메뉴도 게이트 적용** — 차단된 사이트에서 텍스트 우클릭 "📋 CopyBoard에 저장" 클릭 → 거부 (토스트 없이 조용히 — 컨텍스트 메뉴 결과 토스트 미구현)

깨지면 하단 "🐛 발견된 이슈" 섹션 채울 것.

---

## ✅ Phase 1 — 실제 브라우저 검증 (완료, 2026-05-10)

전체 그린. 발견 사항:
- 확장 (재)로드 시점에 이미 열려 있던 탭은 `Cmd+R` 새로고침 필요 — 처음 로드한 사용자가 헷갈릴 수 있는 포인트. **README/설치 안내에 한 줄 박아둘 것** (Phase 3).
- YouTube 썸네일 우클릭으로 영상 URL 을 저장하는 동선이 막혀 있던 갭 발견 → Phase 2 에서 함께 해결.

---

## ✅ Phase 2 — 보안 신뢰도 + 컨텍스트 메뉴 갭 (완료, 2026-05-11)

코드 머지 완료. 다음 모듈 추가/수정:

**새 모듈**
- `src/shared/sensitive.ts` (+ test) — 순수 함수 민감정보 감지 (JWT / AWS 키 / 카드번호 Luhn / 주민번호). full-string 매칭만 — 부분 일치는 일부러 안 잡음 (코드 블록 안에 토큰 박혀있을 때 저장 차단되면 답답함).
- `src/shared/site-policy.ts` (+ test) — 도메인 추출, exact + suffix 매치. defaults: `localhost`, `127.0.0.1`.
- `src/background/site-policy.ts` — chrome.storage.local 어댑터, defaults 와 user list 결합.

**변경 모듈**
- `src/shared/messages.ts` — `addToHistory` 응답에 `rejectedReason` + `sensitiveKind`, 새 RPC `getSitePolicy` / `setSitePolicy`.
- `src/background/index.ts` — `addGated()` 게이트 함수, 컨텍스트 메뉴에 `link` / `image,video,audio` 컨텍스트 추가.
- `src/content/index.ts` — 거부 사유별 토스트.
- `src/content/floating/floating-ui.ts` — 헤더에 "이 사이트 ON/OFF" pill 토글.

**번들 영향**: gzipped 12KB → 13.6KB (+1.6KB). 한도 30KB 안쪽.
**테스트**: 83 → 126 (+43).

**의도된 비동작**
- 컨텍스트 메뉴 거부 시 토스트 없음 (조용히 거부) — UX 우선순위 낮음, 추후 보강.
- 수동 textarea 입력은 site-policy 우회, 민감정보 게이트는 적용. (수동은 명시적 의사라 도메인 게이트는 부적절)
- 기본 차단 (localhost) 은 사용자가 unblock 불가. 포크 사용자만 우회.

---

## ✅ Phase 2.5 — Tinted Neutral Rule 적용 (완료, 2026-05-11)

`/impeccable:polish src/content/content.css` 1회 실행.

`src/content/content.css` 의 neutral CSS 변수 (라이트/다크 양쪽) 를 Tailwind hex 에서 **DESIGN.json OKLCH 카논** 으로 전환:
- 라이트: `oklch(98% 0.003 277)` 같은 sand-cream 277° hue, `oklch(20% 0.03 257)` 같은 graphite 257° hue
- 다크: `oklch(28% 0.04 257)` 같은 late-night 257° hue
- `#ffffff` / `#000` 무채색 사용 0건. 잔존 hex 는 콘텐츠 타입 배지(의미 전달) 와 액센트 4종(One Voice).

**부수 정비**
- 새 토큰 `--cb-on-accent` (`color: #fff` 5곳 치환) — 액센트 위 텍스트도 인디고 방향 미세 틴트.
- 새 토큰 `--cb-accent-hover` (`background: #4338ca` 2곳 치환) — primary 버튼/토스트 액션 hover 일원화.

**번들**: 10.76 → 10.80KB gzipped (+0.04KB).
**테스트**: 변동 없음 (CSS only).

**미해결**: `#0f172a alpha 0.45` Spotlight 백드롭, `rgba(0,0,0,…)` 그림자, `#f0f0f0` 컬러칩 체커 패턴 — 모두 alpha 오버레이 / 데코 패턴이라 토큰화 보류 (의도적).

---

## ⚙️ 우선순위 3 — 기능 후보 (Phase 4 이후, 택1)

C 는 Phase 2 에서 완료. 남은 후보:

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

### D. IndexedDB 마이그레이션 + 무제한 히스토리
- 현재 50개 → 사실상 무제한 (가상 스크롤 필요)
- chrome.storage.local 은 인덱스/검색 한계가 있어, 대량 데이터는 IndexedDB 권장
- `idb` 라이브러리 ~1KB, 표준 wrapper

**추천 순서**: A (사용자 락인) → B → D. 단 *실제 사용자 피드백 1건* 들어올 때까지 결정 보류.

---

## 🚀 Phase 3 — 배포 준비

본격 배포 단계. Phase 2 검증 그린 후 시작.

- [ ] Chrome Web Store 개발자 등록 ($5 일회성)
- [ ] 스크린샷 / 프로모 이미지 (1280×800) — Smart Card 4종 한 장 + Spotlight Amber 매치 한 장
- [ ] LICENSE 파일 (MIT 추천 — 1인 OSS)
- [ ] CHANGELOG.md 작성 + v2.0.0 git tag
- [ ] GitHub Actions CI: `test:run` + `build` on push
- [ ] README 에 Chrome Web Store 배지 추가
- [ ] **README 설치 안내 한 줄 추가**: "확장 (재)로드 후 이미 열려 있던 탭은 새로고침 필요" (Phase 1 검증에서 발견된 함정)

---

## ✅ Phase 2.6 — 구조 정비 + 디펜던시 보건 (완료, 2026-05-11)

CLAUDE.md 5원칙 #1 (SRP) 위반 정비 + typo 정정.

**모듈 분해**
- `src/content/floating/floating-ui.ts`: 346줄 → 208줄. 신규 `floating-header.ts` (148줄, 헤더 DOM + site pill 컨트롤러), `floating-toolbar.ts` (63줄, 검색 + 직접 입력) 분리. 모두 250줄 가이드 이하.
- `src/content/content.css`: 610줄 → `src/content/styles/` 5파일로 분배 (base 80 / floating 199 / cards 146 / spotlight 135 / toast 50). `core/host.ts` 가 `?inline` 5개 concat.

**디펜던시**
- `@types/chrome` 0.0.260 → 0.1.42, `@types/node` `^25` (존재 X 메이저, typo) → `^22` LTS.
- `typescript`, `vite` 는 보류 — vite 5→8 메이저 점프는 `@crxjs/vite-plugin@beta` 호환 검증 비용 큼.

**번들**: gzip 10.89 → 10.93KB (+0.04KB, CSS 분리 주석 비용). 한도 30KB 내.
**테스트**: 126/126 그린 (변동 없음 — 구조 정비라서).

**미해결 (dev-only vulnerabilities)**
- `esbuild < 0.24.2` (vite 5 경유): dev server cross-origin. 프로덕션 무영향.
- `rollup < 2.80.0` (@crxjs/vite-plugin 경유): 빌드 path traversal. 신뢰된 로컬 빌드만 영향.
- 둘 다 vite 8 + @crxjs 별도 검증 후 처리 — Phase 3 와 묶거나 별도 PR.

---

## ⏰ 만료 예정 코드

> 마이그레이션/호환성 코드는 영원히 끌고 가면 스파게티 (5원칙 #5). 만료일이 박혀 있어야 함.

| 모듈 | 만료 조건 | 사유 |
|------|---------|------|
| `src/background/legacy-decompress.ts` | **v2.5 release 또는 2026-11-11 중 빠른 쪽** | v1 LZ 압축 데이터를 read 시점에만 변환. 사용자가 v2 로 한 번이라도 업그레이드 하면 storage 가 plain text 로 재기록 → 이 경로는 한 번만 필요. 6개월이면 활성 사용자 중 v1 leftover 가질 가능성 거의 0. |

만료 시 함께 제거할 것: `LegacyHistoryItem` 타입 (`src/shared/types.ts`), `legacy-decompress.test.ts`, `history.ts` 에서 `migrateLegacyItem` 호출 경로.

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

(Phase 2 검증 대기 중)
