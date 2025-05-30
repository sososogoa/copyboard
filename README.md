# CopyBoard - 클립보드 관리

페이지에서 복사한 텍스트를 자동으로 저장하고 관리하는 Chrome 확장 프로그램입니다.

## 주요 기능

- **자동 복사 감지**: 페이지에서 텍스트를 복사하면 자동으로 히스토리에 저장
- **플로팅 박스**: 페이지에 떠다니는 클립보드 관리 인터페이스
- **토스트 UI**: 세련된 알림 시스템으로 작업 상태 표시
- **히스토리 관리**: 최대 10개의 복사 기록 저장 및 관리
- **취소/복원**: 실수로 삭제한 히스토리 복원 기능
- **반응형 UI**: 다크 모드 지원 및 모던한 디자인

## 프로젝트 구조

```
copyboard/
├── manifest.json          # 확장 프로그램 설정
├── background.js          # 백그라운드 서비스 워커
├── content.js             # 메인 컨트롤러
├── css                    # CSS 파일들
│   ├── content-styles.css # 전체 CSS
├── js/                    # 모듈화된 JavaScript 파일들
│   ├── copy-detection.js  # 복사 감지 시스템
│   ├── dark-mode.js       # 복사 감지 시스템
│   ├── floating-ui.js     # 플로팅 박스 UI
│   ├── history-manager.js # 히스토리 관리
│   ├── toast-system.js    # 토스트 알림 시스템
└── icons/                 # 확장 프로그램 아이콘들
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

## 설치 및 개발

### 개발자 모드로 설치
1. Chrome에서 `chrome://extensions/` 접속
2. 개발자 모드 활성화
3. "압축해제된 확장 프로그램을 로드합니다" 클릭
4. 프로젝트 폴더 선택

### 개발 환경
- Chrome Extension Manifest V3
- Vanilla JavaScript (ES6+)
- CSS3 with CSS Variables
- Modern Web APIs (Clipboard, ResizeObserver)


## 사용법

1. 웹페이지에서 텍스트 복사 → 자동 저장
2. 확장 프로그램 아이콘 클릭 → 히스토리 확인
3. 저장된 텍스트 클릭 → 클립보드에 복사