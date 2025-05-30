// 히스토리 관리 모듈
class HistoryManager {
    constructor() {
        this.onHistoryUpdated = null;
    }

    // 히스토리 저장
    save(text) {
        chrome.runtime.sendMessage({
            action: 'addToHistory',
            text: text,
        });
        
        // 플로팅 박스가 닫혀있으면 자동으로 열기
        if (window.floatingUI && !window.floatingUI.isFloatingOpen()) {
            setTimeout(() => {
                window.floatingUI.create();
                if (window.copyDetection) {
                    window.copyDetection.start();
                }
            }, 100);
        }

        // 자동 저장 토스트 표시
        if (window.toastSystem) {
            window.toastSystem.showAutoSave();
        }
    }

    // 히스토리 가져오기
    getHistory(callback) {
        chrome.runtime.sendMessage({ action: 'getHistory' }, (response) => {
            if (response && response.history) {
                if (callback) {
                    callback(response.history);
                }
            }
        });
    }

    // 히스토리 아이템 삭제
    deleteItem(itemId, callback) {
        chrome.runtime.sendMessage({
            action: 'deleteHistoryItem',
            itemId: itemId,
        }, () => {
            if (callback) {
                callback();
            }
        });
    }

    // 전체 히스토리 삭제
    clear() {
        chrome.runtime.sendMessage({ action: 'clearHistory' }, (response) => {
            if (response && response.success) {
                // 히스토리 업데이트
                if (window.floatingUI) {
                    window.floatingUI.loadHistory();
                }
                
                // 취소 토스트 표시
                this.showUndoToast();
            }
        });
    }

    // 히스토리 복원
    restore() {
        chrome.runtime.sendMessage({ action: 'restoreHistory' }, (response) => {
            if (response && response.success) {
                // 히스토리 업데이트
                if (window.floatingUI) {
                    window.floatingUI.loadHistory();
                }
                
                // 복원 성공 토스트 표시
                this.showRestoreSuccessToast();
            }
        });
    }

