import { describe, expect, it } from 'vitest';
import { extractDomain, isDefaultBlocked, isSiteBlocked } from './site-policy';

describe('extractDomain', () => {
  it.each<[string | undefined | null, string | null]>([
    ['https://www.example.com/path', 'www.example.com'],
    ['HTTP://Foo.COM/', 'foo.com'],
    ['https://example.com:8080/x?y=1', 'example.com'],
    ['ftp://x.y/z', 'x.y'],
    [undefined, null],
    [null, null],
    ['', null],
    ['not a url', null],
  ])('extractDomain(%j) === %j', (url, expected) => {
    expect(extractDomain(url)).toBe(expected);
  });
});

describe('isSiteBlocked', () => {
  it.each<[string | undefined, string[], boolean]>([
    // exact match
    ['https://example.com/', ['example.com'], true],
    // subdomain match
    ['https://www.example.com/', ['example.com'], true],
    ['https://a.b.example.com/', ['example.com'], true],
    // not a real subdomain (would be pattern injection)
    ['https://notexample.com/', ['example.com'], false],
    // unrelated domain
    ['https://foo.com/', ['example.com'], false],
    // localhost / 127.0.0.1 via defaults
    ['https://localhost:3000/', ['localhost'], true],
    ['http://127.0.0.1/x', ['127.0.0.1'], true],
    // empty list — never blocks
    ['https://example.com/', [], false],
    // bad inputs
    [undefined, ['example.com'], false],
    ['not a url', ['example.com'], false],
  ])('isSiteBlocked(%j, %j) === %j', (url, blocked, expected) => {
    expect(isSiteBlocked(url, blocked)).toBe(expected);
  });
});

describe('isDefaultBlocked', () => {
  it.each<[string, boolean]>([
    ['http://localhost:3000/', true],
    ['http://127.0.0.1/', true],
    ['https://example.com/', false],
  ])('isDefaultBlocked(%j) === %j', (url, expected) => {
    expect(isDefaultBlocked(url)).toBe(expected);
  });
});
