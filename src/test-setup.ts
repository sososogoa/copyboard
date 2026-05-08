/**
 * Test setup: provides minimal stubs for chrome.* APIs that some background
 * modules read at import time. Tests should not exercise chrome.* end-to-end —
 * we only stub enough so import-time access doesn't throw.
 */
import { vi } from 'vitest';

interface ChromeStorageArea {
  get: ReturnType<typeof vi.fn>;
  set: ReturnType<typeof vi.fn>;
}

interface ChromeStub {
  storage: { local: ChromeStorageArea; sync: ChromeStorageArea };
  tabs: { query: ReturnType<typeof vi.fn>; sendMessage: ReturnType<typeof vi.fn> };
  runtime: {
    sendMessage: ReturnType<typeof vi.fn>;
    onMessage: { addListener: ReturnType<typeof vi.fn> };
    lastError: undefined;
  };
}

const makeStorageArea = (): ChromeStorageArea => {
  const store: Record<string, unknown> = {};
  return {
    get: vi.fn((keys: string | string[]) => {
      const normalized = Array.isArray(keys) ? keys : [keys];
      const out: Record<string, unknown> = {};
      for (const key of normalized) {
        if (key in store) out[key] = store[key];
      }
      return Promise.resolve(out);
    }),
    set: vi.fn((entries: Record<string, unknown>) => {
      Object.assign(store, entries);
      return Promise.resolve();
    }),
  };
};

const stub: ChromeStub = {
  storage: { local: makeStorageArea(), sync: makeStorageArea() },
  tabs: {
    query: vi.fn(() => Promise.resolve([])),
    sendMessage: vi.fn(() => Promise.resolve(undefined)),
  },
  runtime: {
    sendMessage: vi.fn(() => Promise.resolve(undefined)),
    onMessage: { addListener: vi.fn() },
    lastError: undefined,
  },
};

(globalThis as unknown as { chrome: ChromeStub }).chrome = stub;
