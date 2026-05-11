import { FLOATING_ID, MAX_HISTORY_SIZE } from '@/shared/constants';
import type { HistoryItem } from '@/shared/types';
import { ensureShadowRoot } from '@/content/core/host';
import * as Rpc from '@/content/core/rpc';
import { showToast } from '@/content/core/toast';
import type { ThemeController } from '@/content/core/theme';
import type { CopyDetector } from '@/content/core/copy-detector';
import { renderCard } from './smart-card';
import { buildHeader, type SitePillController } from './floating-header';
import { buildToolbar } from './floating-toolbar';

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
  private sitePill: SitePillController | null = null;
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
    await Promise.all([this.refresh(), this.sitePill?.refresh() ?? Promise.resolve()]);
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

    const header = buildHeader({
      detector: this.deps.detector,
      theme: this.deps.theme,
      onClose: () => this.close(),
    });
    this.sitePill = header.sitePill;
    root.appendChild(header.el);

    const toolbar = buildToolbar({
      onSearch: (q) => {
        this.filter = q;
        this.render();
      },
      onSubmit: (text) => this.submitManual(text),
      onEscape: () => this.close(),
    });
    this.searchEl = toolbar.searchInput;
    root.appendChild(toolbar.el);

    const list = document.createElement('div');
    list.className = 'cb-list';
    this.listEl = list;
    root.appendChild(list);

    root.appendChild(this.buildFooter());
    return root;
  }

  private buildFooter(): HTMLElement {
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
    return footer;
  }

  private async submitManual(text: string): Promise<void> {
    const res = await Rpc.saveHistory(text);
    if (res.success) {
      await this.refresh();
    } else if (res.rejectedReason === 'sensitive') {
      showToast({
        variant: 'info',
        message: '민감정보로 감지되어 저장하지 않음',
        durationMs: 2400,
      });
    }
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
