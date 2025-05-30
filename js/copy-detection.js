// 복사 감지 모듈
class CopyDetection {
    constructor() {
        this.copyListener = null;
        this.keyboardListener = null;
        this.isEnabled = true;
        this.onCopyCallback = null;
        this.debounceTimer = null;
        this.lastCopiedText = '';
        this.lastCopyTime = 0;
        this.copyDebounceDelay = 300; // 300ms 디바운스
        this.duplicateThreshold = 1000; // 1초 내 같은 텍스트 무시
        
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

    // 디바운스된 복사 처리
    handleCopyDebounced(text) {
        // 디바운스 타이머 클리어
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        // 중복 복사 체크
        const now = Date.now();
        if (text === this.lastCopiedText && (now - this.lastCopyTime) < this.duplicateThreshold) {
            console.log('CopyBoard: 중복 복사 무시:', text.substring(0, 30));
            return;
        }

        // 디바운스 적용
        this.debounceTimer = setTimeout(() => {
            this.processCopy(text);
        }, this.copyDebounceDelay);
    }

    // 실제 복사 처리
    processCopy(text) {
        if (!text || !text.trim()) return;

        const trimmedText = text.trim();
        
        // 최소 길이 체크
        if (trimmedText.length < 3) {
            return;
        }

        // 마지막 복사 정보 업데이트
        this.lastCopiedText = trimmedText;
        this.lastCopyTime = Date.now();

        // 콜백 실행
        if (this.onCopyCallback) {
            this.onCopyCallback(trimmedText);
        }
    }

    // 복사 감지 시작
    start() {
        if (this.copyListener && this.keyboardListener) return; // 이미 설정되어 있으면 스킵

        this.copyListener = async (e) => {
            if (!this.isEnabled) return;
            
            setTimeout(async () => {
                let copiedText = await this.getCopiedText();
                
                // 복사된 텍스트가 있으면 디바운스된 처리 실행
                if (copiedText && copiedText.trim()) {
                    this.handleCopyDebounced(copiedText.trim());
                }
            }, 100);
        };

        // Ctrl+C / Cmd+C 키보드 단축키 감지
        this.keyboardListener = (e) => {
            if (!this.isEnabled) return;
            
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
                setTimeout(() => {
                    const selection = window.getSelection().toString();
                    if (selection && selection.trim()) {
                        this.handleCopyDebounced(selection.trim());
                    }
                }, 100);
            }
        };

        document.addEventListener('copy', this.copyListener);
        document.addEventListener('keydown', this.keyboardListener);
    }

    // 복사 감지 중지
    stop() {
        // 디바운스 타이머 정리
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }

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