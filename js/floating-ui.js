// 플로팅 UI 관리
class FloatingUI {
    constructor() {
        this.floatingBox = null;
        this.isOpen = false;
        this.historyManager = null;
    }

    // 히스토리 매니저 설정
    setHistoryManager(manager) {
        this.historyManager = manager;
    }

    // 플로팅 박스 생성
    create() {
        if (this.floatingBox) return; // 이미 존재하면 스킵

        this.floatingBox = document.createElement('div');
        this.floatingBox.id = 'copyboard-floating';

        // 헤더 생성
        const header = this.createHeader();
        
        // 컨텐츠 생성
        const content = this.createContent();

        this.floatingBox.appendChild(header);
        this.floatingBox.appendChild(content);

        document.body.appendChild(this.floatingBox);
        this.isOpen = true;

        // 히스토리 로드
        this.loadHistory();

        // 토스트 시스템에 ResizeObserver 시작 알림
        if (window.toastSystem) {
            window.toastSystem.startResizeObserver();
        }

        // 다크 모드 버튼 상태 업데이트 (플로팅 박스 생성 후)
        setTimeout(() => {
            if (window.CopyBoardDarkMode && window.CopyBoardDarkMode.getManager()) {
                window.CopyBoardDarkMode.getManager().updateToggleButton();
            }
        }, 50);
    }

    // 헤더 생성
    createHeader() {
        const header = document.createElement('div');
        header.className = 'copyboard-header';

        // 제목과 상태 영역
        const titleArea = document.createElement('div');
        titleArea.className = 'copyboard-title-area';

        const title = document.createElement('h2');
        title.className = 'copyboard-title';
        title.textContent = 'CopyBoard';
        
        titleArea.appendChild(title);

        // 버튼 컨테이너
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'copyboard-button-container';

        // 복사 감지 토글 버튼
        const toggleDetectionBtn = this.createToggleDetectionButton();
        
        // 다크 모드 토글 버튼
        const darkModeToggle = this.createDarkModeToggle();
        
        // 닫기 버튼
        const closeBtn = this.createCloseButton();

        buttonContainer.appendChild(toggleDetectionBtn);
        buttonContainer.appendChild(darkModeToggle);
        buttonContainer.appendChild(closeBtn);

        header.appendChild(titleArea);
        header.appendChild(buttonContainer);

        return header;
    }

    // 복사 감지 토글 버튼 생성
    createToggleDetectionButton() {
        const toggleBtn = document.createElement('button');
        const isEnabled = window.copyDetection?.getStatus() ?? true;
        
        toggleBtn.className = `copyboard-toggle-btn ${isEnabled ? 'enabled' : 'disabled'}`;
        toggleBtn.textContent = `자동 복사 ${isEnabled ? 'ON' : 'OFF'}`;
        
        toggleBtn.onclick = () => {
            if (window.copyDetection) {
                const newStatus = window.copyDetection.toggle();
                toggleBtn.className = `copyboard-toggle-btn ${newStatus ? 'enabled' : 'disabled'}`;
                toggleBtn.textContent = `자동 복사 ${newStatus ? 'ON' : 'OFF'}`;
            }
        };

        return toggleBtn;
    }

    // 다크 모드 토글 버튼 생성
    createDarkModeToggle() {
        if (window.CopyBoardDarkMode) {
            return window.CopyBoardDarkMode.createToggle();
        }
        
        // 폴백 버튼 (다크 모드 시스템이 로드되지 않은 경우)
        const fallbackBtn = document.createElement('button');
        fallbackBtn.className = 'dark-mode-toggle';
        fallbackBtn.innerHTML = '<span class="icon">☀️</span>';
        fallbackBtn.onclick = () => {
            if (window.CopyBoardDarkMode) {
                window.CopyBoardDarkMode.toggle();
            }
        };
        return fallbackBtn;
    }

    // 닫기 버튼 생성
    createCloseButton() {
        const closeBtn = document.createElement('button');
        closeBtn.className = 'copyboard-close-btn';
        closeBtn.innerHTML = '×';
        closeBtn.onclick = () => this.close();
        return closeBtn;
    }

    // 컨텐츠 생성
    createContent() {
        const content = document.createElement('div');
        content.className = 'copyboard-content';

        // 입력 그룹
        const inputGroup = this.createInputGroup();
        
        // 컨트롤
        const controls = this.createControls();
        
        // 히스토리
        const historyDiv = document.createElement('div');
        historyDiv.id = 'floating-history';

        content.appendChild(inputGroup);
        content.appendChild(controls);
        content.appendChild(historyDiv);

        return content;
    }

