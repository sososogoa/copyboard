// 토스트 알림 시스템
class ToastSystem {
    constructor() {
        this.activeToasts = [];
        this.stylesAdded = new Set();
        this.resizeObserver = null;
    }

    // 토스트 등록
    register(toast) {
        this.activeToasts.push(toast);
        
        // 토스트가 제거될 때 배열에서도 제거
        const originalRemove = toast.remove;
        toast.remove = () => {
            const index = this.activeToasts.indexOf(toast);
            if (index > -1) {
                this.activeToasts.splice(index, 1);
            }
            originalRemove.call(toast);
            
            // 남은 토스트들 위치 재조정
            setTimeout(() => {
                this.updateAllPositions();
            }, 100);
        };
    }

    // 모든 토스트 위치 업데이트
    updateAllPositions() {
        const newPosition = this.calculatePosition();
        const floatingBox = document.getElementById('copyboard-floating');
        
        this.activeToasts.forEach((toast, index) => {
            if (toast && document.body.contains(toast)) {
                // 자동 저장 토스트는 CopyBoard 상단 왼쪽에 위치
                if (toast.classList.contains('copyboard-auto-save-notification')) {
                    if (floatingBox) {
                        const rect = floatingBox.getBoundingClientRect();
                        toast.style.transition = 'top 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), left 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                        toast.style.top = `${rect.top - 10}px`;
                        toast.style.left = `${rect.left}px`;
                    }
                } else if (toast.classList.contains('copyboard-copy-feedback')) {
                    // 복사 피드백은 클릭 위치 기준이므로 CopyBoard 움직임과 무관
                } else {
                    // 다른 토스트들은 CopyBoard 아래에 위치
                    const offsetTop = parseInt(newPosition.top) + (index * 10);
                    
                    toast.style.transition = 'top 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                    toast.style.top = `${offsetTop}px`;
                    toast.style.right = newPosition.right;
                }
            }
        });
    }

