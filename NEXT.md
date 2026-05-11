# NEXT

진행 중 / 완료 작업 + 만료 예정 코드.

## TODO — Phase 2 브라우저 검증

`npm run build` 후 `chrome://extensions` 에서 `dist/` 재로드. 이미 열린 탭은 `Cmd+R`.

- [ ] YouTube 썸네일 우클릭 → "링크 주소 저장" → 히스토리에 favicon URL 카드
- [ ] 일반 이미지 우클릭 → "미디어 주소 저장"
- [ ] AWS 키 / JWT / 카드번호(Luhn) / 주민번호 선택 후 `Cmd+C` → 거부 토스트 + 히스토리 미포함
- [ ] localhost / 127.0.0.1 페이지에서 헤더 pill = "OFF (기본 차단)" 비활성
- [ ] 일반 사이트 pill 클릭 → ON/OFF 토글, 차단 도메인에서 `Cmd+C` 자동 저장 거부
- [ ] 수동 textarea 입력은 site-policy 우회, 민감정보 게이트는 적용
- [ ] 차단 사이트 컨텍스트 메뉴 클릭은 조용히 거부 (토스트 없음 — 미구현)

## TODO — Phase 3 배포

- [ ] Chrome Web Store 개발자 등록 ($5)
- [ ] 스크린샷 1280×800 (Smart Card 4종 + Spotlight Amber 매치)
- [ ] LICENSE (MIT)
- [ ] CHANGELOG + v2.0.0 git tag
- [ ] GitHub Actions CI (`test:run` + `build`)
- [ ] README 에 "확장 재로드 후 이미 열린 탭은 새로고침 필요" 안내

## 만료 예정 코드

| 모듈 | 만료 |
|---|---|
| `src/background/legacy-decompress.ts` | v2.5 release 또는 2026-11-11 중 빠른 쪽 |

v1 LZ 압축 데이터 read-only 변환. v2 로 한 번 업그레이드되면 storage 가 plain text 로 재기록되어 이 경로는 한 번만 필요. 함께 제거: `LegacyHistoryItem` (`shared/types.ts`), `legacy-decompress.test.ts`, `history.ts` 의 `migrateLegacyItem` 호출.

## 기능 후보 (Phase 4+)

사용자 피드백 1건 들어올 때까지 결정 보류.

- **변환 드로어** — case 변환, URL/Base64 enc/dec, JWT decode, JSON pretty/minify. 원본 덮지 않고 새 항목 push.
- **핀** — 카드 상단 토글, 50개 한도 제외. `pinnedIds: string[]` 추가.
- **IndexedDB** — 무제한 히스토리 + 가상 스크롤. `idb` 라이브러리 ~1KB.

## Dev-only vulnerabilities (보류)

vite 5→8 메이저 점프 + `@crxjs/vite-plugin@beta` 호환 검증 필요. Phase 3 와 묶을 후보.

- `esbuild < 0.24.2` (vite 5 경유): dev server cross-origin. 프로덕션 무영향.
- `rollup < 2.80.0` (@crxjs/vite-plugin 경유): 빌드 path traversal. 신뢰된 로컬 빌드만 영향.

## 완료

- **2026-05-10 Phase 1** — 브라우저 검증 그린. 함정: 확장 재로드 시 이미 열린 탭은 `Cmd+R` 필요.
- **2026-05-11 Phase 2** — 민감정보 거부 (JWT/AWS/카드/RRN, full-string 매칭), 도메인 정책 (localhost 기본 차단 + 사이트 토글), 컨텍스트 메뉴 link/image/video/audio. 번들 12→13.6KB, 테스트 83→126.
- **2026-05-11 Phase 2.5** — neutral 토큰을 DESIGN.json OKLCH 카논으로 정렬 (`#ffffff`/`#000` 0건). `--cb-on-accent`, `--cb-accent-hover` 도입.
- **2026-05-11 Phase 2.6** — `floating-ui.ts` 346→208줄로 분해 (header/toolbar 모듈 신규). `content.css` 610줄 → `styles/` 5파일. `@types/chrome` 0.1.42, `@types/node` ^22 LTS 정정. 테스트 126/126.
