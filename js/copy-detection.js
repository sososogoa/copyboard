// 복사 감지 모듈
class CopyDetection {
    constructor() {
        this.copyListener = null;
        this.keyboardListener = null;
        this.isEnabled = true;
        this.onCopyCallback = null;
        
        this.loadSettings();
    }

    // 복사 감지 설정 로드
    loadSettings() {
        const savedSetting = localStorage.getItem('copyboard-detection-enabled');
        this.isEnabled = savedSetting !== null ? JSON.parse(savedSetting) : true;
    }

    // 복사 감지 설정 저장
    saveSettings() {
        localStorage.setItem('copyboard-detection-enabled', JSON.stringify(this.isEnabled));
    }

    // 복사 감지 토글
    toggle() {
        this.isEnabled = !this.isEnabled;
        this.saveSettings();
        
        if (this.isEnabled) {
            this.start();
        } else {
            this.stop();
        }
        
        return this.isEnabled;
    }

    // 복사 감지 시작
    start() {
        if (this.copyListener && this.keyboardListener) return; // 이미 설정되어 있으면 스킵

        this.copyListener = async (e) => {
            if (!this.isEnabled) return;
            
            setTimeout(async () => {
                let copiedText = await this.getCopiedText();
                
                // 복사된 텍스트가 있으면 콜백 실행
                if (copiedText && copiedText.trim() && this.onCopyCallback) {
                    this.onCopyCallback(copiedText.trim());
                }
            }, 100);
        };

        // Ctrl+C / Cmd+C 키보드 단축키 감지
        this.keyboardListener = (e) => {
            if (!this.isEnabled) return;
            
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
                setTimeout(() => {
                    const selection = window.getSelection().toString();
                    if (selection && selection.trim() && this.onCopyCallback) {
                        this.onCopyCallback(selection.trim());
                    }
                }, 100);
            }
        };

        document.addEventListener('copy', this.copyListener);
        document.addEventListener('keydown', this.keyboardListener);
    }

    // 복사 감지 중지
    stop() {
        if (this.copyListener) {
            document.removeEventListener('copy', this.copyListener);
            this.copyListener = null;
        }
        if (this.keyboardListener) {
            document.removeEventListener('keydown', this.keyboardListener);
            this.keyboardListener = null;
        }
    }

    // 복사된 텍스트 가져오기
    async getCopiedText() {
        try {
            // 1. 먼저 클립보드 권한 확인
            const permissions = await navigator.permissions.query({ name: 'clipboard-read' });
            
            if (permissions.state === 'granted') {
                // 권한이 있으면 클립보드에서 직접 읽기
                return await navigator.clipboard.readText();
            } else {
                // 권한이 없거나 지원하지 않으면 선택된 텍스트 사용
                return window.getSelection().toString();
            }
        } catch (error) {
            // 클립보드 읽기 실패 시 선택된 텍스트 사용
            return window.getSelection().toString();
        }
    }

    // 복사 콜백 설정
    setCopyCallback(callback) {
        this.onCopyCallback = callback;
    }

    // 현재 상태 반환
    getStatus() {
        return this.isEnabled;
    }
}

// 전역 인스턴스 생성
window.copyDetection = new CopyDetection(); 