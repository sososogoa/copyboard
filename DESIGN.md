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
components:
  card:
    backgroundColor: "{colors.sand-cream-elevated}"
    textColor: "{colors.graphite-900}"
    rounded: "{rounded.handle}"
    padding: "10px 12px"
  card-hover:
    backgroundColor: "{colors.sand-cream-elevated}"
    textColor: "{colors.graphite-900}"
    rounded: "{rounded.handle}"
    padding: "10px 12px"
  button-primary:
    backgroundColor: "{colors.ink-indigo}"
    textColor: "{colors.sand-cream}"
    rounded: "{rounded.handle}"
    padding: "8px 14px"
  button-ghost:
    backgroundColor: "{colors.sand-cream}"
    textColor: "{colors.blade-vermilion}"
    rounded: "{rounded.handle}"
    padding: "8px 14px"
  pill-detection-on:
    backgroundColor: "{colors.blade-emerald}"
    textColor: "{colors.sand-cream}"
    rounded: "{rounded.pill}"
    padding: "5px 10px"
  pill-detection-off:
    backgroundColor: "{colors.sand-cream-warm}"
    textColor: "{colors.graphite-500}"
    rounded: "{rounded.pill}"
    padding: "5px 10px"
  input-search:
    backgroundColor: "{colors.sand-cream-elevated}"
    textColor: "{colors.graphite-900}"
    rounded: "{rounded.handle}"
    padding: "0 12px"
    height: "36px"
  spotlight-input:
    backgroundColor: "{colors.sand-cream}"
    textColor: "{colors.graphite-900}"
    padding: "0 22px"
    height: "56px"
  badge-content-type:
    backgroundColor: "{colors.ink-indigo-soft}"
    textColor: "{colors.ink-indigo}"
    rounded: "{rounded.pill}"
    padding: "2px 7px"
---

# Design System: CopyBoard

## 1. Overview

**Creative North Star: "The Pocketknife"**

CopyBoard는 한 손에 쥐는 정밀한 도구다. 평소엔 접혀 있고, 일단 펼치면 모든 날이 제자리에 있다. 칼날(Spotlight)은 빠르고 정확하며, 손잡이(플로팅 패널)는 손에 익는 형태고, 표면(neutral 배경)은 점잖은 가죽 케이스 같은 색을 띤다. 화려하지 않다. 다만 잘 만들어졌고, 만든 사람의 손맛이 느껴진다.

이 시스템은 **기업 SaaS 대시보드 클리셰**, **Material Design 표준 룩**, **기존 Chrome 확장 클리셰** 를 명시적으로 거부한다. 거대한 메트릭 카드, 형광 액센트 배지, 균일한 카드 그리드는 이 도구의 결과 정반대다. AI 슬롭 미감 — 무지개 그라데이션 텍스트, 의미 없는 글래스모피즘, 측면 컬러 스트라이프 — 도 같다.

**Key Characteristics:**
- 키보드가 마우스보다 먼저 도달하는 인터페이스
- 콘텐츠 종류에 따라 카드의 얼굴이 바뀜 (균일성의 반대)
- 평면이 기본, 그림자는 인터랙션의 이벤트
- 한 가지 액센트(Ink Indigo), 한 가지 라디우스 패밀리, 한 가지 모션 곡선
- 1인 OSS 답게 깎인 디테일 — 맥락에 맞춰 변하는 토스트 위치, 매칭 글자 하이라이트, 손에 익는 단축키

## 2. Colors: The Pocketknife Palette

칼의 표면, 손잡이의 가죽, 잉크의 깊이를 기억하는 팔레트. 채도는 의도적으로 낮고, 액센트는 한 곳에서만 강하게 떨어진다.

### Primary
- **Ink Indigo** (`#4f46e5`): 시스템의 단 하나의 액센트. 포커스 링, 활성 상태, primary 버튼, 통계 강조 숫자에만 등장. 화면의 10% 이내로 통제한다.
- **Ink Indigo Soft** (`#eef2ff`): Spotlight 활성 행의 배경. 포커스 링의 그림자 톤. Indigo가 "있음"을 알리되 소리 지르지 않는 용도.
- **Ink Indigo Dim** (`#818cf8`): 다크 모드의 Indigo. 어두운 배경에서 같은 의미로 작동하는 톤 다운된 형제.

### Neutral — The Sand Cream / Late Night Pair
라이트 모드는 **Sand Cream**, 다크 모드는 **Late Night Slate**. 절대 검정도 절대 흰색도 아니다.

