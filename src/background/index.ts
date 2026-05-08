import type { RpcRequest } from '@/shared/messages';
import * as History from './history';

const CTX_SAVE = 'copyboard-save-text';
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
      return { success: await History.add(req.text, req.url) };
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
    default:
      return { success: false };
  }
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
  if (info.menuItemId === CTX_SAVE && info.selectionText && tab?.id) {
    await History.ensureLoaded();
    await History.add(info.selectionText, tab.url);
    await chrome.tabs
      .sendMessage(tab.id, { action: 'showAutoSaveNotification' })
      .catch(() => undefined);
  } else if (info.menuItemId === CTX_TOGGLE) {
    await sendToActiveTab({ action: 'toggleFloating' });
  } else if (info.menuItemId === CTX_SPOTLIGHT) {
    await sendToActiveTab({ action: 'openSpotlight' });
  }
});

async function sendToActiveTab(message: RpcRequest): Promise<void> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;
    await chrome.tabs.sendMessage(tab.id, message).catch(() => undefined);
  } catch (err) {
    console.warn('CopyBoard: cannot reach active tab', err);
  }
}
