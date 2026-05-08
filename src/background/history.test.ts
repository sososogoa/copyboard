/**
 * Integration tests for the history module's stateful behavior.
 *
 * The module holds an in-memory cache as module state, so each test resets the
 * module via `vi.resetModules()` and re-imports a fresh instance. The chrome.*
 * stub from test-setup.ts provides an in-memory chrome.storage.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MAX_HISTORY_SIZE } from '@/shared/constants';

type HistoryModule = typeof import('./history');

async function freshHistory(): Promise<HistoryModule> {
  vi.resetModules();
  const mod = await import('./history');
  await mod.ensureLoaded();
  return mod;
}

beforeEach(() => {
  // The chrome.storage stub from test-setup retains its in-memory store across
  // imports. Each test wants a clean slate, so we replace the get/set
  // implementations with no-op equivalents that always read empty.
  const c = (globalThis as unknown as {
    chrome: {
      storage: {
        local: {
          get: ReturnType<typeof vi.fn>;
          set: ReturnType<typeof vi.fn>;
        };
      };
    };
  }).chrome;
  c.storage.local.get.mockImplementation(() => Promise.resolve({}));
  c.storage.local.set.mockImplementation(() => Promise.resolve());
});

describe('history.add', () => {
  it('유효한 텍스트를 캐시에 추가', async () => {
    const h = await freshHistory();
    const ok = await h.add('first item');
    expect(ok).toBe(true);
    expect(h.getAll()).toHaveLength(1);
    expect(h.getAll()[0]?.text).toBe('first item');
  });

  it('너무 짧은 텍스트는 거절', async () => {
    const h = await freshHistory();
    expect(await h.add('ab')).toBe(false);
    expect(h.getAll()).toHaveLength(0);
  });

  it('이미 맨 위에 있는 동일 텍스트는 추가하지 않음 (no-op)', async () => {
    const h = await freshHistory();
    await h.add('same');
    const lenBefore = h.getAll().length;
    const ok = await h.add('same');
    expect(ok).toBe(false);
    expect(h.getAll()).toHaveLength(lenBefore);
  });

  it('하위 위치의 중복은 맨 위로 promote', async () => {
    const h = await freshHistory();
    await h.add('first');
    await h.add('second');
    await h.add('third');
    expect(h.getAll().map((i) => i.text)).toEqual(['third', 'second', 'first']);

    const ok = await h.add('first');
    expect(ok).toBe(true);
    expect(h.getAll().map((i) => i.text)).toEqual(['first', 'third', 'second']);
    expect(h.getAll()).toHaveLength(3);
  });

  it(`${MAX_HISTORY_SIZE} 개를 초과하면 가장 오래된 항목 잘림`, async () => {
    const h = await freshHistory();
    for (let i = 0; i < MAX_HISTORY_SIZE + 5; i++) {
      await h.add(`item ${i.toString().padStart(3, '0')}`);
    }
    expect(h.getAll()).toHaveLength(MAX_HISTORY_SIZE);
    expect(h.getAll()[0]?.text).toContain(`item ${(MAX_HISTORY_SIZE + 4).toString().padStart(3, '0')}`);
  });

  it('url 옵션이 보존된다', async () => {
    const h = await freshHistory();
    await h.add('with-url', 'https://example.com/page');
    expect(h.getAll()[0]?.url).toBe('https://example.com/page');
  });
});

describe('history.remove', () => {
  it('id 로 삭제', async () => {
    const h = await freshHistory();
    await h.add('to be removed');
    const id = h.getAll()[0]!.id;
    const ok = await h.remove(id);
    expect(ok).toBe(true);
    expect(h.getAll()).toHaveLength(0);
  });

  it('존재하지 않는 id 는 false', async () => {
    const h = await freshHistory();
    expect(await h.remove('nonexistent')).toBe(false);
  });
});

describe('history.clearAll + restore', () => {
  it('clearAll 후 restore 로 복원', async () => {
    const h = await freshHistory();
    await h.add('one');
    await h.add('two');
    await h.add('three');
    expect(h.getAll()).toHaveLength(3);

    await h.clearAll();
    expect(h.getAll()).toHaveLength(0);

    const restored = await h.restore();
    expect(restored).toBe(true);
    expect(h.getAll()).toHaveLength(3);
    expect(h.getAll().map((i) => i.text)).toEqual(['three', 'two', 'one']);
  });

  it('백업 없는 상태에서 restore 는 false', async () => {
    const h = await freshHistory();
    expect(await h.restore()).toBe(false);
  });

  it('restore 는 한 번만 가능 (백업 소진)', async () => {
    const h = await freshHistory();
    await h.add('only');
    await h.clearAll();
    expect(await h.restore()).toBe(true);
    expect(await h.restore()).toBe(false);
  });
});