    // 토스트 위치 계산
    calculatePosition() {
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

    // 스타일 추가 (중복 방지)
    addStyles(id, css) {
        if (this.stylesAdded.has(id)) return;
        
        const style = document.createElement('style');
        style.id = id;
        style.textContent = css;
        document.head.appendChild(style);
        
        this.stylesAdded.add(id);
    }

    // 자동 저장 토스트
    showAutoSave() {
        // 기존 자동 저장 토스트가 있으면 제거
        const existing = document.querySelector('.copyboard-auto-save-notification');
        if (existing) {
            existing.remove();
        }

        // CopyBoard 위치 계산
        const floatingBox = document.getElementById('copyboard-floating');
        let position = { top: '20px', left: '20px' };

        if (floatingBox) {
            const rect = floatingBox.getBoundingClientRect();
            position = {
                top: `${rect.top - 50}px`,
                left: `${rect.left}px`
            };
        }

        const notification = document.createElement('div');
        notification.className = 'copyboard-auto-save-notification';
        notification.style.cssText = `
            position: fixed;
            top: ${position.top};
            left: ${position.left};
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
            color: white;
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 600;
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            box-shadow: 0 8px 25px -5px rgba(5, 150, 105, 0.4), 0 0 0 1px rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            backdrop-filter: blur(12px);
            display: flex;
            align-items: center;
            gap: 6px;
            transform: translateY(-20px) scale(0.9);
            opacity: 0;
            animation: modernDropIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        `;

        const icon = document.createElement('span');
        icon.style.cssText = `
            font-size: 14px;
            animation: pulseIcon 0.8s ease-in-out;
        `;
        icon.textContent = '✨';

        const text = document.createElement('span');
        text.textContent = '저장됨';

        notification.appendChild(icon);
        notification.appendChild(text);
        
        this.register(notification);
        document.body.appendChild(notification);

        // 애니메이션 스타일 추가
        this.addStyles('copyboard-autosave-styles', `
            @keyframes modernDropIn {
                0% {
                    transform: translateY(-20px) scale(0.9);
                    opacity: 0;
                }
                50% {
                    transform: translateY(5px) scale(1.02);
                    opacity: 0.8;
                }
                100% {
                    transform: translateY(0) scale(1);
                    opacity: 1;
                }
            }
            
            @keyframes modernFadeOut {
                0% {
                    transform: translateY(0) scale(1);
                    opacity: 1;
                }
                100% {
                    transform: translateY(-10px) scale(0.95);
                    opacity: 0;
                }
            }

            @keyframes pulseIcon {
                0%, 100% { 
                    transform: scale(1) rotate(0deg); 
                }
                25% { 
                    transform: scale(1.2) rotate(-5deg); 
                }
                75% { 
                    transform: scale(1.1) rotate(5deg); 
                }
            }
        `);

        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.style.animation = 'modernFadeOut 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards';
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        notification.remove();
                    }
                }, 400);
            }
        }, 2000);
    }

    // 복사 완료 토스트
    showCopyFeedback(clickEvent = null) {
        // 기존 복사 피드백이 있으면 제거
        const existing = document.querySelector('.copyboard-copy-feedback');
        if (existing) {
            existing.remove();
        }

        // 클릭 위치 또는 기본 위치 계산
        let feedbackPosition = { top: '20px', left: '50%' };

        if (clickEvent && clickEvent.target) {
            const rect = clickEvent.target.getBoundingClientRect();
            feedbackPosition = {
                top: `${rect.top - 30}px`,
                left: `${rect.left + rect.width / 2}px`,
                transform: 'translateX(-50%)'
            };
        } else {
            const floatingBox = document.getElementById('copyboard-floating');
            if (floatingBox) {
                const rect = floatingBox.getBoundingClientRect();
                feedbackPosition = {
                    top: `${rect.top}px`,
                    right: `${Math.max(20, window.innerWidth - rect.right + 10)}px`
                };
            }
        }

        const feedback = document.createElement('div');
        feedback.className = 'copyboard-copy-feedback';
        const positionStyle = feedbackPosition.transform 
            ? `top: ${feedbackPosition.top}; left: ${feedbackPosition.left}; transform: ${feedbackPosition.transform}`
            : `top: ${feedbackPosition.top}; right: ${feedbackPosition.right}`;
        
        feedback.style.cssText = `
            position: fixed;
            ${positionStyle};
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 500;
            z-index: 9999998;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            box-shadow: 0 2px 4px -1px rgba(5, 150, 105, 0.3);
            border: 1px solid rgba(255,255,255,0.2);
            backdrop-filter: blur(8px);
            transform: ${feedbackPosition.transform ? feedbackPosition.transform + ' ' : ''}translateY(-100%) scale(0.8);
            opacity: 0;
            animation: popInPlace 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            pointer-events: none;
        `;
        feedback.textContent = '✅ 복사됨';

        this.register(feedback);
        document.body.appendChild(feedback);

        // 애니메이션 스타일 추가
        this.addStyles('copyboard-feedback-styles', `
            @keyframes popInPlace {
                0% {
                    transform: translateX(-50%) translateY(-100%) scale(0.8);
                    opacity: 0;
                }
                50% {
                    transform: translateX(-50%) translateY(-10px) scale(1.1);
                    opacity: 0.9;
                }
                100% {
                    transform: translateX(-50%) translateY(-20px) scale(1);
                    opacity: 1;
                }
            }
            
            @keyframes fadeOutPlace {
                0% {
                    transform: translateX(-50%) translateY(-20px) scale(1);
                    opacity: 1;
                }
                100% {
                    transform: translateX(-50%) translateY(-40px) scale(0.8);
                    opacity: 0;
                }
            }
        `);

        setTimeout(() => {
            if (document.body.contains(feedback)) {
                feedback.style.animation = 'fadeOutPlace 0.3s cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards';
                setTimeout(() => {
                    if (document.body.contains(feedback)) {
                        feedback.remove();
                    }
                }, 300);
            }
        }, 1000);
    }

    // ResizeObserver 시작
    startResizeObserver() {
        const floatingBox = document.getElementById('copyboard-floating');
        if (!floatingBox || this.resizeObserver) return;
        
        this.resizeObserver = new ResizeObserver(() => {
            requestAnimationFrame(() => {
                this.updateAllPositions();
            });
        });
        
        this.resizeObserver.observe(floatingBox);
        
        // 내용 변화도 감지
        const mutationObserver = new MutationObserver(() => {
            requestAnimationFrame(() => {
                this.updateAllPositions();
            });
        });
        
        mutationObserver.observe(floatingBox, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style']
        });
    }

    // ResizeObserver 정리
    cleanup() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }

        // 모든 활성 토스트 제거
        this.activeToasts.forEach(toast => {
            if (toast && document.body.contains(toast)) {
                toast.style.animation = 'slideOutRight 0.3s cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards';
                setTimeout(() => {
                    if (document.body.contains(toast)) {
                        toast.remove();
                    }
                }, 300);
            }
        });
        this.activeToasts = [];
    }
}

// 전역 인스턴스 생성
window.toastSystem = new ToastSystem(); 