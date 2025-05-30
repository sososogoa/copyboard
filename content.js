let copyBoardFloating = null;
let copyListener = null;
let isFloatingOpen = false;

// 복사 이벤트 리스너 설정
function setupCopyDetection() {
    if (copyListener) return; // 이미 설정되어 있으면 스킵

    copyListener = (e) => {
        setTimeout(() => {
            // 클립보드에서 텍스트 읽기
            navigator.clipboard
                .readText()
                .then((text) => {
                    if (text && text.trim()) {
                        saveToHistory(text.trim());
                        showAutoSaveNotification();
                    }
                })
                .catch(() => {
                    // 클립보드 읽기 실패 시 선택된 텍스트 사용
                    const selection = window.getSelection().toString();
                    if (selection && selection.trim()) {
                        saveToHistory(selection.trim());
                        showAutoSaveNotification();
                    }
                });
        }, 100);
    };

    document.addEventListener('copy', copyListener);
}

// 자동 저장 알림 표시
function showAutoSaveNotification() {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        background: #059669;
        color: white;
        padding: 8px 14px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        z-index: 9999999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;
    notification.textContent = '📋 자동 저장됨';
    document.body.appendChild(notification);

    setTimeout(() => {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    }, 1500);
}

// 히스토리에 텍스트 저장
function saveToHistory(text) {
    chrome.runtime.sendMessage({
        action: 'addToHistory',
        text: text,
    });
}

// 플로팅 박스 생성
function createFloatingBox() {
    if (copyBoardFloating) return; // 이미 존재하면 스킵

    // 플로팅 박스 컨테이너
    copyBoardFloating = document.createElement('div');
    copyBoardFloating.id = 'copyboard-floating';
    copyBoardFloating.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 350px;
        max-height: 500px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05);
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;

    // 헤더
    const header = document.createElement('div');
    header.style.cssText = `
        padding: 16px 20px;
        border-bottom: 1px solid #e5e7eb;
        background: #f9fafb;
        border-radius: 12px 12px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;

    const titleArea = document.createElement('div');

    const title = document.createElement('h2');
    title.style.cssText = `
        margin: 0;
        color: #1f2937;
        font-size: 16px;
        font-weight: 600;
    `;
    title.textContent = '📋 CopyBoard';

    const status = document.createElement('div');
    status.style.cssText = `
        font-size: 11px;
        color: #6b7280;
        margin-top: 2px;
    `;
    status.textContent = '복사 감지 활성화됨 • Ctrl+Shift+C';

    const closeBtn = document.createElement('button');
    closeBtn.style.cssText = `
        background: #dc2626;
        color: white;
        border: none;
        padding: 6px 8px;
        border-radius: 6px;
        font-size: 11px;
        cursor: pointer;
        font-weight: 500;
        transition: background 0.2s;
    `;
    closeBtn.textContent = '닫기';
    closeBtn.onmouseover = () => {
        closeBtn.style.background = '#b91c1c';
    };
    closeBtn.onmouseout = () => {
        closeBtn.style.background = '#dc2626';
    };
    closeBtn.onclick = () => closeFloatingBox();

    titleArea.appendChild(title);
    titleArea.appendChild(status);
    header.appendChild(titleArea);
    header.appendChild(closeBtn);

    // 컨텐츠
    const content = document.createElement('div');
    content.style.cssText = `
        padding: 16px;
        max-height: 400px;
        overflow-y: auto;
    `;

    // 입력 그룹
    const inputGroup = document.createElement('div');
    inputGroup.style.cssText = `
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
    `;

    const textarea = document.createElement('textarea');
    textarea.id = 'floating-textarea';
    textarea.style.cssText = `
        flex: 1;
        padding: 10px;
        border: 2px solid #e5e7eb;
        border-radius: 6px;
        font-size: 13px;
        min-height: 50px;
        resize: vertical;
        font-family: inherit;
        outline: none;
        transition: border-color 0.2s;
    `;
    textarea.placeholder = '수동 추가 또는 복사 자동 감지';
    textarea.onfocus = () => {
        textarea.style.borderColor = '#4f46e5';
    };
    textarea.onblur = () => {
        textarea.style.borderColor = '#e5e7eb';
    };

    const addBtn = document.createElement('button');
    addBtn.style.cssText = `
        background: #4f46e5;
        color: white;
        border: none;
        padding: 10px 14px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        white-space: nowrap;
        transition: background 0.2s;
    `;
    addBtn.textContent = '추가';
    addBtn.onmouseover = () => {
        addBtn.style.background = '#4338ca';
    };
    addBtn.onmouseout = () => {
        addBtn.style.background = '#4f46e5';
    };
    addBtn.onclick = () => addManualText();

    // 컨트롤
    const controls = document.createElement('div');
    controls.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
    `;

    const stats = document.createElement('div');
    stats.id = 'floating-stats';
    stats.style.cssText = `
        font-size: 12px;
        color: #6b7280;
        font-weight: 500;
    `;

    const clearBtn = document.createElement('button');
    clearBtn.style.cssText = `
        background: #dc2626;
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 5px;
        font-size: 11px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s;
    `;
    clearBtn.textContent = '전체 삭제';
    clearBtn.onmouseover = () => {
        clearBtn.style.background = '#b91c1c';
    };
    clearBtn.onmouseout = () => {
        clearBtn.style.background = '#dc2626';
    };
    clearBtn.onclick = () => clearAllHistory();

    // 히스토리
    const historyDiv = document.createElement('div');
    historyDiv.id = 'floating-history';

    // 조립
    inputGroup.appendChild(textarea);
    inputGroup.appendChild(addBtn);
    controls.appendChild(stats);
    controls.appendChild(clearBtn);
    content.appendChild(inputGroup);
    content.appendChild(controls);
    content.appendChild(historyDiv);
    copyBoardFloating.appendChild(header);
    copyBoardFloating.appendChild(content);

    // Enter 키 이벤트
    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            addManualText();
        }
    });

    document.body.appendChild(copyBoardFloating);
    isFloatingOpen = true;

    // 히스토리 로드
    loadFloatingHistory();
}

