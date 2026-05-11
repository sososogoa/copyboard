---
name: CopyBoard
description: A pocketknife-precise clipboard manager for keyboard-first humans.
colors:
  ink-indigo: "#4f46e5"
  ink-indigo-soft: "#eef2ff"
  ink-indigo-dim: "#818cf8"
  sand-cream: "#ffffff"
  sand-cream-elevated: "#f9fafb"
  sand-cream-warm: "#f3f4f6"
  graphite-900: "#111827"
  graphite-500: "#6b7280"
  graphite-200: "#e5e7eb"
  late-night-slate: "#1f2937"
  late-night-deep: "#111827"
  late-night-soft: "#374151"
  blade-emerald: "#10b981"
  blade-vermilion: "#ef4444"
  blade-amber: "#f59e0b"
typography:
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  spotlight-prompt:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "9.5px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.06em"
  mono:
    fontFamily: "'JetBrains Mono', 'SF Mono', Menlo, Consolas, monospace"
    fontSize: "11.5px"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "normal"
rounded:
  hairline: "4px"
  blade: "6px"
  handle: "8px"
  pocket: "12px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
---

# Design System

토큰은 위 frontmatter 또는 `src/content/styles/base.css` 의 OKLCH 변수 참조.

## Colors

### Accent — One Voice
시스템의 단 하나의 액센트는 **Ink Indigo**. 화면의 10% 이내. 포커스 링 / 활성 상태 / primary 버튼 / 통계 강조에만. Indigo 외 두 번째 액센트 도입 금지.

- Light: `ink-indigo` (`#4f46e5`)
- Light 활성 행 / 포커스 글로우: `ink-indigo-soft` (`#eef2ff`)
- Dark: `ink-indigo-dim` (`#818cf8`)

### Neutral — Tinted
모든 neutral 은 Indigo hue 쪽 미세 틴트. `#ffffff` / `#000` 금지. 실제 OKLCH 값은 `base.css` 의 `--cb-bg`, `--cb-bg-elevated`, `--cb-bg-hover`, `--cb-text`, `--cb-muted`, `--cb-border` 참조.

### Semantic (의미 전달 — 데코 금지)
- `blade-emerald` (`#10b981`): 자동 감지 ON, 저장 성공.
- `blade-vermilion` (`#ef4444`): 삭제 / 에러 / 위험. 화면당 최대 1회.
- `blade-amber` (`#f59e0b`): Spotlight 매칭 글자 하이라이트만.

### Content-Type Badges

| Type | Light bg / fg | Dark bg / fg |
|---|---|---|
| URL | `#dbeafe` / `#1d4ed8` | `#1e3a8a` / `#bfdbfe` |
| Email | `#dcfce7` / `#166534` | `#14532d` / `#bbf7d0` |
| Phone | `#ede9fe` / `#5b21b6` | `#4c1d95` / `#ddd6fe` |
| Color | `#fef3c7` / `#92400e` | `#78350f` / `#fde68a` |
| JSON | `#fee2e2` / `#991b1b` | `#7f1d1d` / `#fecaca` |
| Code | `#e0e7ff` / `#3730a3` | `#312e81` / `#c7d2fe` |
| Markdown | `#ccfbf1` / `#0f766e` | `#134e4a` / `#99f6e4` |
| Plain | `#f3f4f6` / `#6b7280` | `#374151` / `#9ca3af` |

## Typography

- Font: 시스템 산세리프. 외부 폰트 임포트 금지.
- Mono: JetBrains Mono → SF Mono → Menlo → Consolas. 코드 카드 / `<kbd>` 만.
- Scale: Spotlight 입력 18px (400) / Headline 15px (700, `-0.01em`) / Body 13px (400–500) / Label 9.5px (700, UPPERCASE, `0.06em`) / Mono 11.5px (400).
- Headline 은 화면당 1개를 넘지 않는다.

## Elevation

평소 평면. 그림자는 인터랙션 결과로만.

- **Resting**: 그림자 없음, 1px 보더만.
- **Hover Lift**: `0 4px 14px -4px rgba(79, 70, 229, 0.25)`.
- **Floating Panel**: `0 20px 25px -5px rgba(0,0,0,0.12), 0 8px 10px -6px rgba(0,0,0,0.06)`.
- **Spotlight**: `0 30px 60px -15px rgba(0,0,0,0.4)`. 시스템에서 단 하나의 진짜 입체.

## Components

### Smart Cards
8px 라디우스 (`handle`), Sand Cream Elevated, 1px Graphite 200 보더 (호버 시 Indigo). 패딩 10–12px.

헤더 = 타입 배지 + 상대 시간 + 호버 시 삭제 버튼 (90° 회전).

본문 분기:
- URL: favicon + host + path
- Color: 체커보드 위 컬러칩 + RGB
- JSON: 12줄 pretty preview, monospace
- Code: 언어 라벨 + monospace
- Email / Phone: glyph + 링크
- Plain: 220자 컷

호버: `translateY(-1px)` + Indigo ambient + 보더 색 전환, 220ms ease-out.

### Spotlight
- Backdrop: `rgba(15, 23, 42, 0.45)` + `backdrop-filter: blur(6px)`.
- Panel: 14px 라디우스, Spotlight 그림자, `pop-in` 0.22s.
- Input: 18px, 56px 높이, 보더 없음, 하단 1px 디바이더.
- Active Row: Indigo Soft 배경 + 1px Indigo outline.
- Match Highlight: `<mark>` + `rgba(245, 158, 11, 0.3)` + 700.
- Hint Bar: `<kbd>` mono 폰트.

### Buttons
8px 라디우스. Primary = Indigo 배경 / on-accent 텍스트, 호버 시 `accent-hover` + `translateY(1px)`. Ghost Danger = 투명 / Vermilion 텍스트 / 1px Graphite 보더. Icon = 28×28 투명, 닫기만 호버 시 Vermilion 채움.

### Pill Toggle
999px (`pill`), 5×10 패딩. ON = Emerald, OFF = Sand Cream Warm + Graphite 500.

### Inputs
Sand Cream Elevated, 1px Graphite 200, 8px 라디우스, 36px 높이. 포커스: Indigo 보더 + `0 0 0 3px Indigo Soft` 링.

### Toasts
플로팅 열림: 그 아래 12px. 닫힘: 화면 우상단 20px. 10px 라디우스, 1px 보더, 미세 그림자. Variants: autosave / copied (Emerald 보더), undo (Vermilion 보더 + action 버튼), restored (Indigo 보더), info (회색). `slide-in-right` 280ms ease-out, 1.8–5s.

### Content-Type Badges
999px, 9.5px UPPERCASE, `0.06em` letter-spacing, 2×7 패딩. Spotlight 행에서는 60px 고정 폭으로 정렬, 카드에서는 콘텐츠 폭에 맞춤.

## Don'ts

- 측면 컬러 스트라이프 (`border-left: 4px solid ...`)
- 그라데이션 텍스트 (`background-clip: text`)
- 글래스모피즘 데코 — `backdrop-filter` 는 Spotlight 백드롭에만
- 헤로 메트릭 / 사이드바 + 그리드 / "Welcome back"
- Roboto + 푸른 FAB + 5dp 그림자
- 두꺼운 그라데이션 헤더 + 형광 액센트
- Indigo 외 두 번째 액센트
- 균일한 카드 그리드
- 모달을 첫 답으로 — Spotlight 외 인터랙션은 inline
- 카테고리-색 자동매칭 ("클립보드 = 노랑", "생산성 = 보라" 등)