    // 입력 그룹 생성
    createInputGroup() {
        const inputGroup = document.createElement('div');
        inputGroup.className = 'copyboard-input-group';

        const textarea = document.createElement('textarea');
        textarea.id = 'floating-textarea';
        textarea.className = 'copyboard-textarea';
        textarea.placeholder = '수동 추가 또는 복사 자동 감지';

        const addBtn = this.createAddButton();

        // Enter 키 이벤트
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                this.addManualText();
            }
        });

        inputGroup.appendChild(textarea);
        inputGroup.appendChild(addBtn);

        return inputGroup;
    }

    // 추가 버튼 생성
    createAddButton() {
        const addBtn = document.createElement('button');
        addBtn.className = 'copyboard-add-btn';
        addBtn.innerHTML = `<span>+ 추가</span>`;
        addBtn.onclick = () => this.addManualText();
        return addBtn;
    }

    // 컨트롤 생성
    createControls() {
        const controls = document.createElement('div');
        controls.className = 'copyboard-controls';

        const stats = document.createElement('div');
        stats.id = 'floating-stats';
        stats.className = 'copyboard-stats';

        const clearBtn = this.createClearButton();

        controls.appendChild(stats);
        controls.appendChild(clearBtn);

        return controls;
    }

    // 전체 삭제 버튼 생성
    createClearButton() {
        const clearBtn = document.createElement('button');
        clearBtn.className = 'copyboard-clear-btn';
        clearBtn.innerHTML = `<span>전체 삭제</span>`;
        clearBtn.onclick = () => this.clearAllHistory();
        return clearBtn;
    }

    // 수동 텍스트 추가
    addManualText() {
        const textarea = document.getElementById('floating-textarea');
        const text = textarea.value.trim();
        if (!text) return;

        if (this.historyManager) {
            this.historyManager.save(text);
        }
        textarea.value = '';

        // 즉시 히스토리 업데이트
        setTimeout(() => this.loadHistory(), 100);
    }

    // 전체 히스토리 삭제
    clearAllHistory() {
        if (this.historyManager) {
            this.historyManager.clear();
        }
    }

    // 히스토리 로드
    loadHistory() {
        if (this.historyManager) {
            this.historyManager.getHistory((history) => {
                this.renderHistory(history);
            });
        }
    }

    // 히스토리 렌더링
    renderHistory(history) {
        const stats = document.getElementById('floating-stats');
        const historyDiv = document.getElementById('floating-history');

        if (!stats || !historyDiv) return;

        stats.innerHTML = `저장된 항목: <strong>${history.length}</strong>/10`;

        if (history.length === 0) {
            historyDiv.innerHTML = `
                <div class="copyboard-empty">
                    저장된 텍스트가 없습니다<br>
                    <small>페이지에서 텍스트를 복사해보세요!</small>
                </div>
            `;
            return;
        }

        historyDiv.innerHTML = '';

        history.forEach((item) => {
            const itemDiv = this.createHistoryItem(item);
            historyDiv.appendChild(itemDiv);
        });
    }

    // 히스토리 아이템 생성
    createHistoryItem(item) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'copyboard-history-item';
        
        itemDiv.onmouseover = () => {
            itemDiv.className = 'copyboard-history-item hovered';
        };
        itemDiv.onmouseout = () => {
            itemDiv.className = 'copyboard-history-item';
        };
        itemDiv.onclick = (e) => this.copyToClipboard(item.text, e);

        const textDiv = document.createElement('div');
        textDiv.className = 'copyboard-history-item-text';
        textDiv.textContent = item.text.length > 80 ? item.text.substring(0, 80) + '...' : item.text;

        const metaDiv = document.createElement('div');
        metaDiv.className = 'copyboard-history-item-meta';

        const dateSpan = document.createElement('span');
        dateSpan.className = 'copyboard-history-item-date';
        dateSpan.textContent = item.dateString;

        const deleteBtn = this.createDeleteButton(item.id);

        metaDiv.appendChild(dateSpan);
        metaDiv.appendChild(deleteBtn);
        itemDiv.appendChild(textDiv);
        itemDiv.appendChild(metaDiv);

        return itemDiv;
    }

    // 삭제 버튼 생성
    createDeleteButton(itemId) {
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'copyboard-history-item-delete';
        deleteBtn.innerHTML = '×';
        
        deleteBtn.onmouseover = () => {
            deleteBtn.className = 'copyboard-history-item-delete hovered';
        };
        deleteBtn.onmouseout = () => {
            deleteBtn.className = 'copyboard-history-item-delete';
        };
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            this.deleteHistoryItem(itemId);
        };

        return deleteBtn;
    }

    // 클립보드로 복사
    copyToClipboard(text, clickEvent = null) {
        navigator.clipboard.writeText(text)
            .then(() => {
                if (window.toastSystem) {
                    window.toastSystem.showCopyFeedback(clickEvent);
                }
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
                
                if (window.toastSystem) {
                    window.toastSystem.showCopyFeedback(clickEvent);
                }
            });
    }

    // 히스토리 아이템 삭제
    deleteHistoryItem(itemId) {
        if (this.historyManager) {
            this.historyManager.deleteItem(itemId);
        }
    }

    // 플로팅 박스 닫기
    close() {
        if (this.floatingBox) {
            // CSS 애니메이션 클래스 추가
            this.floatingBox.classList.add('copyboard-closing');
            
            setTimeout(() => {
                if (this.floatingBox && document.body.contains(this.floatingBox)) {
                    document.body.removeChild(this.floatingBox);
                }
                this.floatingBox = null;
                this.isOpen = false;
                
                // 토스트 시스템 정리
                if (window.toastSystem) {
                    window.toastSystem.cleanup();
                }
            }, 400);
        }
    }

    // 토글
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.create();
        }
    }

    // 상태 확인
    isFloatingOpen() {
        return this.isOpen;
    }
}

// 전역 인스턴스 생성
window.floatingUI = new FloatingUI(); 