// 플로팅 박스 닫기
function closeFloatingBox() {
    if (copyBoardFloating) {
        document.body.removeChild(copyBoardFloating);
        copyBoardFloating = null;
        isFloatingOpen = false;
    }

    // 복사 이벤트 리스너 제거
    if (copyListener) {
        document.removeEventListener('copy', copyListener);
        copyListener = null;
    }
}

// 수동 텍스트 추가
function addManualText() {
    const textarea = document.getElementById('floating-textarea');
    const text = textarea.value.trim();
    if (!text) return;

    saveToHistory(text);
    textarea.value = '';

    // 즉시 히스토리 업데이트
    setTimeout(() => loadFloatingHistory(), 100);
}

// 전체 히스토리 삭제
function clearAllHistory() {
    if (confirm('모든 복사 기록을 삭제하시겠습니까?')) {
        chrome.runtime.sendMessage({ action: 'clearHistory' }, () => {
            loadFloatingHistory();
        });
    }
}

// 플로팅 히스토리 로드
function loadFloatingHistory() {
    chrome.runtime.sendMessage({ action: 'getHistory' }, (response) => {
        if (response && response.history) {
            renderFloatingHistory(response.history);
        }
    });
}

// 플로팅 히스토리 렌더링
function renderFloatingHistory(history) {
    const stats = document.getElementById('floating-stats');
    const historyDiv = document.getElementById('floating-history');

    if (!stats || !historyDiv) return;

    stats.innerHTML = `저장된 항목: <strong style="color:#4f46e5;">${history.length}</strong>/10`;

    if (history.length === 0) {
        historyDiv.innerHTML = `
            <div style="text-align:center;padding:30px;color:#9ca3af;font-size:13px;">
                저장된 텍스트가 없습니다<br>
                <small style="margin-top:6px;display:block;">페이지에서 텍스트를 복사해보세요!</small>
            </div>
        `;
        return;
    }

    historyDiv.innerHTML = '';

    history.forEach((item) => {
        const itemDiv = document.createElement('div');
        itemDiv.style.cssText = `
            padding: 12px;
            border: 1px solid #f3f4f6;
            border-radius: 6px;
            margin-bottom: 8px;
            cursor: pointer;
            transition: all 0.2s;
            background: white;
        `;
        itemDiv.onmouseover = () => {
            itemDiv.style.borderColor = '#4f46e5';
            itemDiv.style.background = '#f8fafc';
        };
        itemDiv.onmouseout = () => {
            itemDiv.style.borderColor = '#f3f4f6';
            itemDiv.style.background = 'white';
        };
        itemDiv.onclick = () => copyToClipboard(item.text);

        const textDiv = document.createElement('div');
        textDiv.style.cssText = `
            font-size: 13px;
            color: #1f2937;
            margin-bottom: 6px;
            word-break: break-word;
            line-height: 1.4;
        `;
        textDiv.textContent = item.text.length > 80 ? item.text.substring(0, 80) + '...' : item.text;

        const metaDiv = document.createElement('div');
        metaDiv.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;

        const dateSpan = document.createElement('span');
        dateSpan.style.cssText = `
            font-size: 11px;
            color: #6b7280;
        `;
        dateSpan.textContent = item.dateString;

        const deleteBtn = document.createElement('button');
        deleteBtn.style.cssText = `
            background: #dc2626;
            color: white;
            border: none;
            padding: 3px 6px;
            border-radius: 3px;
            font-size: 10px;
            cursor: pointer;
            font-weight: 500;
            transition: background 0.2s;
        `;
        deleteBtn.textContent = '삭제';
        deleteBtn.onmouseover = () => {
            deleteBtn.style.background = '#b91c1c';
        };
        deleteBtn.onmouseout = () => {
            deleteBtn.style.background = '#dc2626';
        };
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteHistoryItem(item.id);
        };

        metaDiv.appendChild(dateSpan);
        metaDiv.appendChild(deleteBtn);
        itemDiv.appendChild(textDiv);
        itemDiv.appendChild(metaDiv);
        historyDiv.appendChild(itemDiv);
    });
}

