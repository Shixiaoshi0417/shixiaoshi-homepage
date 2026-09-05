import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const base = process.env.SITE_URL || 'http://127.0.0.1:8787';
const requiredHeaders = ['content-security-policy', 'x-content-type-options', 'referrer-policy', 'permissions-policy', 'x-frame-options'];
for (const [path, status, type] of [
  ['/', 200, 'text/html'],
  ['/assets/styles.css', 200, 'text/css'],
  ['/assets/favicon.svg', 200, 'image/svg+xml'],
  ['/robots.txt', 200, 'text/plain'],
  ['/sitemap.xml', 200, 'xml'],
  ['/missing-page', 404, 'text/html'],
  ['/nested/missing-page', 404, 'text/html'],
  ['/assets/missing.css', 404, 'text/html'],
]) {
  test(`${path}: status, type, security headers`, async () => {
    const response = await fetch(new URL(path, base));
    assert.equal(response.status, status);
    assert.ok(response.headers.get('content-type')?.includes(type));
    for (const name of requiredHeaders) assert.ok(response.headers.get(name), `${path}: missing ${name}`);
    const body = await response.text();
    if (status === 404) assert.match(body, /返回主页/);
  });
}
test('homepage links, metadata and all referenced local assets', async () => {
  const html = await (await fetch(base)).text();
  assert.match(html, /lang="zh-CN"/);
  assert.match(html, /mailto:shixiaoshi@shixiaoshi0417.com/);
  assert.match(html, /rel="canonical" href="https:\/\/shixiaoshi0417.com\/"/);
  assert.match(html, /name="viewport"/);
  assert.match(html, /property="og:title"/);
  assert.match(html, /name="twitter:card"/);
  assert.doesNotMatch(html, /<script\b/i);
  for (const tag of html.matchAll(/<a\b[^>]+>/g)) {
    if (tag[0].includes('target="_blank"')) assert.match(tag[0], /rel="noopener noreferrer"/);
  }
  for (const [, path] of html.matchAll(/href="(\/assets\/[^\"]+)"/g)) {
    assert.equal((await fetch(new URL(path, base))).status, 200, path);
  }
  for (const [, id] of html.matchAll(/href="#([^\"]+)"/g)) assert.ok(html.includes(`id="${id}"`));
});
test('HEAD response and asset cache policy', async () => {
  const response = await fetch(base, { method: 'HEAD' });
  assert.equal(response.status, 200);
  assert.equal(await response.text(), '');
  const css = await fetch(new URL('/assets/styles.css', base));
  assert.match(css.headers.get('cache-control'), /max-age=86400/);
});
test('deployment config has no domain routes or account credentials', async () => {
  const config = JSON.parse(await readFile(new URL('../wrangler.jsonc', import.meta.url), 'utf8'));
  assert.equal(config.name, 'shixiaoshi-homepage');
  assert.equal(config.workers_dev, true);
  assert.equal(config.routes, undefined);
  assert.equal(config.route, undefined);
  assert.equal(config.account_id, undefined);
});
