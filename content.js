// 전역 상태
let isFloatingOpen = false;

// 초기화
function init() {
    // 복사 감지 설정 및 콜백 설정
    if (window.copyDetection) {
        window.copyDetection.setCopyCallback(handleCopy);
        window.copyDetection.start();
    }

    // 플로팅 UI에 히스토리 매니저 연결
    if (window.floatingUI && window.historyManager) {
        window.floatingUI.setHistoryManager(window.historyManager);
    }

    // 다크 모드 시스템 초기화
    if (window.CopyBoardDarkMode) {
        window.CopyBoardDarkMode.init();
    }
}

// 복사 처리 함수
function handleCopy(text) {
    if (window.historyManager) {
        window.historyManager.save(text);
    }
}

// 백그라운드 스크립트와의 통신
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleFloating') {
        if (window.floatingUI) {
            window.floatingUI.toggle();
            sendResponse({ success: true });
        }
    } else if (request.action === 'historyUpdated') {
        // 히스토리가 업데이트되면 플로팅 박스도 업데이트
        if (window.floatingUI && window.floatingUI.isFloatingOpen()) {
            window.floatingUI.loadHistory();
        }
    } else if (request.action === 'showAutoSaveNotification') {
        // 컨텍스트 메뉴에서 저장할 때 알림 표시
        if (window.toastSystem) {
            window.toastSystem.showAutoSave();
        sendResponse({ success: true });
        }
    }
});

// 페이지 로드 완료 후 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
