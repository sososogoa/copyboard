import { SPOTLIGHT_ID } from '@/shared/constants';
import type { HistoryItem } from '@/shared/types';
import { ensureShadowRoot } from '@/content/core/host';
import * as Rpc from '@/content/core/rpc';
import { showToast } from '@/content/core/toast';
import type { ThemeController } from '@/content/core/theme';
import { classify, labelOf } from '@/content/detect/content-type';
import { fuzzyMatch, highlight, type FuzzyResult } from './fuzzy';

interface Row {
  item: HistoryItem;
  match: FuzzyResult;
}

interface Deps {
  theme: ThemeController;
}

export class Spotlight {
  private root: HTMLElement | null = null;
  private input: HTMLInputElement | null = null;
  private listEl: HTMLElement | null = null;
  private items: HistoryItem[] = [];
  private rows: Row[] = [];
  private cursor = 0;
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
    if (this.root) {
      this.input?.focus();
      return;
    }
    this.root = this.build();
    ensureShadowRoot().appendChild(this.root);
    this.themeUnsub = this.deps.theme.subscribe((dark) => {
      this.root?.classList.toggle('cb-dark', dark);
    });
    this.items = await Rpc.fetchHistory();
    this.cursor = 0;
    this.update('');
    requestAnimationFrame(() => this.input?.focus());
  }

  close(): void {
    if (!this.root) return;
    const node = this.root;
    this.root = null;
    this.themeUnsub?.();
    node.classList.add('cb-spot-leaving');
    window.setTimeout(() => node.parentNode?.removeChild(node), 180);
  }

  private build(): HTMLElement {
    const overlay = document.createElement('div');
    overlay.id = SPOTLIGHT_ID;
    overlay.className = 'cb-spot';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'CopyBoard Spotlight');
    overlay.onclick = (e) => {
      if (e.target === overlay) this.close();
    };

    const panel = document.createElement('div');
    panel.className = 'cb-spot-panel';

    const input = document.createElement('input');
    input.className = 'cb-spot-input';
    input.type = 'text';
    input.placeholder = '클립보드 검색...';
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.oninput = () => this.update(input.value);
    input.onkeydown = (e) => this.handleKey(e);
    this.input = input;
    panel.appendChild(input);

    const list = document.createElement('ul');
    list.className = 'cb-spot-list';
    list.setAttribute('role', 'listbox');
    this.listEl = list;
    panel.appendChild(list);

    const hint = document.createElement('div');
    hint.className = 'cb-spot-hint';
    hint.innerHTML =
      '<span><kbd>↑↓</kbd> 선택</span><span><kbd>Enter</kbd> 복사</span><span><kbd>Esc</kbd> 닫기</span>';
    panel.appendChild(hint);

    overlay.appendChild(panel);
    return overlay;
  }

  private update(query: string): void {
    if (!this.listEl) return;
    if (!query) {
      this.rows = this.items.map((item) => ({ item, match: { score: 0, matches: [] } }));
    } else {
      const out: Row[] = [];
      for (const item of this.items) {
        const m = fuzzyMatch(query, item.text);
        if (m) out.push({ item, match: m });
      }
      out.sort((a, b) => b.match.score - a.match.score);
      this.rows = out;
    }
    this.cursor = 0;
    this.renderList();
  }

  private renderList(): void {
    if (!this.listEl) return;
    this.listEl.innerHTML = '';
    if (this.rows.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'cb-spot-empty';
      empty.textContent = this.items.length === 0
        ? '아직 저장된 항목이 없어요'
        : '일치하는 항목이 없어요';
      this.listEl.appendChild(empty);
      return;
    }
    this.rows.forEach((row, idx) => {
      const li = this.renderRow(row, idx === this.cursor);
      li.onclick = () => {
        this.cursor = idx;
        void this.commit();
      };
      this.listEl!.appendChild(li);
    });
  }

  private renderRow(row: Row, active: boolean): HTMLElement {
    const li = document.createElement('li');
    li.className = 'cb-spot-row';
    if (active) {
      li.classList.add('cb-spot-active');
      li.setAttribute('aria-selected', 'true');
    }
    li.setAttribute('role', 'option');

    const kind = classify(row.item.text);
    const badge = document.createElement('span');
    badge.className = `cb-spot-badge cb-badge-${kind.kind}`;
    badge.textContent = labelOf(kind.kind);
    li.appendChild(badge);

    const text = document.createElement('span');
    text.className = 'cb-spot-text';
    const preview = oneLinePreview(row.item.text, 140);
    text.appendChild(highlight(preview, row.match.matches.filter((m) => m < preview.length)));
    li.appendChild(text);

    return li;
  }

  private handleKey(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      e.preventDefault();
      this.close();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.move(1);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.move(-1);
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      void this.commit();
    }
  }

  private move(delta: number): void {
    if (this.rows.length === 0) return;
    this.cursor = (this.cursor + delta + this.rows.length) % this.rows.length;
    this.renderList();
    const active = this.listEl?.querySelector('.cb-spot-active') as HTMLElement | null;
    active?.scrollIntoView({ block: 'nearest' });
  }

  private async commit(): Promise<void> {
    const row = this.rows[this.cursor];
    if (!row) return;
    try {
      await navigator.clipboard.writeText(row.item.text);
      this.close();
      showToast({ variant: 'copied', message: '복사됨' });
    } catch (err) {
      console.error('CopyBoard: clipboard write failed', err);
      showToast({ variant: 'info', message: '복사 실패' });
    }
  }
}

function oneLinePreview(text: string, max: number): string {
  const collapsed = text.replace(/\s+/g, ' ').trim();
  return collapsed.length > max ? collapsed.slice(0, max) + '…' : collapsed;
}
