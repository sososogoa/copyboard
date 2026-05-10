/**
 * Pure domain-policy helpers. URL → domain extraction, exact + suffix match
 * against a blocked list. No chrome.* access — the background-side adapter
 * loads/persists the user's list and feeds it in.
 *
 * Match semantics:
 *   pattern 'example.com' matches 'example.com' AND any subdomain
 *   ('www.example.com', 'a.b.example.com'). It does NOT match 'notexample.com'
 *   (no leading-dot trick).
 */

const DEFAULT_BLOCKED: ReadonlyArray<string> = ['localhost', '127.0.0.1'];

export function defaultBlockedDomains(): ReadonlyArray<string> {
  return DEFAULT_BLOCKED;
}

export function extractDomain(url: string | undefined | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function isSiteBlocked(
  url: string | undefined | null,
  blocked: ReadonlyArray<string>,
): boolean {
  const domain = extractDomain(url);
  if (!domain) return false;
  return blocked.some((b) => domainMatches(domain, b.toLowerCase()));
}

export function isDefaultBlocked(url: string | undefined | null): boolean {
  return isSiteBlocked(url, DEFAULT_BLOCKED);
}

function domainMatches(domain: string, pattern: string): boolean {
  if (!pattern) return false;
  if (pattern === domain) return true;
  return domain.endsWith('.' + pattern);
}
