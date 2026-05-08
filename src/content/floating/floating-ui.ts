import { FLOATING_ID, MAX_HISTORY_SIZE } from '@/shared/constants';
import type { HistoryItem } from '@/shared/types';
import { ensureShadowRoot } from '@/content/core/host';
import * as Rpc from '@/content/core/rpc';
import { showToast } from '@/content/core/toast';
import type { ThemeController } from '@/content/core/theme';
import type { CopyDetector } from '@/content/core/copy-detector';
import { renderCard } from './smart-card';

interface Deps {
  detector: CopyDetector;
  theme: ThemeController;
  onClose?: () => void;
}

export class FloatingUI {
  private root: HTMLElement | null = null;
  private items: HistoryItem[] = [];
  private filter = '';
  private listEl: HTMLElement | null = null;
  private statsEl: HTMLElement | null = null;
  private searchEl: HTMLInputElement | null = null;
  private themeUnsub?: () => void;

  constructor(private deps: Deps) {}

  isOpen(): boolean {
    return this.root !== null;
  }

  toggle(): void {
    if (this.root) this.close();
    else void this.open();
  }

  async open(): Promise<void> {
    if (this.root) return;
    this.root = this.build();
    ensureShadowRoot().appendChild(this.root);
    this.themeUnsub = this.deps.theme.subscribe((dark) => {
      this.root?.classList.toggle('cb-dark', dark);
    });
    await this.refresh();
    requestAnimationFrame(() => this.searchEl?.focus());
  }

  close(): void {
    if (!this.root) return;
    this.root.classList.add('cb-closing');
    const node = this.root;
    this.root = null;
    this.themeUnsub?.();
    window.setTimeout(() => node.parentNode?.removeChild(node), 280);
    this.deps.onClose?.();
  }

  receiveHistory(history: HistoryItem[]): void {
    this.items = history;
    if (this.root) this.render();
  }

  private async refresh(): Promise<void> {
    this.items = await Rpc.fetchHistory();
    this.render();
  }

  private build(): HTMLElement {
    const root = document.createElement('section');
    root.id = FLOATING_ID;
    root.className = 'cb-floating';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', 'CopyBoard');

    root.appendChild(this.buildHeader());
    root.appendChild(this.buildToolbar());

    const list = document.createElement('div');
    list.className = 'cb-list';
    this.listEl = list;
    root.appendChild(list);

    const footer = document.createElement('footer');
    footer.className = 'cb-footer';
    const stats = document.createElement('span');
    stats.className = 'cb-stats';
    this.statsEl = stats;
    footer.appendChild(stats);
    const clearBtn = document.createElement('button');
    clearBtn.className = 'cb-btn cb-btn-danger';
    clearBtn.type = 'button';
    clearBtn.textContent = '전체 삭제';
    clearBtn.onclick = () => void this.handleClear();
    footer.appendChild(clearBtn);
    root.appendChild(footer);

    return root;
  }

  private buildHeader(): HTMLElement {
    const header = document.createElement('header');
    header.className = 'cb-head';

    const title = document.createElement('h2');
    title.className = 'cb-title';
    title.textContent = 'CopyBoard';
    header.appendChild(title);

    const actions = document.createElement('div');
    actions.className = 'cb-head-actions';

    const detectBtn = document.createElement('button');
    detectBtn.type = 'button';
    detectBtn.className = 'cb-pill';
    const refreshDetect = () => {
      const on = this.deps.detector.isEnabled();
      detectBtn.classList.toggle('cb-pill-on', on);
      detectBtn.classList.toggle('cb-pill-off', !on);
      detectBtn.textContent = `자동 감지 ${on ? 'ON' : 'OFF'}`;
    };
    refreshDetect();
    detectBtn.onclick = () => {
      this.deps.detector.toggle();
      refreshDetect();
    };
    actions.appendChild(detectBtn);

    const themeBtn = document.createElement('button');
    themeBtn.type = 'button';
    themeBtn.className = 'cb-icon-btn cb-theme-btn';
    themeBtn.setAttribute('aria-label', '테마 전환');
    const refreshTheme = () => {
      themeBtn.textContent = this.deps.theme.current() ? '🌙' : '☀️';
    };
    refreshTheme();
    themeBtn.onclick = () => {
      this.deps.theme.toggle();
      refreshTheme();
    };
    actions.appendChild(themeBtn);

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'cb-icon-btn cb-close-btn';
    closeBtn.setAttribute('aria-label', '닫기');
    closeBtn.textContent = '×';
    closeBtn.onclick = () => this.close();
    actions.appendChild(closeBtn);

    header.appendChild(actions);
    return header;
  }

