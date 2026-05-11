# Product

## Users

키보드 위주의 개발자/디자이너/작가/번역가. 다른 작업 곁에서 잠깐 호출되는 도구 — 본 작업 흐름을 깨면 안 된다.

## Purpose

브라우저 복사 항목을 자동 저장하고 키 두세 번에 다시 꺼낸다. 콘텐츠 종류(URL, 색상, JSON, 코드, 이메일 등)를 인지해 카드 모양을 바꾼다.

성공 기준:
1. Spotlight 한 번 써본 사람은 OS 기본 클립보드로 돌아가기 어색해진다.
2. 카드 한 장만 봐도 다른 클립보드 매니저와 결이 다름을 느낀다.

## Anti-references

- 기업 SaaS 대시보드 클리셰 (헤더 메트릭, 사이드바+그리드, "Welcome back")
- Material Design 표준 룩 (Roboto + FAB)
- 1Password/Honey 류 두꺼운 헤더 + 형광 액센트
- 글래스모피즘, 무지개 그라데이션 텍스트, 측면 컬러 스트라이프, 카테고리-색 자동매칭

## Principles

1. 키보드 먼저, 마우스는 옵션.
2. 콘텐츠가 주인공, UI는 액자.
3. 타입별로 다른 얼굴. 균일 그리드 반대.
4. 액센트 한 가지(Indigo), 폰트 한 시스템, 라디우스 한 패밀리.
5. 모션은 200–280ms exponential ease-out.

## Accessibility

- WCAG 2.1 AA. 본문 4.5:1, 큰 텍스트 3:1.
- 키보드 완전 동작. Tab 순서 = 시각 순서.
- `prefers-reduced-motion`, `prefers-color-scheme` 존중.
- 색만으로 의미 전달 금지 — 배지는 색 + 라벨 텍스트.
- 호스트 페이지 침범 금지 (Shadow DOM + `cb-` 접두사).
