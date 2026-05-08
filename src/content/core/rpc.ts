import { sendToBackground } from '@/shared/messages';
import type { HistoryItem } from '@/shared/types';

export async function fetchHistory(): Promise<HistoryItem[]> {
  const res = await sendToBackground({ action: 'getHistory' });
  return res.history;
}

export async function saveHistory(text: string, url?: string): Promise<boolean> {
  const res = await sendToBackground(
    url ? { action: 'addToHistory', text, url } : { action: 'addToHistory', text },
  );
  return res.success;
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