// 클립보드로 복사
function copyToClipboard(text) {
    navigator.clipboard
        .writeText(text)
        .then(() => {
            showCopyFeedback();
        })
        .catch(() => {
            // 폴백 방법
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showCopyFeedback();
        });
}

// 복사 완료 피드백
function showCopyFeedback() {
    const feedback = document.createElement('div');
    feedback.style.cssText = `
        position: fixed;
        top: 20px;
        right: 380px;
        background: #059669;
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        z-index: 9999999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;
    feedback.textContent = '✅ 복사됨';
    document.body.appendChild(feedback);

    setTimeout(() => {
        if (document.body.contains(feedback)) {
            document.body.removeChild(feedback);
        }
    }, 1500);
}

// 히스토리 아이템 삭제
function deleteHistoryItem(itemId) {
    chrome.runtime.sendMessage(
        {
            action: 'deleteHistoryItem',
            itemId: itemId,
        },
        () => {
            loadFloatingHistory();
        }
    );
}

// 백그라운드 스크립트와의 통신
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleFloating') {
        if (isFloatingOpen) {
            closeFloatingBox();
        } else {
            createFloatingBox();
            setupCopyDetection();
        }
        sendResponse({ success: true });
    } else if (request.action === 'historyUpdated') {
        // 히스토리가 업데이트되면 플로팅 박스도 업데이트
        if (isFloatingOpen) {
            loadFloatingHistory();
        }
    } else if (request.action === 'showAutoSaveNotification') {
        // 컨텍스트 메뉴에서 저장할 때 알림 표시
        showAutoSaveNotification();
        sendResponse({ success: true });
    }
});

// 페이지 로드 시 자동으로 복사 감지 시작 (플로팅 박스는 수동 토글)
setupCopyDetection();