    // 취소 토스트 표시
    showUndoToast() {
        // 기존 토스트가 있으면 제거
        const existingToast = document.getElementById('copyboard-undo-toast');
        if (existingToast) {
            existingToast.remove();
        }

        // 토스트 위치 계산
        const toastPosition = this.calculateToastPosition();

        const toast = document.createElement('div');
        toast.id = 'copyboard-undo-toast';
        toast.style.cssText = `
            position: fixed;
            top: ${toastPosition.top};
            right: ${toastPosition.right};
            width: 280px;
            background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 500;
            z-index: 10000000;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            box-shadow: 0 8px 16px -4px rgba(0,0,0,0.2), 0 4px 6px -1px rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            gap: 12px;
            border: 1px solid rgba(255,255,255,0.1);
            backdrop-filter: blur(8px);
            transform: translateX(100%) scale(0.8);
            opacity: 0;
            animation: slideInRight 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        `;

        // 아이콘 추가
        const icon = document.createElement('div');
        icon.style.cssText = `
            width: 20px;
            height: 20px;
            background: #ef4444;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            animation: pulseIcon 0.6s ease-in-out;
            flex-shrink: 0;
        `;
        icon.textContent = '🗑️';

        const contentArea = document.createElement('div');
        contentArea.style.cssText = `
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 2px;
            min-width: 0;
        `;

        const message = document.createElement('div');
        message.style.cssText = `
            font-weight: 600;
            font-size: 13px;
            line-height: 1.2;
        `;
        message.textContent = '모든 항목 삭제됨';

        const subMessage = document.createElement('div');
        subMessage.style.cssText = `
            font-size: 11px;
            color: #d1d5db;
            opacity: 0;
            animation: fadeInUp 0.5s ease-out 0.2s forwards;
            line-height: 1.2;
        `;
        subMessage.textContent = '5초 내 복원 가능';

        const undoBtn = document.createElement('button');
        undoBtn.style.cssText = `
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            box-shadow: 0 2px 4px rgba(79, 70, 229, 0.3);
            transform: scale(0.9);
            animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.3s forwards;
            flex-shrink: 0;
        `;
        undoBtn.textContent = '취소';
        
        undoBtn.onmouseover = () => {
            undoBtn.style.transform = 'scale(1.05)';
            undoBtn.style.boxShadow = '0 6px 12px rgba(79, 70, 229, 0.4)';
        };
        undoBtn.onmouseout = () => {
            undoBtn.style.transform = 'scale(1)';
            undoBtn.style.boxShadow = '0 4px 8px rgba(79, 70, 229, 0.3)';
        };
        undoBtn.onclick = () => {
            toast.style.animation = 'slideOutRight 0.3s cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards';
            setTimeout(() => {
                this.restore();
                if (document.body.contains(toast)) {
                    toast.remove();
                }
            }, 300);
        };

        contentArea.appendChild(message);
        contentArea.appendChild(subMessage);
        toast.appendChild(icon);
        toast.appendChild(contentArea);
        toast.appendChild(undoBtn);
        
        // 토스트 등록
        if (window.toastSystem) {
            window.toastSystem.register(toast);
        }
        
        document.body.appendChild(toast);

        // 애니메이션 스타일 추가
        this.addToastStyles();

        // 프로그레스 바 추가
        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            height: 3px;
            background: linear-gradient(90deg, #4f46e5, #7c3aed);
            border-radius: 0 0 12px 12px;
            animation: progress 5s linear forwards;
        `;
        toast.appendChild(progressBar);

        // 5초 후 자동 사라짐
        setTimeout(() => {
            if (document.body.contains(toast)) {
                toast.style.animation = 'slideOutRight 0.4s cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards';
                setTimeout(() => {
                    if (document.body.contains(toast)) {
                        toast.remove();
                    }
                }, 400);
            }
        }, 5000);
    }

    // 복원 성공 토스트
    showRestoreSuccessToast() {
        const toastPosition = this.calculateToastPosition();

        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: ${toastPosition.top};
            right: ${toastPosition.right};
            width: 260px;
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 500;
            z-index: 10000000;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            box-shadow: 0 8px 16px -4px rgba(5, 150, 105, 0.2), 0 4px 6px -1px rgba(5, 150, 105, 0.1);
            display: flex;
            align-items: center;
            gap: 10px;
            border: 1px solid rgba(255,255,255,0.2);
            backdrop-filter: blur(8px);
            transform: translateX(100%) scale(0.8);
            opacity: 0;
            animation: slideInRight 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        `;

        // 성공 아이콘 추가
        const successIcon = document.createElement('div');
        successIcon.style.cssText = `
            width: 20px;
            height: 20px;
            background: rgba(255,255,255,0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            flex-shrink: 0;
        `;
        successIcon.textContent = '✅';

        const message = document.createElement('div');
        message.style.cssText = `
            flex: 1;
            font-weight: 600;
            opacity: 0;
            animation: fadeInUp 0.5s ease-out 0.2s forwards;
            font-size: 13px;
            line-height: 1.2;
        `;
        message.textContent = '항목이 복원되었습니다!';

        toast.appendChild(successIcon);
        toast.appendChild(message);
        
        // 토스트 등록
        if (window.toastSystem) {
            window.toastSystem.register(toast);
        }
        
        document.body.appendChild(toast);

        // 애니메이션 스타일 추가
        this.addSuccessStyles();

        setTimeout(() => {
            if (document.body.contains(toast)) {
                toast.style.animation = 'slideOutRight 0.4s cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards';
                setTimeout(() => {
                    if (document.body.contains(toast)) {
                        toast.remove();
                    }
                }, 400);
            }
        }, 2000);
    }

    // 토스트 위치 계산
    calculateToastPosition() {
        const floatingBox = document.getElementById('copyboard-floating');
        if (!floatingBox) {
            return {
                top: '20px',
                right: '20px'
            };
        }
        
        const rect = floatingBox.getBoundingClientRect();
        return {
            top: `${rect.bottom + 10}px`,
            right: '20px'
        };
    }

    // 토스트 애니메이션 스타일 추가
    addToastStyles() {
        if (document.getElementById('copyboard-toast-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'copyboard-toast-styles';
        style.textContent = `
            @keyframes slideInRight {
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
            
            @keyframes slideOutRight {
                0% {
                    transform: translateX(0) scale(1);
                    opacity: 1;
                }
                100% {
                    transform: translateX(100%) scale(0.8);
                    opacity: 0;
                }
            }
            
            @keyframes fadeInUp {
                0% {
                    transform: translateY(10px);
                    opacity: 0;
                }
                100% {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            
            @keyframes scaleIn {
                0% {
                    transform: scale(0.9);
                    opacity: 0;
                }
                100% {
                    transform: scale(1);
                    opacity: 1;
                }
            }
            
            @keyframes pulseIcon {
                0%, 100% {
                    transform: scale(1);
                }
                50% {
                    transform: scale(1.2);
                }
            }
            
            @keyframes progress {
                0% {
                    width: 100%;
                }
                100% {
                    width: 0%;
                }
            }
            
            .copyboard-toast-smooth-move {
                transition: top 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
            }
        `;
        document.head.appendChild(style);
    }

    // 성공 토스트 애니메이션 스타일 추가
    addSuccessStyles() {
        if (document.getElementById('copyboard-success-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'copyboard-success-styles';
        style.textContent = `
            @keyframes bounceIn {
                0% {
                    transform: scale(0.3);
                    opacity: 0;
                }
                50% {
                    transform: scale(1.1);
                    opacity: 0.8;
                }
                70% {
                    transform: scale(0.9);
                    opacity: 1;
                }
                100% {
                    transform: scale(1);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // 히스토리 업데이트 콜백 설정
    setHistoryUpdatedCallback(callback) {
        this.onHistoryUpdated = callback;
    }
}

// 전역 인스턴스 생성
window.historyManager = new HistoryManager(); 