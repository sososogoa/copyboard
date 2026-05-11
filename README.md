# CopyBoard

복사한 텍스트를 자동 저장하고 단축키로 검색·재복사하는 Chrome 확장.

## 설치 (개발자 모드)

```sh
npm install
npm run build
```

`chrome://extensions` → 개발자 모드 → 압축해제된 확장 로드 → `dist/`.

## 단축키

- `Cmd/Ctrl + Shift + C` — 사이드 패널
- `Cmd/Ctrl + Shift + V` — Spotlight 검색

## 개발

```sh
npm run dev        # Vite HMR
npm run test:run   # 테스트
npm run typecheck
```

## 문서

- [PRODUCT.md](./PRODUCT.md), [DESIGN.md](./DESIGN.md), [CLAUDE.md](./CLAUDE.md)
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md), [docs/TESTING.md](./docs/TESTING.md)
