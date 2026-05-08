export interface HistoryItem {
  id: string;
  text: string;
  timestamp: number;
  dateString: string;
  size: number;
  url?: string;
}

/**
 * Legacy v1 items as they appear in chrome.storage. Fields are loosely typed
 * because v1 used a different (and inconsistent) shape — `size` could be
 * missing, and `text` could be empty if the entry was compressed-only. The
 * migration path in `legacy-decompress.ts` is the only place this type is
 * consumed; new code should never write items in this shape.
 */
export interface LegacyHistoryItem {
  id: string;
  text: string;
  timestamp: number;
  dateString: string;
  size?: number;
  url?: string;
  compressed?: boolean;
  data?: string;
  originalLength?: number;
}
