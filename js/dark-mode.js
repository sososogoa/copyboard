/**
 * CopyBoard Dark Mode Manager
 * 부드러운 페이드 전환과 함께하는 다크 모드 시스템
 */

class DarkModeManager {
    constructor() {
        this.isDarkMode = false; // 기본값: 라이트 모드
        this.isTransitioning = false;
        this.transitionDuration = 300; // 0.3초
        
        this.init();
    }

    init() {
        // 저장된 테마 설정 로드
        this.loadSavedTheme();
        
        // 시스템 테마 변경 감지
        this.setupSystemThemeWatcher();
    }

    async loadSavedTheme() {
        try {
            const result = await chrome.storage.local.get(['copyboard_dark_mode']);
            // 기본값을 false (라이트 모드)로 설정
            this.isDarkMode = result.copyboard_dark_mode === true;
            
            // 즉시 테마 적용 (애니메이션 없이)
            this.applyThemeInstantly(this.isDarkMode);
        } catch (error) {
            console.warn('다크 모드 설정 로드 실패:', error);
            // 오류 시에도 라이트 모드가 기본값
            this.isDarkMode = false;
            this.applyThemeInstantly(false);
        }
    }

    setupSystemThemeWatcher() {
        // prefers-color-scheme 변경 감지
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
            // 사용자가 수동으로 설정하지 않은 경우만 시스템 테마 따라가기
            chrome.storage.local.get(['copyboard_dark_mode_manual'], (result) => {
                if (!result.copyboard_dark_mode_manual) {
                    const systemDarkMode = e.matches;
                    if (this.isDarkMode !== systemDarkMode) {
                        this.toggle(false); // 애니메이션 없이 변경
                    }
                }
            });
        });
    }

    async saveTheme(isDark, isManual = true) {
        try {
            await chrome.storage.local.set({ 
                copyboard_dark_mode: isDark,
                copyboard_dark_mode_manual: isManual 
            });
        } catch (error) {
            console.warn('다크 모드 설정 저장 실패:', error);
        }
    }

    applyThemeInstantly(isDark) {
        // 플로팅 박스 찾기 - 여러 방법으로 시도
        let floatingBox = document.getElementById('copyboard-floating');
        
        // 플로팅 박스가 없으면 잠시 대기 후 다시 시도
        if (!floatingBox) {
            setTimeout(() => {
                floatingBox = document.getElementById('copyboard-floating');
                if (floatingBox) {
                    this.applyThemeToElement(floatingBox, isDark);
                }
            }, 100);
            return;
        }

        this.applyThemeToElement(floatingBox, isDark);
        this.isDarkMode = isDark;
        this.updateToggleButton();
    }

    applyThemeToElement(element, isDark) {
        if (!element) {
            console.warn('테마 적용할 엘리먼트가 없습니다.');
            return;
        }
        
        console.log(`테마 적용 시작: ${isDark ? '다크' : '라이트'} 모드`);
        
        if (isDark) {
            element.classList.add('copyboard-dark-mode');
            console.log('다크 모드 클래스 추가됨');
        } else {
            element.classList.remove('copyboard-dark-mode');
            console.log('다크 모드 클래스 제거됨');
        }
    }

    async toggle(withAnimation = true) {
        if (this.isTransitioning) {
            return;
        }

        const newTheme = !this.isDarkMode;
        
        if (withAnimation) {
            await this.transitionToTheme(newTheme);
        } else {
            this.applyThemeInstantly(newTheme);
            await this.saveTheme(newTheme);
        }
    }

    async transitionToTheme(isDark) {
        this.isTransitioning = true;
        
        const floatingBox = document.getElementById('copyboard-floating');
        if (!floatingBox) {
            console.warn('플로팅 박스를 찾을 수 없어 전환을 건너뜁니다.');
            this.isTransitioning = false;
            return;
        }

        try {
            // 토글 버튼 회전 애니메이션 시작
            this.startButtonRotation();

            // 즉시 테마 적용 - CSS transition이 부드러운 변화를 처리
            this.applyThemeToElement(floatingBox, isDark);
            this.isDarkMode = isDark;
            this.updateToggleButton();

            // 설정 저장
            await this.saveTheme(isDark);
            
            console.log(`테마 전환 완료: ${isDark ? '다크' : '라이트'} 모드`);

        } catch (error) {
            console.error('테마 전환 중 오류:', error);
        } finally {
            // 회전 애니메이션 시간만큼 대기 후 전환 상태 해제
            setTimeout(() => {
                this.isTransitioning = false;
            }, 400);
        }
    }

    startButtonRotation() {
        const button = document.querySelector('.dark-mode-toggle');
        if (button) {
            button.classList.add('rotating');
            setTimeout(() => {
                button.classList.remove('rotating');
            }, 600);
        }
    }

    updateToggleButton() {
        const button = document.querySelector('.dark-mode-toggle');
        const icon = button?.querySelector('.icon');
        
        if (!button || !icon) {
            // 버튼이 없으면 약간 기다린 후 다시 시도
            setTimeout(() => {
                const retryButton = document.querySelector('.dark-mode-toggle');
                const retryIcon = retryButton?.querySelector('.icon');
                if (retryButton && retryIcon) {
                    this.updateButtonState(retryButton, retryIcon);
                }
            }, 100);
            return;
        }

        this.updateButtonState(button, icon);
    }

    updateButtonState(button, icon) {
        if (this.isDarkMode) {
            button.classList.add('dark');
            icon.textContent = '🌙';
        } else {
            button.classList.remove('dark');
            icon.textContent = '☀️';
        }
    }

    createToggleButton() {
        const button = document.createElement('button');
        button.className = 'dark-mode-toggle';
        button.title = '다크 모드 전환';
        button.setAttribute('aria-label', '다크 모드 전환');
        
        const icon = document.createElement('span');
        icon.className = 'icon';
        icon.textContent = this.isDarkMode ? '🌙' : '☀️';
        
        button.appendChild(icon);
        
        // 초기 상태 설정
        if (this.isDarkMode) {
            button.classList.add('dark');
        }
        
        // 클릭 이벤트
        button.addEventListener('click', () => {
            this.toggle(true);
        });

        // 키보드 접근성
        button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggle(true);
            }
        });

        return button;
    }

    // 현재 테마 상태 반환
    getCurrentTheme() {
        return this.isDarkMode ? 'dark' : 'light';
    }

    // 특정 테마로 설정
    async setTheme(theme, withAnimation = true) {
        const isDark = theme === 'dark';
        if (this.isDarkMode !== isDark) {
            if (withAnimation) {
                await this.transitionToTheme(isDark);
            } else {
                this.applyThemeInstantly(isDark);
                await this.saveTheme(isDark);
            }
        }
    }

    // 시스템 테마 감지
    getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    // 자동 테마 모드 활성화
    enableAutoMode() {
        chrome.storage.local.set({ copyboard_dark_mode_manual: false });
        const systemTheme = this.getSystemTheme();
        this.setTheme(systemTheme, true);
    }

    // 디버그: 현재 상태 로그
    logCurrentState() {
        console.log('DarkMode State:', {
            isDarkMode: this.isDarkMode,
            isTransitioning: this.isTransitioning,
            systemTheme: this.getSystemTheme()
        });
    }
}

