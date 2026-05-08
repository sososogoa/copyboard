import {
  COPY_DEBOUNCE_MS,
  DUPLICATE_WINDOW_MS,
  MIN_TEXT_LENGTH,
  STORAGE_KEY_DETECTION,
} from '@/shared/constants';

type Listener = (text: string) => void;

export class CopyDetector {
  private enabled = true;
  private listener: Listener | null = null;
  private debounceTimer: number | null = null;
  private lastText = '';
  private lastTime = 0;
  private onCopy?: (e: ClipboardEvent) => void;
  private onKeydown?: (e: KeyboardEvent) => void;
  private started = false;

  constructor() {
    const saved = localStorage.getItem(STORAGE_KEY_DETECTION);
    this.enabled = saved === null ? true : saved === 'true';
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setListener(fn: Listener): void {
    this.listener = fn;
  }

  toggle(): boolean {
    this.enabled = !this.enabled;
    localStorage.setItem(STORAGE_KEY_DETECTION, String(this.enabled));
    if (this.enabled) this.start();
    else this.stop();
    return this.enabled;
  }

  start(): void {
    if (this.started) return;
    this.started = true;

    this.onCopy = () => {
      if (!this.enabled) return;
      window.setTimeout(() => {
        void this.readSelection().then((text) => {
          if (text) this.queue(text);
        });
      }, 80);
    };
    this.onKeydown = (e) => {
      if (!this.enabled) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        window.setTimeout(() => {
          const sel = window.getSelection()?.toString().trim();
          if (sel) this.queue(sel);
        }, 80);
      }
    };

    document.addEventListener('copy', this.onCopy);
    document.addEventListener('keydown', this.onKeydown);
  }

  stop(): void {
    if (!this.started) return;
    this.started = false;
    if (this.debounceTimer !== null) {
      window.clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    if (this.onCopy) document.removeEventListener('copy', this.onCopy);
    if (this.onKeydown) document.removeEventListener('keydown', this.onKeydown);
  }

  private async readSelection(): Promise<string> {
    try {
      const sel = window.getSelection()?.toString().trim();
      if (sel) return sel;
      // Permissions API may throw on some browsers
      const status = await navigator.permissions
        .query({ name: 'clipboard-read' as PermissionName })
        .catch(() => null);
      if (status?.state === 'granted') {
        return (await navigator.clipboard.readText()).trim();
      }
    } catch {
      // ignore
    }
    return '';
  }

  private queue(text: string): void {
    const trimmed = text.trim();
    if (trimmed.length < MIN_TEXT_LENGTH) return;
    const now = Date.now();
    if (trimmed === this.lastText && now - this.lastTime < DUPLICATE_WINDOW_MS) return;

    if (this.debounceTimer !== null) window.clearTimeout(this.debounceTimer);
    this.debounceTimer = window.setTimeout(() => {
      this.lastText = trimmed;
      this.lastTime = Date.now();
      this.listener?.(trimmed);
    }, COPY_DEBOUNCE_MS);
  }
}
