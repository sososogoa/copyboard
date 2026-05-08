import { MAX_HISTORY_SIZE } from '@/shared/constants';
import type { HistoryItem } from '@/shared/types';
import { cleanText, newId } from './clean-text';
import { loadHistory, saveHistory } from './storage';

let cache: HistoryItem[] = [];
let backup: HistoryItem[] | null = null;
let initialized = false;

export async function ensureLoaded(): Promise<void> {
  if (initialized) return;
  cache = await loadHistory();
  initialized = true;
}

export function getAll(): HistoryItem[] {
  return cache;
}

export async function add(rawText: string, url?: string): Promise<boolean> {
  const text = cleanText(rawText);
  if (!text) return false;

  const dupIndex = cache.findIndex((it) => it.text === text);
  if (dupIndex === 0) return false;
  if (dupIndex > 0) {
    // promote duplicate to top instead of inserting again
    const [existing] = cache.splice(dupIndex, 1);
    if (existing) {
      existing.timestamp = Date.now();
      existing.dateString = new Date().toLocaleString('ko-KR');
      cache.unshift(existing);
      await persist();
      return true;
    }
  }

  const item: HistoryItem = {
    id: newId(),
    text,
    timestamp: Date.now(),
    dateString: new Date().toLocaleString('ko-KR'),
    size: text.length,
    ...(url ? { url } : {}),
  };
  cache.unshift(item);
  if (cache.length > MAX_HISTORY_SIZE) cache = cache.slice(0, MAX_HISTORY_SIZE);
  await persist();
  return true;
}

export async function remove(itemId: string): Promise<boolean> {
  const before = cache.length;
  cache = cache.filter((it) => it.id !== itemId);
  if (cache.length === before) return false;
  await persist();
  return true;
}

export async function clearAll(): Promise<void> {
  backup = [...cache];
  cache = [];
  await persist();
}

export async function restore(): Promise<boolean> {
  if (!backup || backup.length === 0) return false;
  cache = [...backup];
  backup = null;
  await persist();
  return true;
}

async function persist(): Promise<void> {
  await saveHistory(cache);
  await broadcast();
}

async function broadcast(): Promise<void> {
  try {
    const tabs = await chrome.tabs.query({});
    await Promise.all(
      tabs
        .filter((t) => typeof t.id === 'number')
        .map((t) =>
          chrome.tabs
            .sendMessage(t.id!, { action: 'historyUpdated', history: cache })
            .catch(() => undefined),
        ),
    );
  } catch {
    // ignore broadcast failures
  }
}
