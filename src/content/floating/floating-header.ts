import * as Rpc from '@/content/core/rpc';
import { showToast } from '@/content/core/toast';
import type { SitePolicyResponse } from '@/shared/messages';
import type { ThemeController } from '@/content/core/theme';
import type { CopyDetector } from '@/content/core/copy-detector';

export interface SitePillController {
  refresh: () => Promise<void>;
}

export interface HeaderRefs {
  el: HTMLElement;
  sitePill: SitePillController;
}

export interface HeaderDeps {
  detector: CopyDetector;
  theme: ThemeController;
  onClose: () => void;
}

export function buildHeader(deps: HeaderDeps): HeaderRefs {
  const header = document.createElement('header');
  header.className = 'cb-head';

  const title = document.createElement('h2');
  title.className = 'cb-title';
  title.textContent = 'CopyBoard';
  header.appendChild(title);

  const actions = document.createElement('div');
  actions.className = 'cb-head-actions';

  actions.appendChild(buildDetectPill(deps.detector));
  const sitePillRefs = buildSitePill();
  actions.appendChild(sitePillRefs.el);
  actions.appendChild(buildThemeButton(deps.theme));
  actions.appendChild(buildCloseButton(deps.onClose));

  header.appendChild(actions);
  return { el: header, sitePill: sitePillRefs.sitePill };
}

function buildDetectPill(detector: CopyDetector): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'cb-pill';
  const sync = () => {
    const on = detector.isEnabled();
    btn.classList.toggle('cb-pill-on', on);
    btn.classList.toggle('cb-pill-off', !on);
    btn.textContent = `자동 감지 ${on ? 'ON' : 'OFF'}`;
  };
  sync();
  btn.onclick = () => {
    detector.toggle();
    sync();
  };
  return btn;
}

interface SitePillRefs {
  el: HTMLButtonElement;
  sitePill: SitePillController;
}

function buildSitePill(): SitePillRefs {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'cb-pill';
  btn.textContent = '이 사이트 ...';

  let policy: SitePolicyResponse | null = null;

  const render = () => {
    if (!policy || !policy.domain) {
      btn.style.display = 'none';
      return;
    }
    btn.style.display = '';
    const allowed = !policy.blocked;
    btn.classList.toggle('cb-pill-on', allowed);
    btn.classList.toggle('cb-pill-off', !allowed);
    btn.textContent = `이 사이트 ${allowed ? 'ON' : 'OFF'}`;
    btn.title = policy.defaultBlocked
      ? `${policy.domain} (기본 정책으로 차단됨, 변경 불가)`
      : `${policy.domain} — 클릭하여 ${allowed ? '차단' : '허용'}`;
    btn.disabled = policy.defaultBlocked;
    btn.style.cursor = policy.defaultBlocked ? 'not-allowed' : 'pointer';
  };

  const refresh = async (): Promise<void> => {
    try {
      policy = await Rpc.getSitePolicy(location.href);
    } catch {
      policy = null;
    }
    render();
  };

  btn.onclick = () => {
    if (!policy || !policy.domain || policy.defaultBlocked) return;
    void (async () => {
      const next = !policy.blocked;
      try {
        policy = await Rpc.setSitePolicy(location.href, next);
      } catch {
        return;
      }
      render();
      showToast({
        variant: 'info',
        message: policy.blocked
          ? `${policy.domain} 자동 저장 차단`
          : `${policy.domain} 자동 저장 허용`,
        durationMs: 1800,
      });
    })();
  };

  return { el: btn, sitePill: { refresh } };
}

function buildThemeButton(theme: ThemeController): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'cb-icon-btn cb-theme-btn';
  btn.setAttribute('aria-label', '테마 전환');
  const sync = () => {
    btn.textContent = theme.current() ? '🌙' : '☀️';
  };
  sync();
  btn.onclick = () => {
    theme.toggle();
    sync();
  };
  return btn;
}

function buildCloseButton(onClose: () => void): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'cb-icon-btn cb-close-btn';
  btn.setAttribute('aria-label', '닫기');
  btn.textContent = '×';
  btn.onclick = onClose;
  return btn;
}