// 전역 인스턴스 생성
let darkModeManager = null;

// DOM 로드 후 자동 초기화 - 더 강화된 로직
function waitForDOMAndInit() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initDarkMode, 100); // DOM 로드 후 약간 대기
        });
    } else {
        setTimeout(initDarkMode, 50); // 이미 로드되어 있으면 조금 대기 후 초기화
    }
}

// 플로팅 박스 생성을 감지하는 MutationObserver
function setupFloatingBoxObserver() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE && node.id === 'copyboard-floating') {
                    console.log('플로팅 박스 생성 감지됨');
                    // 플로팅 박스가 생성되면 즉시 테마 적용
                    if (darkModeManager) {
                        setTimeout(() => {
                            darkModeManager.applyThemeInstantly(darkModeManager.isDarkMode);
                        }, 50);
                    }
                }
            });
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// 초기화 개선
function initDarkMode() {
    if (!darkModeManager) {
        darkModeManager = new DarkModeManager();
    }
    
    // 플로팅 박스 생성 감지 설정
    setupFloatingBoxObserver();
    
    return darkModeManager;
}

waitForDOMAndInit();

// 다크 모드 토글 함수 (외부에서 호출 가능)
function toggleDarkMode() {
    if (darkModeManager) {
        darkModeManager.toggle(true);
    }
}

// 특정 테마로 설정 함수
function setDarkMode(isDark, withAnimation = true) {
    if (darkModeManager) {
        darkModeManager.setTheme(isDark ? 'dark' : 'light', withAnimation);
    }
}

// 현재 테마 가져오기
function getCurrentTheme() {
    return darkModeManager ? darkModeManager.getCurrentTheme() : 'light';
}

// 토글 버튼 생성 함수
function createDarkModeToggle() {
    if (darkModeManager) {
        return darkModeManager.createToggleButton();
    }
    return null;
}

// 자동 모드 활성화
function enableAutoTheme() {
    if (darkModeManager) {
        darkModeManager.enableAutoMode();
    }
}

// 익스포트 (다른 모듈에서 사용 가능)
if (typeof window !== 'undefined') {
    window.CopyBoardDarkMode = {
        init: initDarkMode,
        toggle: toggleDarkMode,
        setTheme: setDarkMode,
        getCurrentTheme,
        createToggle: createDarkModeToggle,
        enableAutoMode: enableAutoTheme,
        getManager: () => darkModeManager
    };
} 