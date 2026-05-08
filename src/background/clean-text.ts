/**
 * Pure helpers for normalizing and stamping clipboard items. No side effects,
 * no chrome.* access — easy to unit test, safe to call from anywhere.
 */
import { MAX_TEXT_LENGTH, MIN_TEXT_LENGTH } from '@/shared/constants';

const TRUNCATION_SUFFIX = '... (잘림)';

/**
 * Validates and normalizes a raw clipboard string.
 * Returns null if the input is not usable as a history entry.
 *
 * - Trims whitespace.
 * - Caps at MAX_TEXT_LENGTH, appending a marker so users see the truncation.
 * - Rejects strings shorter than MIN_TEXT_LENGTH after trimming.
 */
export function cleanText(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  let text = input;
  if (text.length > MAX_TEXT_LENGTH) {
    text = text.slice(0, MAX_TEXT_LENGTH) + TRUNCATION_SUFFIX;
  }
  text = text.trim();
  if (text.length < MIN_TEXT_LENGTH) return null;
  return text;
}

/**
 * Generates a collision-resistant identifier. Combines the current timestamp
 * (sortable, debuggable) with a random tail for uniqueness within the same ms.
 */
export function newId(now: number = Date.now(), random: number = Math.random()): string {
  return now.toString(36) + random.toString(36).slice(2, 11);
}
