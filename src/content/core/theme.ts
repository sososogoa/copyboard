import {
  STORAGE_KEY_THEME,
  STORAGE_KEY_THEME_MANUAL,
} from '@/shared/constants';

type ThemeChange = (isDark: boolean) => void;

export class ThemeController {
  private isDark = false;
  private subscribers: ThemeChange[] = [];
  private mediaQuery: MediaQueryList;

  constructor() {
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.mediaQuery.addEventListener('change', (e) => {
      void chrome.storage.local
        .get([STORAGE_KEY_THEME_MANUAL])
        .then((res) => {
          if (!res[STORAGE_KEY_THEME_MANUAL]) this.applyTheme(e.matches, false);
        });
    });
  }

  async init(): Promise<void> {
    try {
      const res = await chrome.storage.local.get([
        STORAGE_KEY_THEME,
        STORAGE_KEY_THEME_MANUAL,
      ]);
      const manual = Boolean(res[STORAGE_KEY_THEME_MANUAL]);
      this.isDark = manual ? Boolean(res[STORAGE_KEY_THEME]) : this.mediaQuery.matches;
      this.broadcast();
    } catch {
      this.isDark = this.mediaQuery.matches;
      this.broadcast();
    }
  }

  current(): boolean {
    return this.isDark;
  }

  toggle(): void {
    this.applyTheme(!this.isDark, true);
  }

  subscribe(fn: ThemeChange): () => void {
    this.subscribers.push(fn);
    fn(this.isDark);
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== fn);
    };
  }

  private applyTheme(isDark: boolean, manual: boolean): void {
    this.isDark = isDark;
    void chrome.storage.local.set({
      [STORAGE_KEY_THEME]: isDark,
      [STORAGE_KEY_THEME_MANUAL]: manual,
    });
    this.broadcast();
  }

  private broadcast(): void {
    for (const fn of this.subscribers) fn(this.isDark);
  }
}
