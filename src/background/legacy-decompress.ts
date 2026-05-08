/**
 * Decompresses items written by the v1 LZ scheme. Used only on read for backwards
 * compatibility — new writes store plain text.
 */
import type { HistoryItem, LegacyHistoryItem } from '@/shared/types';

function lzDecompress(compressed: string): string {
  const data = JSON.parse(compressed) as number[];
  const dict: Record<number, string> = {};
  let dictSize = 256;
  const first = data[0];
  if (first === undefined) return '';
  let w = String.fromCharCode(first);
  let result = w;

  for (let i = 1; i < data.length; i++) {
    const k = data[i]!;
    let entry: string;
    if (dict[k] !== undefined) entry = dict[k]!;
    else if (k === dictSize) entry = w + w.charAt(0);
    else throw new Error('decompress error');

    result += entry;
    dict[dictSize++] = w + entry.charAt(0);
    w = entry;
  }
  return result;
}

export function migrateLegacyItem(item: LegacyHistoryItem): HistoryItem {
  if (item.compressed && item.data) {
    try {
      const text = lzDecompress(item.data);
      return {
        id: item.id,
        text,
        timestamp: item.timestamp,
        dateString: item.dateString,
        size: text.length,
        ...(item.url ? { url: item.url } : {}),
      };
    } catch {
      // fall through to plain text
    }
  }
  return {
    id: item.id,
    text: item.text,
    timestamp: item.timestamp,
    dateString: item.dateString,
    size: item.size ?? item.text.length,
    ...(item.url ? { url: item.url } : {}),
  };
}
