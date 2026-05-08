import type { RpcRequest } from '@/shared/messages';
import { CopyDetector } from './core/copy-detector';
import { ensureShadowRoot } from './core/host';
import { ThemeController } from './core/theme';
import { showToast } from './core/toast';
import * as Rpc from './core/rpc';
import { FloatingUI } from './floating/floating-ui';
import { Spotlight } from './spotlight/spotlight';

// Mount the host + inject CSS once, before any UI surface tries to attach.
ensureShadowRoot();

const detector = new CopyDetector();
const theme = new ThemeController();
const floating = new FloatingUI({ detector, theme });
const spotlight = new Spotlight({ theme });

void theme.init();

detector.setListener((text) => {
  void Rpc.saveHistory(text, location.href).then((ok) => {
    if (ok) {
      showToast({ variant: 'autosave', message: '저장됨' });
    }
  });
});
detector.start();

chrome.runtime.onMessage.addListener((req: RpcRequest, _sender, sendResponse) => {
  switch (req.action) {
    case 'toggleFloating':
      floating.toggle();
      sendResponse({ success: true });
      break;
    case 'openSpotlight':
      spotlight.toggle();
      sendResponse({ success: true });
      break;
    case 'historyUpdated':
      floating.receiveHistory(req.history);
      sendResponse({ success: true });
      break;
    case 'showAutoSaveNotification':
      showToast({ variant: 'autosave', message: '저장됨' });
      sendResponse({ success: true });
      break;
    default:
      sendResponse({ success: false });
  }
  return true;
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && spotlight.isOpen()) {
    spotlight.close();
  }
});
