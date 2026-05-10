import { sendToBackground } from '@/shared/messages';
import type { AddToHistoryResponse, SitePolicyResponse } from '@/shared/messages';
import type { HistoryItem } from '@/shared/types';

export async function fetchHistory(): Promise<HistoryItem[]> {
  const res = await sendToBackground({ action: 'getHistory' });
  return res.history;
}

export async function saveHistory(text: string, url?: string): Promise<AddToHistoryResponse> {
  return await sendToBackground(
    url ? { action: 'addToHistory', text, url } : { action: 'addToHistory', text },
  );
}

export async function deleteItem(itemId: string): Promise<boolean> {
  const res = await sendToBackground({ action: 'deleteHistoryItem', itemId });
  return res.success;
}

export async function clearAll(): Promise<boolean> {
  const res = await sendToBackground({ action: 'clearHistory' });
  return res.success;
}

export async function restore(): Promise<boolean> {
  const res = await sendToBackground({ action: 'restoreHistory' });
  return res.success;
}

export async function getSitePolicy(url: string): Promise<SitePolicyResponse> {
  return await sendToBackground({ action: 'getSitePolicy', url });
}

export async function setSitePolicy(url: string, blocked: boolean): Promise<SitePolicyResponse> {
  return await sendToBackground({ action: 'setSitePolicy', url, blocked });
}
