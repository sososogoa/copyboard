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
        this.floatingBox.style.cssText = `
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
            transform: translateX(100%) scale(0.8);
            opacity: 0;
            animation: slideInFloating 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        `;

        // 헤더 생성
        const header = this.createHeader();
        
        // 컨텐츠 생성
        const content = this.createContent();

        this.floatingBox.appendChild(header);
        this.floatingBox.appendChild(content);

        // 애니메이션 스타일 추가
        this.addAnimationStyles();

        document.body.appendChild(this.floatingBox);
        this.isOpen = true;

        // 히스토리 로드
        this.loadHistory();

        // 토스트 시스템에 ResizeObserver 시작 알림
        if (window.toastSystem) {
            window.toastSystem.startResizeObserver();
        }
    }

    // 헤더 생성
    createHeader() {
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

        // 제목과 상태 영역
        const titleArea = document.createElement('div');
        titleArea.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 4px;
        `;

        const title = document.createElement('h2');
        title.style.cssText = `
            margin: 0;
            color: #1f2937;
            font-size: 16px;
            font-weight: 600;
        `;
        title.textContent = 'CopyBoard';
        
        titleArea.appendChild(title);

        // 버튼 컨테이너
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 8px;
            align-items: center;
        `;

        // 복사 감지 토글 버튼
        const toggleDetectionBtn = this.createToggleDetectionButton();
        
        // 닫기 버튼
        const closeBtn = this.createCloseButton();

        buttonContainer.appendChild(toggleDetectionBtn);
        buttonContainer.appendChild(closeBtn);

        header.appendChild(titleArea);
        header.appendChild(buttonContainer);

        return header;
    }

    // 복사 감지 토글 버튼 생성
    createToggleDetectionButton() {
        const toggleBtn = document.createElement('button');
        const isEnabled = window.copyDetection?.getStatus() ?? true;
        
        const updateButton = (enabled) => {
            toggleBtn.style.cssText = `
                background: ${enabled ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' : 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)'};
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 600;
                font-size: 11px;
                transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                box-shadow: ${enabled ? '0 4px 8px rgba(5, 150, 105, 0.2)' : '0 4px 8px rgba(239, 68, 68, 0.2)'};
                white-space: nowrap;
            `;
            toggleBtn.textContent = `자동 복사 ${enabled ? 'ON' : 'OFF'}`;
        };

        updateButton(isEnabled);
        
        toggleBtn.onmouseover = () => {
            toggleBtn.style.transform = 'translateY(-1px)';
            const enabled = window.copyDetection?.getStatus() ?? true;
            toggleBtn.style.boxShadow = enabled ? '0 6px 12px rgba(5, 150, 105, 0.3)' : '0 6px 12px rgba(239, 68, 68, 0.3)';
        };
        toggleBtn.onmouseout = () => {
            toggleBtn.style.transform = 'translateY(0)';
            const enabled = window.copyDetection?.getStatus() ?? true;
            toggleBtn.style.boxShadow = enabled ? '0 4px 8px rgba(5, 150, 105, 0.2)' : '0 4px 8px rgba(239, 68, 68, 0.2)';
        };
        toggleBtn.onclick = () => {
            if (window.copyDetection) {
                const newStatus = window.copyDetection.toggle();
                updateButton(newStatus);
            }
        };

        return toggleBtn;
    }

    // 닫기 버튼 생성
    createCloseButton() {
        const closeBtn = document.createElement('button');
        closeBtn.style.cssText = `
            background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
            color: white;
            border: none;
            padding: 8px;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            cursor: pointer;
            font-weight: 600;
            font-size: 14px;
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            box-shadow: 0 4px 8px rgba(239, 68, 68, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        closeBtn.innerHTML = '×';
        
        closeBtn.onmouseover = () => {
            closeBtn.style.transform = 'scale(1.1) rotate(90deg)';
            closeBtn.style.boxShadow = '0 6px 12px rgba(239, 68, 68, 0.3)';
        };
        closeBtn.onmouseout = () => {
            closeBtn.style.transform = 'scale(1) rotate(0deg)';
            closeBtn.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.2)';
        };
        closeBtn.onclick = () => this.close();

        return closeBtn;
    }

    // 컨텐츠 생성
    createContent() {
        const content = document.createElement('div');
        content.style.cssText = `
            padding: 16px;
            max-height: 400px;
            overflow-y: auto;
        `;

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
        textarea.onfocus = () => textarea.style.borderColor = '#4f46e5';
        textarea.onblur = () => textarea.style.borderColor = '#e5e7eb';

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
        addBtn.style.cssText = `
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: white;
            border: none;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            white-space: nowrap;
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            box-shadow: 0 4px 8px rgba(79, 70, 229, 0.2);
        `;
        addBtn.innerHTML = `<span style="position: relative; z-index: 2;">+ 추가</span>`;
        
        addBtn.onmouseover = () => {
            addBtn.style.transform = 'translateY(-2px)';
            addBtn.style.boxShadow = '0 8px 16px rgba(79, 70, 229, 0.3)';
        };
        addBtn.onmouseout = () => {
            addBtn.style.transform = 'translateY(0)';
            addBtn.style.boxShadow = '0 4px 8px rgba(79, 70, 229, 0.2)';
        };
        addBtn.onclick = () => this.addManualText();

        return addBtn;
    }

    // 컨트롤 생성
    createControls() {
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

        const clearBtn = this.createClearButton();

        controls.appendChild(stats);
        controls.appendChild(clearBtn);

        return controls;
    }

    // 전체 삭제 버튼 생성
    createClearButton() {
        const clearBtn = document.createElement('button');
        clearBtn.style.cssText = `
            background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
            color: white;
            border: none;
            padding: 8px 14px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            box-shadow: 0 4px 8px rgba(239, 68, 68, 0.2);
        `;
        clearBtn.innerHTML = `<span style="position: relative; z-index: 2;">전체 삭제</span>`;
        
        clearBtn.onmouseover = () => {
            clearBtn.style.transform = 'translateY(-2px)';
            clearBtn.style.boxShadow = '0 8px 16px rgba(239, 68, 68, 0.3)';
        };
        clearBtn.onmouseout = () => {
            clearBtn.style.transform = 'translateY(0)';
            clearBtn.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.2)';
        };
        clearBtn.onclick = () => this.clearAllHistory();

        return clearBtn;
    }

    // 애니메이션 스타일 추가
    addAnimationStyles() {
        if (document.getElementById('copyboard-floating-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'copyboard-floating-styles';
        style.textContent = `
            @keyframes slideInFloating {
                0% {
                    transform: translateX(100%) scale(0.8);
                    opacity: 0;
                }
                50% {
                    transform: translateX(-10px) scale(1.05);
                    opacity: 0.8;
                }
                100% {
                    transform: translateX(0) scale(1);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutFloating {
                0% {
                    transform: translateX(0) scale(1);
                    opacity: 1;
                }
                100% {
                    transform: translateX(100%) scale(0.8);
                    opacity: 0;
                }
            }
            
            #copyboard-floating .item-text {
                transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            
            #copyboard-floating .history-item:hover .item-text {
                transform: translateX(5px);
            }
        `;
        document.head.appendChild(style);
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
            const itemDiv = this.createHistoryItem(item);
            historyDiv.appendChild(itemDiv);
        });
    }

    // 히스토리 아이템 생성
    createHistoryItem(item) {
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
        itemDiv.onclick = (e) => this.copyToClipboard(item.text, e);

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
        deleteBtn.style.cssText = `
            background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
            color: white;
            border: none;
            padding: 4px;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            cursor: pointer;
            font-weight: 600;
            font-size: 10px;
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0.7;
            transform: scale(0.9);
        `;
        deleteBtn.innerHTML = '×';
        
        deleteBtn.onmouseover = () => {
            deleteBtn.style.opacity = '1';
            deleteBtn.style.transform = 'scale(1.1) rotate(90deg)';
            deleteBtn.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.4)';
        };
        deleteBtn.onmouseout = () => {
            deleteBtn.style.opacity = '0.7';
            deleteBtn.style.transform = 'scale(0.9) rotate(0deg)';
            deleteBtn.style.boxShadow = '0 2px 4px rgba(239, 68, 68, 0.2)';
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
            this.historyManager.deleteItem(itemId, () => {
                this.loadHistory();
            });
        }
    }

    // 플로팅 박스 닫기
    close() {
        if (this.floatingBox) {
            // 닫기 애니메이션 적용
            this.floatingBox.style.animation = 'slideOutFloating 0.4s cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards';
            
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