  private buildToolbar(): HTMLElement {
    const tools = document.createElement('div');
    tools.className = 'cb-tools';

    const search = document.createElement('input');
    search.type = 'search';
    search.className = 'cb-search';
    search.placeholder = '🔍 검색...';
    search.oninput = () => {
      this.filter = search.value.trim().toLowerCase();
      this.render();
    };
    search.onkeydown = (e) => {
      if (e.key === 'Escape') {
        if (search.value) {
          search.value = '';
          this.filter = '';
          this.render();
        } else {
          this.close();
        }
      }
    };
    this.searchEl = search;
    tools.appendChild(search);

    const addWrap = document.createElement('div');
    addWrap.className = 'cb-add';
    const ta = document.createElement('textarea');
    ta.className = 'cb-textarea';
    ta.placeholder = '직접 입력 (Ctrl+Enter 로 추가)';
    ta.rows = 2;
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'cb-btn cb-btn-primary';
    addBtn.textContent = '+ 추가';
    const submit = async (): Promise<void> => {
      const value = ta.value.trim();
      if (!value) return;
      ta.value = '';
      const ok = await Rpc.saveHistory(value);
      if (ok) await this.refresh();
    };
    addBtn.onclick = () => void submit();
    ta.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        void submit();
      }
    });
    addWrap.appendChild(ta);
    addWrap.appendChild(addBtn);
    tools.appendChild(addWrap);

    return tools;
  }

  private render(): void {
    if (!this.listEl || !this.statsEl) return;

    const filtered = this.filter
      ? this.items.filter((it) => it.text.toLowerCase().includes(this.filter))
      : this.items;

    this.statsEl.innerHTML = `저장된 항목 <strong>${filtered.length}</strong> / ${this.items.length}`;

    this.listEl.innerHTML = '';
    if (filtered.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'cb-empty';
      empty.textContent = this.filter
        ? '일치하는 항목이 없어요'
        : '복사한 항목이 여기에 쌓입니다';
      this.listEl.appendChild(empty);
      return;
    }

    for (const item of filtered) {
      this.listEl.appendChild(
        renderCard(item, {
          onCopy: (it, e) => void this.handleCopy(it, e),
          onDelete: (id) => void this.handleDelete(id),
        }),
      );
    }
  }

  private async handleCopy(item: HistoryItem, e: MouseEvent): Promise<void> {
    try {
      await navigator.clipboard.writeText(item.text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = item.text;
      ta.style.cssText = 'position:fixed;opacity:0;';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    const target = e.target instanceof Element ? e.target.getBoundingClientRect() : null;
    showToast({ variant: 'copied', message: '복사됨', anchorRect: target });
  }

  private async handleDelete(id: string): Promise<void> {
    const ok = await Rpc.deleteItem(id);
    if (ok) await this.refresh();
  }

  private async handleClear(): Promise<void> {
    const ok = await Rpc.clearAll();
    if (!ok) return;
    await this.refresh();
    showToast({
      variant: 'undo',
      message: '모두 삭제됨',
      durationMs: 5000,
      action: {
        label: '취소',
        onClick: () => {
          void Rpc.restore().then(async (restored) => {
            if (restored) {
              await this.refresh();
              showToast({ variant: 'restored', message: '복원되었습니다' });
            }
          });
        },
      },
    });
  }

  static maxSize = MAX_HISTORY_SIZE;
}
