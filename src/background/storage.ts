import { STORAGE_KEY } from '@/shared/constants';
import type { HistoryItem, LegacyHistoryItem } from '@/shared/types';
import { migrateLegacyItem } from './legacy-decompress';

export async function loadHistory(): Promise<HistoryItem[]> {
  try {
    const result = (await chrome.storage.local.get([STORAGE_KEY])) as {
      [STORAGE_KEY]?: LegacyHistoryItem[];
    };
    const raw = result[STORAGE_KEY] ?? [];
    return raw.map(migrateLegacyItem);
  } catch (err) {
    console.error('CopyBoard: load failed', err);
    return [];
  }
}

export async function saveHistory(items: HistoryItem[]): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: items });
}
