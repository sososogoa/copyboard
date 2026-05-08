/**
 * Shadow DOM host: a single fixed-position div mounted on document.body, with
 * an open shadow root that all CopyBoard UI surfaces (floating panel, spotlight,
 * toasts) attach into. The shadow root receives our CSS as a one-time inline
 * <style> injection, so the host page's stylesheet cannot affect us and ours
 * cannot leak out.
 *
 * The host element itself stays a 0×0 anchor with `pointer-events: none` —
 * children with `position: fixed` lay out against the viewport (the host has no
 * containing-block-creating properties), and individual surfaces opt into
 * pointer events via their own CSS classes.
 *
 * Singleton on purpose: every CopyBoard surface should mount into the same
 * shadow root so styles and IDs share a scope.
 */

import cssText from '../content.css?inline';

const HOST_ID = 'copyboard-host';

let cachedRoot: ShadowRoot | null = null;

export function ensureShadowRoot(): ShadowRoot {
  if (cachedRoot) return cachedRoot;

  const existing = document.getElementById(HOST_ID);
  if (existing && existing.shadowRoot) {
    cachedRoot = existing.shadowRoot;
    return cachedRoot;
  }

  const host = document.createElement('div');
  host.id = HOST_ID;
  // Avoid touching anything that creates a containing block (transform, filter,
  // contain, perspective). `position: fixed` on the host plus 0×0 size keeps it
  // a transparent anchor; child `position: fixed` elements still resolve
  // against the viewport.
  host.style.cssText = [
    'position: fixed',
    'top: 0',
    'left: 0',
    'width: 0',
    'height: 0',
    'margin: 0',
    'padding: 0',
    'border: 0',
    'z-index: 2147483647',
    'pointer-events: none',
  ].join(';');

  const root = host.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = cssText;
  root.appendChild(style);

  document.body.appendChild(host);
  cachedRoot = root;
  return root;
}

export function getShadowRoot(): ShadowRoot | null {
  return cachedRoot;
}

/**
 * Removes the entire host. Used only when the content script context is being
 * torn down (e.g. the page is unloading). Not part of the normal close flow.
 */
export function destroyShadowRoot(): void {
  if (!cachedRoot) return;
  const host = document.getElementById(HOST_ID);
  host?.parentNode?.removeChild(host);
  cachedRoot = null;
}
