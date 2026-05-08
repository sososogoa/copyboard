import type { HistoryItem } from './types';

export type RpcRequest =
  | { action: 'addToHistory'; text: string; url?: string }
  | { action: 'getHistory' }
  | { action: 'deleteHistoryItem'; itemId: string }
  | { action: 'clearHistory' }
  | { action: 'restoreHistory' }
  | { action: 'toggleFloating' }
  | { action: 'openSpotlight' }
  | { action: 'historyUpdated'; history: HistoryItem[] }
  | { action: 'showAutoSaveNotification' };

export type RpcResponse<R extends RpcRequest['action']> = {
  addToHistory: { success: boolean };
  getHistory: { history: HistoryItem[]; count: number };
  deleteHistoryItem: { success: boolean };
  clearHistory: { success: boolean };
  restoreHistory: { success: boolean };
  toggleFloating: { success: boolean };
  openSpotlight: { success: boolean };
  historyUpdated: { success: boolean };
  showAutoSaveNotification: { success: boolean };
}[R];

export function sendToBackground<A extends RpcRequest['action']>(
  request: Extract<RpcRequest, { action: A }>,
): Promise<RpcResponse<A>> {
  return new Promise((resolve, reject) => {
    try {
      chrome.runtime.sendMessage(request, (response: RpcResponse<A>) => {
        const err = chrome.runtime.lastError;
        if (err) {
          reject(new Error(err.message));
          return;
        }
        resolve(response);
      });
    } catch (e) {
      reject(e instanceof Error ? e : new Error(String(e)));
    }
  });
}

export function sendToTab<A extends RpcRequest['action']>(
  tabId: number,
  request: Extract<RpcRequest, { action: A }>,
): Promise<RpcResponse<A> | undefined> {
  return new Promise((resolve) => {
    try {
      chrome.tabs.sendMessage(tabId, request, (response: RpcResponse<A>) => {
        if (chrome.runtime.lastError) {
          resolve(undefined);
          return;
        }
        resolve(response);
      });
    } catch {
      resolve(undefined);
    }
  });
}
