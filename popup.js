(() => {
    'use strict';

    // DOM 요소들
    const elements = {
        loading: document.getElementById('loading'),
        emptyState: document.getElementById('emptyState'),
        historyList: document.getElementById('historyList'),
        itemCount: document.getElementById('itemCount'),
        clearBtn: document.getElementById('clearBtn'),
        modalOverlay: document.getElementById('modalOverlay'),
        cancelBtn: document.getElementById('cancelBtn'),
        confirmBtn: document.getElementById('confirmBtn'),
    };

    // 상태 관리
    let currentHistory = [];

    // 플로팅 박스 토글 버튼 추가
    const addFloatingToggleButton = () => {
        const header = document.querySelector('.header');
        if (header && !header.querySelector('#floatingToggleBtn')) {
            const toggleBtn = document.createElement('button');
            toggleBtn.id = 'floatingToggleBtn';
            toggleBtn.className = 'floating-toggle-btn';
            toggleBtn.innerHTML = '📱 플로팅 모드';
            toggleBtn.title = '페이지에 플로팅 박스를 표시합니다';

            toggleBtn.addEventListener('click', async () => {
                try {
                    // 현재 탭에 플로팅 박스 토글 메시지 전송
                    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                    await chrome.tabs.sendMessage(tab.id, { action: 'toggleFloating' });

                    // 팝업 닫기
                    window.close();
                } catch (error) {
                    console.error('CopyBoard: 플로팅 모드 실행 실패:', error);
                    showError('플로팅 모드를 실행할 수 없습니다.');
                }
            });

            header.appendChild(toggleBtn);

            // CSS 스타일 추가
            if (!document.querySelector('#floatingToggleStyle')) {
                const style = document.createElement('style');
                style.id = 'floatingToggleStyle';
                style.textContent = `
                    .floating-toggle-btn {
                        background: #4f46e5;
                        color: white;
                        border: none;
                        padding: 8px 12px;
                        border-radius: 6px;
                        font-size: 12px;
                        font-weight: 500;
                        cursor: pointer;
                        transition: background 0.2s;
                        margin-left: 8px;
                    }
                    .floating-toggle-btn:hover {
                        background: #4338ca;
                    }
                `;
                document.head.appendChild(style);
            }
        }
    };

    // 초기화
    const init = async () => {
        try {
            await loadHistory();
            setupEventListeners();
            addFloatingToggleButton();
        } catch (error) {
            console.error('CopyBoard: 초기화 실패:', error);
            showError('초기화 중 오류가 발생했습니다.');
        }
    };

    // 이벤트 리스너 설정
    const setupEventListeners = () => {
        // 전체 삭제 버튼
        elements.clearBtn.addEventListener('click', showClearModal);

        // 모달 관련
        elements.cancelBtn.addEventListener('click', hideClearModal);
        elements.confirmBtn.addEventListener('click', clearAllHistory);
        elements.modalOverlay.addEventListener('click', (e) => {
            if (e.target === elements.modalOverlay) {
                hideClearModal();
            }
        });

        // 키보드 이벤트
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                hideClearModal();
            }
        });
    };

    // 히스토리 로드
    const loadHistory = async () => {
        try {
            showLoading(true);

            const response = await chrome.runtime.sendMessage({ action: 'getHistory' });

            if (response && response.history) {
                currentHistory = response.history;
                updateUI();
            } else {
                throw new Error('히스토리 데이터를 받지 못했습니다.');
            }
        } catch (error) {
            console.error('CopyBoard: 히스토리 로드 실패:', error);
            showError('데이터를 불러올 수 없습니다.');
        } finally {
            showLoading(false);
        }
    };

    // UI 업데이트
    const updateUI = () => {
        const hasItems = currentHistory.length > 0;

        // 항목 개수 업데이트
        elements.itemCount.textContent = `저장된 항목: ${currentHistory.length}/10`;

        // 빈 상태 vs 리스트 표시
        elements.emptyState.style.display = hasItems ? 'none' : 'block';
        elements.historyList.style.display = hasItems ? 'block' : 'none';
        elements.clearBtn.style.display = hasItems ? 'block' : 'none';

        if (hasItems) {
            renderHistoryList();
        }
    };

    // 히스토리 리스트 렌더링
    const renderHistoryList = () => {
        elements.historyList.innerHTML = '';

        currentHistory.forEach((item, index) => {
            const historyItem = createHistoryItemElement(item, index);
            elements.historyList.appendChild(historyItem);
        });

        // 이벤트 리스너 재연결
        attachHistoryItemListeners();
    };

    // 히스토리 아이템 HTML 생성
    const createHistoryItemHTML = (item) => {
        const truncatedText = truncateText(item.text, 200);

        return `
        <div class="history-item" data-id="${item.id}">
            <div class="item-header">
                <div class="item-text" title="${escapeHtml(item.text)}">${escapeHtml(truncatedText)}</div>
                <div class="item-actions">
                    <button class="action-btn copy-btn" data-action="copy" title="복사">
                        📋
                    </button>
                    <button class="action-btn delete-btn" data-action="delete" title="삭제">
                        🗑️
                    </button>
                </div>
            </div>
            <div class="item-meta">
                <span class="item-date">${item.dateString}</span>
            </div>
        </div>
    `;
    };

    // 히스토리 아이템 Element 생성
    const createHistoryItemElement = (item, index) => {
        const div = document.createElement('div');
        div.innerHTML = createHistoryItemHTML(item);
        return div.firstElementChild;
    };

    // 히스토리 아이템 이벤트 리스너 추가
    const attachHistoryItemListeners = () => {
        const historyItems = elements.historyList.querySelectorAll('.history-item');

        historyItems.forEach((item) => {
            const itemId = item.dataset.id;
            const copyBtn = item.querySelector('[data-action="copy"]');
            const deleteBtn = item.querySelector('[data-action="delete"]');

            // 복사 버튼
            copyBtn?.addEventListener('click', (e) => {
                e.stopPropagation();
                copyToClipboard(itemId);
            });

            // 삭제 버튼
            deleteBtn?.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteHistoryItem(itemId);
            });

            // 아이템 클릭으로 복사
            item.addEventListener('click', () => {
                copyToClipboard(itemId);
            });
        });
    };

    // 클립보드로 복사
    const copyToClipboard = async (itemId) => {
        try {
            const item = currentHistory.find((h) => h.id === itemId);
            if (!item) return;

            await navigator.clipboard.writeText(item.text);
            showCopyFeedback();
        } catch (error) {
            console.error('CopyBoard: 복사 실패:', error);

            // 폴백 방법
            try {
                const item = currentHistory.find((h) => h.id === itemId);
                if (!item) return;

                const textArea = document.createElement('textarea');
                textArea.value = item.text;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);

                showCopyFeedback();
            } catch (fallbackError) {
                console.error('CopyBoard: 폴백 복사도 실패:', fallbackError);
                showError('복사에 실패했습니다.');
            }
        }
    };

    // 복사 완료 피드백
    const showCopyFeedback = () => {
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #059669;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            z-index: 10000;
        `;
        feedback.textContent = '✅ 복사됨!';
        document.body.appendChild(feedback);

        setTimeout(() => {
            if (document.body.contains(feedback)) {
                document.body.removeChild(feedback);
            }
        }, 1500);
    };

    // 히스토리 아이템 삭제
    const deleteHistoryItem = async (itemId) => {
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'deleteHistoryItem',
                itemId: itemId,
            });

            if (response && response.success) {
                await loadHistory(); // 목록 새로고침
            } else {
                throw new Error('삭제 응답이 올바르지 않습니다.');
            }
        } catch (error) {
            console.error('CopyBoard: 항목 삭제 실패:', error);
            showError('항목을 삭제할 수 없습니다.');
        }
    };

    // 전체 히스토리 삭제
    const clearAllHistory = async () => {
        try {
            const response = await chrome.runtime.sendMessage({ action: 'clearHistory' });

            if (response && response.success) {
                await loadHistory(); // 목록 새로고침
                hideClearModal();
            } else {
                throw new Error('삭제 응답이 올바르지 않습니다.');
            }
        } catch (error) {
            console.error('CopyBoard: 전체 삭제 실패:', error);
            showError('전체 삭제에 실패했습니다.');
        }
    };

    // 삭제 확인 모달 표시
    const showClearModal = () => {
        elements.modalOverlay.style.display = 'flex';
        elements.confirmBtn.focus();
    };

    // 삭제 확인 모달 숨기기
    const hideClearModal = () => {
        elements.modalOverlay.style.display = 'none';
    };

    // 로딩 상태 표시
    const showLoading = (show) => {
        elements.loading.style.display = show ? 'flex' : 'none';
    };

    // 오류 메시지 표시
    const showError = (message) => {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            right: 10px;
            background: #dc2626;
            color: white;
            padding: 12px;
            border-radius: 6px;
            font-size: 14px;
            z-index: 10000;
            text-align: center;
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);

        setTimeout(() => {
            if (document.body.contains(errorDiv)) {
                document.body.removeChild(errorDiv);
            }
        }, 3000);
    };

    // 텍스트 줄이기
    const truncateText = (text, maxLength) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    // HTML 이스케이프
    const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    // 팝업이 열릴 때 초기화
    document.addEventListener('DOMContentLoaded', init);

    console.log('CopyBoard: Popup script 로드됨');
})();
