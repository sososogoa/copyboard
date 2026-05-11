# CLAUDE.md

CopyBoard 작업 시 가장 먼저 읽는 파일.

## 5원칙

1. **단일 책임.** 파일 250–300줄 상한 가이드. `index.ts` 는 조립만, 로직은 형제 모듈에.
2. **표준 패턴.** Vite + Vitest + happy-dom + TypeScript strict + `noUncheckedIndexedAccess` + Manifest V3 + `@crxjs/vite-plugin` + Shadow DOM `?inline` CSS.
3. **Perf-aware.** DOM 쓰기는 `requestAnimationFrame`, 리스너 디바운스/스로틀, 큰 리스트는 가상 스크롤, 불필요한 `chrome.runtime.sendMessage` 라운드트립 금지, gzip 번들 30KB 이하.
4. **신중한 검증.** 처음 쓰는 API 는 공식 문서 확인. 가정 기반 수정 금지. 빌드 통과 ≠ 동작 — 실제 브라우저 테스트가 필요하면 사용자에 확인 요청.
5. **스파게티 금지.** 순환 의존 금지. 양방향 결합 금지. 전역 `window.xxx` 금지. defensive try-catch 남발 금지. 함수 cyclomatic complexity ≥ 7 이면 분해.

## 작업 시작 전

1. `PRODUCT.md` — 전략 충돌 확인.
2. `DESIGN.md` — 비주얼 룰 확인.
3. `docs/ARCHITECTURE.md` — 모듈 경계 확인.
4. 새 파일 만들기 전 기존 파일에 추가 가능한지 검토.
5. 외부 라이브러리는 마지막 카드 (gzip 5KB 이하만 후보).

## 명령어

```bash
npm run dev         # Vite HMR
npm run build       # tsc + vite build (CI gate)
npm run typecheck
npm run test        # vitest watch
npm run test:run    # 1회 (CI gate)
```

빌드/테스트가 빨강이면 작업이 끝난 게 아니다.

## 참조

- 비주얼: [DESIGN.md](./DESIGN.md)
- 모듈/RPC: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- 테스트: [docs/TESTING.md](./docs/TESTING.md)