- **Sand Cream** (`#ffffff`): 라이트 모드 본문 배경. 모래 같은 종이 톤을 지향한다. *(현재 순백, 추후 indigo 미세 틴트로 수정 예정 — Don'ts 참조.)*
- **Sand Cream Elevated** (`#f9fafb`): 카드와 입력 필드의 한 단계 위 surface. Sand Cream 위에 놓이는 종이.
- **Sand Cream Warm** (`#f3f4f6`): 호버 상태, 비활성 pill. 따뜻한 회색.
- **Graphite 900** (`#111827`): 본문 텍스트. 진하지만 검정은 아님.
- **Graphite 500** (`#6b7280`): muted 텍스트, 날짜, 헬퍼.
- **Graphite 200** (`#e5e7eb`): 테두리, 디바이더. 항상 1px.
- **Late Night Slate** (`#1f2937`): 다크 모드 본문 배경. 짙은 청회색.
- **Late Night Deep** (`#111827`): 다크 모드 카드 elevated surface.
- **Late Night Soft** (`#374151`): 다크 모드 호버 / 입력 필드.

### Tertiary — The Blade Edge (rare semantic)
의미 전달용 — 데코로 쓰지 않는다.

- **Blade Emerald** (`#10b981`): 자동 감지 ON, 저장 성공 토스트. "동작 중" 상태.
- **Blade Vermilion** (`#ef4444`): 삭제, 에러, 위험. 최대 1회 등장.
- **Blade Amber** (`#f59e0b`): Spotlight 매칭 글자 하이라이트. 그 외엔 등장 금지.

### Content-Type Badges
콘텐츠 종류 라벨. 채도는 일관되게 낮음. 다크 모드에서 hue 유지 + 명도 반전.

| Type | Light bg / fg | Dark bg / fg |
| --- | --- | --- |
| URL | `#dbeafe` / `#1d4ed8` | `#1e3a8a` / `#bfdbfe` |
| Email | `#dcfce7` / `#166534` | `#14532d` / `#bbf7d0` |
| Phone | `#ede9fe` / `#5b21b6` | `#4c1d95` / `#ddd6fe` |
| Color | `#fef3c7` / `#92400e` | `#78350f` / `#fde68a` |
| JSON | `#fee2e2` / `#991b1b` | `#7f1d1d` / `#fecaca` |
| Code | `#e0e7ff` / `#3730a3` | `#312e81` / `#c7d2fe` |
| Markdown | `#ccfbf1` / `#0f766e` | `#134e4a` / `#99f6e4` |
| Plain | `#f3f4f6` / `#6b7280` | `#374151` / `#9ca3af` |

### Named Rules
**The One Voice Rule.** 시스템의 정체성을 책임지는 색은 **Ink Indigo 단 하나**다. 화면의 10% 이내에서만 등장한다. 두 번째 액센트를 만들고 싶다면 만들지 마라.

**The Tinted Neutral Rule.** 모든 neutral은 Indigo hue 쪽으로 미세하게 기울어야 한다. `#ffffff` / `#000` 같은 무채색은 사용하지 않는다. (현 코드는 점진 마이그레이션 중.)

**The Category-Reflex Refusal.** 클립보드 = 노랑, 생산성 = 보라 같은 카테고리 자동 반응을 거부한다. CopyBoard의 Indigo는 카테고리가 시켜서가 아니라 *Pocketknife의 잉크* 라서 선택됐다.

## 3. Typography

**Headline / Body Font:** 시스템 산세리프 (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Apple SD Gothic Neo', 'Noto Sans KR'`). 새 폰트를 임포트하지 않는다 — Pocketknife는 가벼워야 한다.

**Mono Font:** `JetBrains Mono → SF Mono → Menlo → Consolas`. 코드 블록과 키보드 힌트(`<kbd>`)에서만 등장.

**Character:** 대부분의 화면을 13px 본문이 차지한다. Headline은 단 하나(플로팅 패널 제목). 대비는 *크기*보다 *역할의 명확성*으로 만든다.

### Hierarchy
- **Spotlight Prompt** (400, `18px`, `1.3`): Spotlight 모달 입력. 시스템에서 가장 큰 글자. 사용자가 "지금 키보드 위에 있다"는 신호.
- **Headline** (700, `15px`, `1.2`, `-0.01em`): 플로팅 패널 헤더 제목. 단 한 곳.
- **Body** (400-500, `13px`, `1.5`): 카드 안의 텍스트, 입력 placeholder, 통계 라인.
- **Label** (700, `9.5px`, `0.06em` letter-spacing, UPPERCASE): 콘텐츠 타입 배지, Spotlight 행의 타입 prefix.
- **Mono** (400, `11.5px`, `1.45`): 코드 카드 내부, 키보드 힌트.

### Named Rules
**The Single Voice Rule.** 폰트 패밀리는 단 두 개 — 시스템 산세리프 + JetBrains Mono. 추가 임포트 금지.
**The Quiet Hierarchy Rule.** 헤딩은 한 화면당 한 개를 넘지 않는다. 강조는 색이 아니라 weight 와 위치로.

## 4. Elevation

**제한적 입체감 (Pocketknife 전략).** 카드와 패널은 평소 평면이다. 그림자는 *상태의 이벤트* 로만 등장한다 — 호버 시 부드럽게 떠오르고, Spotlight가 열릴 때만 진짜 입체가 된다.

라이트 모드는 매우 옅은 ambient shadow + 1px 보더의 조합으로 깊이를 만든다. 다크 모드는 그림자를 거의 쓰지 않고, 밝기 레이어 (`Late Night Slate → Deep → Soft`) 의 차이로 위계를 만든다.

### Shadow Vocabulary
- **Resting** (`0 0`): 카드 기본 상태. 그림자 없음. 1px 테두리만.
- **Hover Lift** (`box-shadow: 0 4px 14px -4px rgba(79, 70, 229, 0.25)`): 카드 호버 — Indigo가 살짝 번지는 듯한 ambient.
- **Floating Panel** (`box-shadow: 0 20px 25px -5px rgba(0,0,0,0.12), 0 8px 10px -6px rgba(0,0,0,0.06)`): 페이지 위에 떠 있는 패널을 명확히 구분.
- **Spotlight Heroic** (`box-shadow: 0 30px 60px -15px rgba(0,0,0,0.4)`): 시스템에서 단 하나의 진짜 입체. 모달이 등장하는 순간에만.

### Named Rules
**The Flat-By-Default Rule.** 표면은 평소 평평하다. 그림자는 인터랙션의 결과로만 나타난다.
**The Heroic Spotlight Rule.** 시스템에서 가장 강한 elevation은 Spotlight 모달에만 허용된다. 다른 어떤 컴포넌트도 그보다 더 큰 그림자를 가질 수 없다.

## 5. Components

### Smart Cards (시그니처 컴포넌트)
복사한 항목 한 건을 보여주는 가장 중요한 단위. 콘텐츠 종류를 인지하는 순간 본문 영역이 바뀐다.

- **Shape:** 8px 라디우스 (`{rounded.handle}`). 모서리 부드럽지만 둥글지 않다.
- **Background:** Sand Cream Elevated (`#f9fafb`).
- **Border:** 1px Graphite 200. 호버 시 Ink Indigo.
- **Internal Padding:** 10–12px. 좁다. 콘텐츠가 우선이다.
- **Header:** 콘텐츠 타입 배지 + 상대 시간 (`방금`, `3분 전`) + 삭제 버튼 (호버 시에만 등장, 호버 시 90도 회전).
- **Body 분기:** URL → favicon + host + path 2줄. Color → 체커보드 배경 위 컬러칩 + RGB 값. JSON → 12줄 pretty preview, monospace. Code → 언어 라벨 + monospace. Email/Phone → glyph + tappable 링크. Plain → 220자 컷 텍스트.
- **Hover Lift:** `translateY(-1px)` + Indigo ambient shadow + 보더 색 전환. 220ms ease-out.

### Spotlight (시그니처 컴포넌트)
화면 중앙 모달. 시스템에서 가장 격식 있는 표면.

- **Backdrop:** `rgba(15, 23, 42, 0.45)` + 6px backdrop-filter blur. 호스트 페이지를 부드럽게 가린다.
- **Panel:** Sand Cream, 14px 라디우스, Heroic shadow. `pop-in` 애니메이션 (0.22s, exponential ease-out).
- **Input:** 18px 산세리프, 56px 높이, 보더 없음, 하단 1px 디바이더. placeholder는 Graphite 500.
- **Active Row:** Ink Indigo Soft 배경 + 1px Indigo outline. 키보드 ↑↓ 으로만 이동. 마우스 클릭 시 즉시 commit.
- **Match Highlight:** 매칭 글자에 `<mark>` 태그 — `rgba(245, 158, 11, 0.3)` 배경 + `font-weight: 700`. Blade Amber의 유일한 등장 지점.
- **Hint Bar:** 하단 8px 16px 패딩. `<kbd>` 요소로 단축키 시각화. mono 폰트.

### Buttons
한 화면에 두 개 이상 있을 일이 거의 없다. 군더더기 없는 모양.

- **Shape:** 8px 라디우스 (`{rounded.handle}`).
- **Primary:** Ink Indigo 배경, 흰색 텍스트, 12px 폰트 700, 8×14 패딩. 호버 시 약간 어두워지고 `translateY(1px)`. 트랜지션 220ms.
- **Ghost Danger** (전체 삭제): 투명 배경, Vermilion 텍스트, 1px Graphite 보더. 호버 시 Vermilion 배경 채움.
- **Icon Button:** 28×28, 8px 라디우스, 투명 배경. `× 닫기` 호버 시 Vermilion 채움. 다른 아이콘은 Graphite hover.

### Pill Toggle (자동 감지 ON/OFF)
- **Shape:** 999px (pill).
- **ON:** Blade Emerald 배경, 흰색 텍스트.
- **OFF:** Sand Cream Warm 배경, Graphite 500 텍스트, 1px 보더.
- **Padding:** 5×10. 글자가 거의 다 차게.

### Inputs / Search
- **Style:** Sand Cream Elevated, 1px Graphite 200, 8px 라디우스, 36px 높이.
- **Focus:** 보더 → Ink Indigo, 추가로 `0 0 0 3px Ink Indigo Soft` 그림자. 글로우가 아니라 *링*.
- **Placeholder:** Graphite 500.

### Toasts
- **Position:** 플로팅 패널이 열려있으면 그 아래 12px, 닫혀있으면 화면 우상단 20px.
- **Shape:** 10px 라디우스, 1px 보더, 미세한 그림자.
- **Variants:** autosave (Emerald 보더), copied (Emerald), undo (Vermilion 보더 + action 버튼), restored (Indigo 보더), info (회색).
- **Animation:** `slide-in-right` 280ms exponential ease-out. 자동 사라짐 1.8–5s. 액션 버튼이 있을 땐 5s.

### Content-Type Badges
- **Shape:** 999px pill, 9.5px UPPERCASE, letter-spacing 0.06em, 2×7 패딩.
- **Color:** 타입별 hue 짝 (위 표 참조). 채도와 명도는 일관.
- **Width:** Spotlight 행에서는 60px 고정 폭으로 정렬, 카드에서는 콘텐츠 폭에 맞춤.

### Named Rules
**The Card Affords A Click Rule.** 카드 전체가 클릭 영역이다. 안의 텍스트나 favicon이 아닌, 카드 자체가 액션이다. 삭제 버튼만 `stopPropagation`.
**The Hover Reveals Affordance Rule.** 삭제 버튼은 호버 전엔 투명. 카드의 시각 노이즈를 줄이고, 의도가 생긴 순간에만 등장.

## 6. Do's and Don'ts

### Do:
- **Do** Ink Indigo (`#4f46e5`)를 화면의 10% 이내에서만 사용한다. The One Voice Rule.
- **Do** 모든 neutral을 Indigo hue 방향으로 미세하게 틴트한다 (chroma 0.005–0.01). 순백/순흑은 사용하지 않는다.
- **Do** 모션은 200–280ms exponential ease-out 한 가지 곡선만 사용한다 (`cubic-bezier(0.2, 0.8, 0.2, 1)`).
- **Do** 그림자는 인터랙션의 *결과*로만 등장시킨다. 평소엔 1px 보더.
- **Do** 콘텐츠 타입 배지는 색 + 라벨 텍스트를 항상 함께 표시한다 (색맹 친화).
- **Do** Spotlight는 시스템에서 가장 큰 그림자를 단독으로 차지한다. The Heroic Spotlight Rule.
- **Do** 키보드 단축키 힌트는 항상 `<kbd>` 요소 + monospace로.

### Don't:
- **Don't** 측면 컬러 스트라이프 (`border-left: 4px solid ...`)를 사용하지 않는다. PRODUCT.md anti-references — AI 슬롭 미감.
- **Don't** 그라데이션 텍스트 (`background-clip: text`)를 사용하지 않는다. Indigo 단색이면 충분하다. PRODUCT.md anti-references — AI 슬롭 미감.
- **Don't** 글래스모피즘을 데코로 사용하지 않는다. 유일한 backdrop-filter는 Spotlight 백드롭 한 곳.
- **Don't** 거대한 헤로 메트릭 / 좌측 사이드바 + 카드 그리드 / "Welcome back" 인사말. PRODUCT.md anti-references — 기업 SaaS 대시보드 클리셰.
- **Don't** Roboto + 푸른색 FAB + 5dp 그림자 같은 Material Design 표준 룩. PRODUCT.md anti-references.
- **Don't** 두꺼운 그라데이션 헤더 + 형광 액센트 배지의 1Password/Honey 류 팝오버. PRODUCT.md anti-references — 기존 Chrome 확장 클리셰.
- **Don't** Indigo 외 두 번째 액센트를 도입하지 않는다. Blade Emerald / Vermilion / Amber는 *액센트가 아니라 의미 전달*.
- **Don't** 균일한 카드 그리드를 만들지 않는다. CopyBoard의 정체성은 *카드의 얼굴이 콘텐츠 종류에 따라 달라지는 것*.
- **Don't** 모달을 첫 번째 답으로 쓰지 않는다. Spotlight 외의 모든 인터랙션은 inline.
- **Don't** "클립보드 → 노랑", "생산성 → 보라" 같은 카테고리 자동 반응을 따르지 않는다. The Category-Reflex Refusal.
