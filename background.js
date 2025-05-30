let copyHistory = [];
let historyBackup = null; // 백업 저장용
const MAX_HISTORY_SIZE = 10;

// 저장소에서 기록 로드
const loadHistory = async () => {
    try {
        const result = await chrome.storage.local.get(['copyHistory']);
        copyHistory = result.copyHistory || [];
        console.log('CopyBoard: 기록 로드됨', copyHistory.length, '개 항목');
    } catch (error) {
        console.error('CopyBoard: 기록 로드 실패:', error);
        copyHistory = [];
    }
};

// 저장소에 기록 저장
const saveHistory = async () => {
    try {
        await chrome.storage.local.set({ copyHistory });
        console.log('CopyBoard: 기록 저장됨', copyHistory.length, '개 항목');

        // 모든 탭의 content script에 업데이트 알림
        const tabs = await chrome.tabs.query({});
        tabs.forEach((tab) => {
            chrome.tabs
                .sendMessage(tab.id, {
                    action: 'historyUpdated',
                    history: copyHistory,
                })
                .catch(() => {
                    // 일부 탭에서는 content script가 없을 수 있음
                });
        });
    } catch (error) {
        console.error('CopyBoard: 기록 저장 실패:', error);
    }
};

// 텍스트를 기록에 추가
const addToHistory = (text) => {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return false;
    }

    const trimmedText = text.trim();

    // 중복 확인 및 제거
    copyHistory = copyHistory.filter((item) => item.text !== trimmedText);

    // 새 항목을 맨 앞에 추가
    const newItem = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
        text: trimmedText,
        timestamp: Date.now(),
        dateString: new Date().toLocaleString('ko-KR'),
        url: '', // content script에서 제공되지 않으면 빈 문자열
    };

    copyHistory.unshift(newItem);

    // 최대 크기 유지
    if (copyHistory.length > MAX_HISTORY_SIZE) {
        copyHistory = copyHistory.slice(0, MAX_HISTORY_SIZE);
    }

    saveHistory();
    return true;
};

// 기록에서 항목 삭제
const deleteHistoryItem = (itemId) => {
    const originalLength = copyHistory.length;
    copyHistory = copyHistory.filter((item) => item.id !== itemId);

    if (copyHistory.length !== originalLength) {
        saveHistory();
        return true;
    }
    return false;
};

// 히스토리 전체 삭제 (백업 포함)
const clearHistory = () => {
    // 현재 히스토리를 백업에 저장
    historyBackup = [...copyHistory];
    
    copyHistory = [];
    saveHistory();
    console.log('CopyBoard: 히스토리 삭제됨 (백업 저장됨)', historyBackup.length, '개 항목');
};

// 히스토리 복원
const restoreHistory = () => {
    if (historyBackup && historyBackup.length > 0) {
        copyHistory = [...historyBackup];
        saveHistory();
        console.log('CopyBoard: 히스토리 복원됨', copyHistory.length, '개 항목');
        historyBackup = null; // 백업 클리어
        return true;
    }
    return false;
};

// 플로팅 박스 토글 함수
const toggleFloatingBox = async () => {
    try {
        // 현재 활성 탭 가져오기
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (!activeTab) {
            console.warn('CopyBoard: 활성 탭을 찾을 수 없습니다.');
            return;
        }

        // 플로팅 박스 토글 메시지 전송
        const response = await chrome.tabs.sendMessage(activeTab.id, {
            action: 'toggleFloating',
        });

        console.log('CopyBoard: 플로팅 박스 토글됨', response);
    } catch (error) {
        console.error('CopyBoard: 플로팅 박스 토글 실패:', error);

        // content script가 로드되지 않은 페이지에서는 알림만 표시
        chrome.notifications
            ?.create({
                type: 'basic',
                iconUrl: 'icons/icon48.png',
                title: 'CopyBoard',
                message: '이 페이지에서는 플로팅 박스를 사용할 수 없습니다.',
            })
            .catch(() => {
                // 알림 권한이 없으면 무시
            });
    }
};

// 메시지 리스너
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('CopyBoard: 메시지 수신됨:', request.action);

    switch (request.action) {
        case 'addToHistory':
            if (request.text) {
                const success = addToHistory(request.text);
                sendResponse({ success });
            }
            break;

        case 'getHistory':
            sendResponse({
                history: copyHistory,
                count: copyHistory.length,
            });
            break;

        case 'deleteHistoryItem':
            if (request.itemId) {
                const success = deleteHistoryItem(request.itemId);
                sendResponse({ success });
            }
            break;

        case 'clearHistory':
            clearHistory();
            sendResponse({ success: true });
            break;

        case 'restoreHistory':
            const restored = restoreHistory();
            sendResponse({ success: restored });
            break;

        default:
            console.warn('CopyBoard: 알 수 없는 액션:', request.action);
            sendResponse({ success: false, error: '알 수 없는 액션' });
    }

    return true; // 비동기 응답을 위해 true 반환
});

// 키보드 단축키 명령어 리스너
chrome.commands.onCommand.addListener((command) => {
    console.log('CopyBoard: 키보드 단축키 실행됨:', command);

    if (command === 'toggle-floating') {
        toggleFloatingBox();
    }
});

// 확장 프로그램 아이콘 클릭 시 플로팅 박스 토글
chrome.action.onClicked.addListener(async (tab) => {
    console.log('CopyBoard: 확장 아이콘 클릭됨');
    await toggleFloatingBox();
});

// 컨텍스트 메뉴 생성
chrome.runtime.onInstalled.addListener(() => {
    // 기존 컨텍스트 메뉴 제거
    chrome.contextMenus.removeAll(() => {
        // 선택된 텍스트에 대한 컨텍스트 메뉴 추가
        chrome.contextMenus.create({
            id: 'copyboard-save-text',
            title: '📋 CopyBoard에 저장',
            contexts: ['selection'],
        });

        // 페이지에 대한 컨텍스트 메뉴 추가
        chrome.contextMenus.create({
            id: 'copyboard-toggle-floating',
            title: '📋 CopyBoard 플로팅 모드',
            contexts: ['page'],
        });
    });

    console.log('CopyBoard: 확장 프로그램 설치/업데이트됨 (플로팅 모드 전용)');
});

// 컨텍스트 메뉴 클릭 처리
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'copyboard-save-text' && info.selectionText) {
        // 선택된 텍스트를 직접 저장
        addToHistory(info.selectionText);

        // content script에 알림 표시 요청
        chrome.tabs
            .sendMessage(tab.id, {
                action: 'showAutoSaveNotification',
            })
            .catch(() => {
                // content script가 없으면 무시
            });
    } else if (info.menuItemId === 'copyboard-toggle-floating') {
        // 플로팅 박스 토글
        toggleFloatingBox();
    }
});

// 확장 프로그램 시작 시 기록 로드
loadHistory();

console.log('CopyBoard: Background script 로드됨 (플로팅 모드 전용)');
