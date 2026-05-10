import type { AddToHistoryResponse, RpcRequest } from '@/shared/messages';
import { detectSensitive } from '@/shared/sensitive';
import * as History from './history';
import * as SitePolicy from './site-policy';

const CTX_SAVE = 'copyboard-save-text';
const CTX_SAVE_LINK = 'copyboard-save-link';
const CTX_SAVE_MEDIA = 'copyboard-save-media';
const CTX_TOGGLE = 'copyboard-toggle-floating';
const CTX_SPOTLIGHT = 'copyboard-spotlight';

void History.ensureLoaded();

chrome.runtime.onMessage.addListener((request: RpcRequest, _sender, sendResponse) => {
  void handle(request).then(sendResponse).catch((err) => {
    console.error('CopyBoard: rpc error', err);
    sendResponse({ success: false });
  });
  return true; // async response
});

async function handle(req: RpcRequest): Promise<unknown> {
  await History.ensureLoaded();
  switch (req.action) {
    case 'addToHistory':
      return await addGated(req.text, req.url);
    case 'getHistory': {
      const history = History.getAll();
      return { history, count: history.length };
    }
    case 'deleteHistoryItem':
      return { success: await History.remove(req.itemId) };
    case 'clearHistory':
      await History.clearAll();
      return { success: true };
    case 'restoreHistory':
      return { success: await History.restore() };
    case 'getSitePolicy':
      return await SitePolicy.describeSite(req.url);
    case 'setSitePolicy': {
      await SitePolicy.setSiteBlocked(req.url, req.blocked);
      return await SitePolicy.describeSite(req.url);
    }
    default:
      return { success: false };
  }
}

async function addGated(text: string, url?: string): Promise<AddToHistoryResponse> {
  const sensitive = detectSensitive(text);
  if (sensitive) {
    return { success: false, rejectedReason: 'sensitive', sensitiveKind: sensitive };
  }
  if (url && (await SitePolicy.isSiteBlocked(url))) {
    return { success: false, rejectedReason: 'blocked' };
  }
  const ok = await History.add(text, url);
  return ok ? { success: true } : { success: false };
}

chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle-floating') {
    await sendToActiveTab({ action: 'toggleFloating' });
  } else if (command === 'open-spotlight') {
    await sendToActiveTab({ action: 'openSpotlight' });
  }
});

chrome.action.onClicked.addListener(async () => {
  await sendToActiveTab({ action: 'toggleFloating' });
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: CTX_SAVE,
      title: '📋 CopyBoard에 저장',
      contexts: ['selection'],
    });
    chrome.contextMenus.create({
      id: CTX_SAVE_LINK,
      title: '📋 링크 주소를 CopyBoard에 저장',
      contexts: ['link'],
    });
    chrome.contextMenus.create({
      id: CTX_SAVE_MEDIA,
      title: '📋 미디어 주소를 CopyBoard에 저장',
      contexts: ['image', 'video', 'audio'],
    });
    chrome.contextMenus.create({
      id: CTX_TOGGLE,
      title: '📋 CopyBoard 플로팅 모드',
      contexts: ['page'],
    });
    chrome.contextMenus.create({
      id: CTX_SPOTLIGHT,
      title: '⚡ CopyBoard Spotlight',
      contexts: ['page'],
    });
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const target = pickContextTarget(info);
  if (target && tab?.id) {
    await History.ensureLoaded();
    const result = await addGated(target, tab.url);
    if (result.success) {
      await chrome.tabs
        .sendMessage(tab.id, { action: 'showAutoSaveNotification' })
        .catch(() => undefined);
    }
  } else if (info.menuItemId === CTX_TOGGLE) {
    await sendToActiveTab({ action: 'toggleFloating' });
  } else if (info.menuItemId === CTX_SPOTLIGHT) {
    await sendToActiveTab({ action: 'openSpotlight' });
  }
});

function pickContextTarget(info: chrome.contextMenus.OnClickData): string | null {
  if (info.menuItemId === CTX_SAVE && info.selectionText) return info.selectionText;
  if (info.menuItemId === CTX_SAVE_LINK && info.linkUrl) return info.linkUrl;
  if (info.menuItemId === CTX_SAVE_MEDIA && info.srcUrl) return info.srcUrl;
  return null;
}

async function sendToActiveTab(message: RpcRequest): Promise<void> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;
    await chrome.tabs.sendMessage(tab.id, message).catch(() => undefined);
  } catch (err) {
    console.warn('CopyBoard: cannot reach active tab', err);
  }
}
