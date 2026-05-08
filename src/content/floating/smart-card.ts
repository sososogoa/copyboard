/**
 * Renders a HistoryItem as a type-aware card. Each branch returns a piece of DOM
 * tailored to the detected content kind. Falls back to plain text preview.
 */
import type { HistoryItem } from '@/shared/types';
import { classify, labelOf, type ContentKind } from '@/content/detect/content-type';

export interface CardCallbacks {
  onCopy: (item: HistoryItem, e: MouseEvent) => void;
  onDelete: (itemId: string) => void;
}

export function renderCard(item: HistoryItem, cb: CardCallbacks): HTMLElement {
  const kind = classify(item.text);
  const root = document.createElement('article');
  root.className = `cb-card cb-card-${kind.kind}`;
  root.tabIndex = 0;
  root.setAttribute('role', 'button');
  root.setAttribute(
    'aria-label',
    `${labelOf(kind.kind)} 항목, 클릭하여 복사`,
  );

  const header = document.createElement('header');
  header.className = 'cb-card-head';

  const badge = document.createElement('span');
  badge.className = `cb-card-badge cb-badge-${kind.kind}`;
  badge.textContent = labelOf(kind.kind);
  header.appendChild(badge);

  const date = document.createElement('time');
  date.className = 'cb-card-date';
  date.textContent = relativeTime(item.timestamp);
  date.dateTime = new Date(item.timestamp).toISOString();
  header.appendChild(date);

  const del = document.createElement('button');
  del.className = 'cb-card-delete';
  del.type = 'button';
  del.setAttribute('aria-label', '삭제');
  del.textContent = '×';
  del.onclick = (e) => {
    e.stopPropagation();
    cb.onDelete(item.id);
  };
  header.appendChild(del);

  root.appendChild(header);

  const body = renderBody(kind, item.text);
  body.classList.add('cb-card-body');
  root.appendChild(body);

  root.onclick = (e) => cb.onCopy(item, e);
  root.onkeydown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      cb.onCopy(item, e as unknown as MouseEvent);
    }
  };

  return root;
}

function renderBody(kind: ContentKind, raw: string): HTMLElement {
  switch (kind.kind) {
    case 'url':
      return renderUrl(kind.url);
    case 'email':
      return renderEmail(kind.address);
    case 'phone':
      return renderPhone(kind.number);
    case 'color':
      return renderColor(kind);
    case 'json':
      return renderJson(kind.pretty);
    case 'code':
      return renderCode(kind.lang, raw);
    case 'markdown':
      return renderMarkdown(raw);
    case 'plain':
      return renderPlain(raw);
  }
}

function renderUrl(url: string): HTMLElement {
  const wrap = document.createElement('div');
  let host = '';
  try {
    host = new URL(url).host;
  } catch {
    host = url;
  }
  const fav = document.createElement('img');
  fav.className = 'cb-favicon';
  fav.src = `https://www.google.com/s2/favicons?sz=32&domain=${host}`;
  fav.alt = '';
  fav.loading = 'lazy';
  wrap.appendChild(fav);

  const stack = document.createElement('div');
  stack.className = 'cb-card-stack';
  const hostLine = document.createElement('div');
  hostLine.className = 'cb-card-strong';
  hostLine.textContent = host;
  const pathLine = document.createElement('div');
  pathLine.className = 'cb-card-muted';
  pathLine.textContent = url;
  stack.appendChild(hostLine);
  stack.appendChild(pathLine);
  wrap.appendChild(stack);

  wrap.classList.add('cb-card-row');
  return wrap;
}

function renderEmail(addr: string): HTMLElement {
  const div = document.createElement('div');
  div.className = 'cb-card-row';
  const ico = document.createElement('span');
  ico.className = 'cb-card-glyph';
  ico.textContent = '📧';
  div.appendChild(ico);
  const link = document.createElement('a');
  link.href = `mailto:${addr}`;
  link.textContent = addr;
  link.className = 'cb-card-link';
  link.onclick = (e) => e.stopPropagation();
  div.appendChild(link);
  return div;
}

function renderPhone(num: string): HTMLElement {
  const div = document.createElement('div');
  div.className = 'cb-card-row';
  const ico = document.createElement('span');
  ico.className = 'cb-card-glyph';
  ico.textContent = '📞';
  div.appendChild(ico);
  const link = document.createElement('a');
  link.href = `tel:${num.replace(/\s+/g, '')}`;
  link.textContent = num;
  link.className = 'cb-card-link';
  link.onclick = (e) => e.stopPropagation();
  div.appendChild(link);
  return div;
}

function renderColor(
  c: Extract<ContentKind, { kind: 'color' }>,
): HTMLElement {
  const div = document.createElement('div');
  div.className = 'cb-card-row';
  const chip = document.createElement('span');
  chip.className = 'cb-color-chip';
  chip.style.background = c.css;
  div.appendChild(chip);
  const stack = document.createElement('div');
  stack.className = 'cb-card-stack';
  const css = document.createElement('div');
  css.className = 'cb-card-strong';
  css.textContent = c.css;
  const rgb = document.createElement('div');
  rgb.className = 'cb-card-muted';
  rgb.textContent = `rgb(${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b})${c.rgb.a < 1 ? ` · α ${c.rgb.a.toFixed(2)}` : ''}`;
  stack.appendChild(css);
  stack.appendChild(rgb);
  div.appendChild(stack);
  return div;
}

function renderJson(pretty: string): HTMLElement {
  const pre = document.createElement('pre');
  pre.className = 'cb-code cb-code-json';
  const code = document.createElement('code');
  code.textContent = truncateLines(pretty, 12);
  pre.appendChild(code);
  return pre;
}

function renderCode(lang: string, src: string): HTMLElement {
  const wrap = document.createElement('div');
  const langTag = document.createElement('span');
  langTag.className = 'cb-code-lang';
  langTag.textContent = lang;
  wrap.appendChild(langTag);

  const pre = document.createElement('pre');
  pre.className = `cb-code cb-code-${lang}`;
  const code = document.createElement('code');
  code.textContent = truncateLines(src, 10);
  pre.appendChild(code);
  wrap.appendChild(pre);
  return wrap;
}

function renderMarkdown(src: string): HTMLElement {
  const div = document.createElement('div');
  div.className = 'cb-md';
  div.textContent = truncateLines(src, 8);
  return div;
}

function renderPlain(text: string): HTMLElement {
  const div = document.createElement('div');
  div.className = 'cb-plain';
  div.textContent = text.length > 220 ? text.slice(0, 220) + '…' : text;
  return div;
}

function truncateLines(text: string, max: number): string {
  const lines = text.split('\n');
  if (lines.length <= max) return text;
  return lines.slice(0, max).join('\n') + `\n… (+${lines.length - max} lines)`;
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return '방금';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}분 전`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}시간 전`;
  if (diff < 604_800_000) return `${Math.floor(diff / 86_400_000)}일 전`;
  return new Date(ts).toLocaleDateString('ko-KR');
}
