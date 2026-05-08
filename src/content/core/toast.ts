/**
 * Lightweight toast layer: appends a fixed-position element with a CSS-driven
 * animation, then auto-removes it. Style classes live in content.css.
 *
 * Toasts mount inside the shadow root (alongside floating + spotlight) so they
 * inherit the same CSS scope and stacking context.
 */

import { ensureShadowRoot } from './host';

type ToastVariant = 'autosave' | 'copied' | 'undo' | 'restored' | 'info';

interface ShowOptions {
  variant: ToastVariant;
  message: string;
  durationMs?: number;
  action?: { label: string; onClick: () => void };
  anchorRect?: DOMRect | null;
}

const stack: HTMLElement[] = [];

export function showToast(opts: ShowOptions): HTMLElement {
  const el = document.createElement('div');
  el.className = `copyboard-toast cb-toast-${opts.variant}`;
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', 'polite');

  const icon = document.createElement('span');
  icon.className = 'cb-toast-icon';
  icon.textContent = iconFor(opts.variant);
  el.appendChild(icon);

  const text = document.createElement('span');
  text.className = 'cb-toast-text';
  text.textContent = opts.message;
  el.appendChild(text);

  if (opts.action) {
    const btn = document.createElement('button');
    btn.className = 'cb-toast-action';
    btn.type = 'button';
    btn.textContent = opts.action.label;
    btn.onclick = () => {
      opts.action!.onClick();
      dismiss(el);
    };
    el.appendChild(btn);
  }

  positionToast(el, opts.anchorRect ?? null);
  ensureShadowRoot().appendChild(el);
  stack.push(el);
  reflowStack();

  const duration = opts.durationMs ?? (opts.action ? 5000 : 1800);
  window.setTimeout(() => dismiss(el), duration);
  return el;
}

function dismiss(el: HTMLElement): void {
  const idx = stack.indexOf(el);
  if (idx >= 0) stack.splice(idx, 1);
  el.classList.add('cb-toast-leave');
  window.setTimeout(() => {
    if (el.parentNode) el.parentNode.removeChild(el);
    reflowStack();
  }, 240);
}

function positionToast(el: HTMLElement, anchor: DOMRect | null): void {
  el.style.position = 'fixed';
  el.style.right = '20px';
  el.style.top = anchor ? `${Math.max(20, anchor.bottom + 12)}px` : '20px';
  el.style.zIndex = '2147483646';
}

function reflowStack(): void {
  let offset = 0;
  for (const el of stack) {
    el.style.transform = `translateY(${offset}px)`;
    offset += el.getBoundingClientRect().height + 8;
  }
}

function iconFor(variant: ToastVariant): string {
  switch (variant) {
    case 'autosave':
      return '✨';
    case 'copied':
      return '✅';
    case 'undo':
      return '🗑️';
    case 'restored':
      return '↩️';
    case 'info':
      return 'ℹ️';
  }
}
