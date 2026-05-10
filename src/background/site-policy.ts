/**
 * Background-side adapter for the site-blocking policy. Holds an in-memory
 * cache of the user's user-added blocked domains, persists to
 * chrome.storage.local, and combines with the hard-coded defaults from
 * shared/site-policy when answering "is this URL blocked?".
 *
 * The defaults (localhost, 127.0.0.1) cannot be removed by the user — they
 * are an anti-leak floor for dev environments. Power users who need their
 * localhost URLs in clipboard history can fork.
 */

import { STORAGE_KEY_BLOCKED_DOMAINS } from '@/shared/constants';
import {
  defaultBlockedDomains,
  extractDomain,
  isDefaultBlocked,
  isSiteBlocked as isSiteBlockedPure,
} from '@/shared/site-policy';

let cache: string[] | null = null;

async function load(): Promise<string[]> {
  if (cache) return cache;
  try {
    const result = (await chrome.storage.local.get(STORAGE_KEY_BLOCKED_DOMAINS)) as Record<
      string,
      unknown
    >;
    const stored = result[STORAGE_KEY_BLOCKED_DOMAINS];
    cache = Array.isArray(stored) ? (stored as string[]) : [];
  } catch {
    cache = [];
  }
  return cache;
}

export async function isSiteBlocked(url: string | undefined | null): Promise<boolean> {
  const user = await load();
  return isSiteBlockedPure(url, [...defaultBlockedDomains(), ...user]);
}

export interface SitePolicyView {
  domain: string | null;
  blocked: boolean;
  defaultBlocked: boolean;
}

export async function describeSite(url: string | undefined | null): Promise<SitePolicyView> {
  const domain = extractDomain(url);
  const defaultBlocked = isDefaultBlocked(url);
  const blocked = await isSiteBlocked(url);
  return { domain, blocked, defaultBlocked };
}

/**
 * Adds or removes the URL's domain from the user-managed block list.
 * Returns true if the underlying list changed. Default-blocked sites cannot
 * be unblocked (returns false in that case).
 */
export async function setSiteBlocked(
  url: string | undefined | null,
  blocked: boolean,
): Promise<boolean> {
  const domain = extractDomain(url);
  if (!domain) return false;
  // Cannot un-block a default-blocked site via the user list.
  if (!blocked && isDefaultBlocked(url)) return false;

  const user = await load();
  const has = user.includes(domain);
  let next = user;
  if (blocked && !has) next = [...user, domain];
  else if (!blocked && has) next = user.filter((d) => d !== domain);
  else return false;

  cache = next;
  await chrome.storage.local.set({ [STORAGE_KEY_BLOCKED_DOMAINS]: next });
  return true;
}
