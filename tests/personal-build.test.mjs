import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../dist/${path}`, import.meta.url), 'utf8');

test('only maintained project posts are generated', async () => {
  assert.deepEqual((await readdir(new URL('../dist/posts/', import.meta.url))).sort(), ['lunexsu', 'nekokem']);
  for (const path of ['index.html', 'projects/index.html', 'about/index.html', 'rss.xml', 'sitemap-0.xml']) {
    const html = await read(path);
    assert.doesNotMatch(html, /Corax|AcgExample|EncryptedExample|markdown-syntax-guide/);
  }
});

test('identity, artwork and links are local and correct', async () => {
  const home = await read('index.html');
  assert.match(home, /石小石/);
  assert.match(home, /代码、日常，还有一些新想法/);
  assert.match(home, /zhuang-fangyi-rain/);
  assert.match(home, /github-avatar/);
  const projects = await read('projects/index.html');
  for (const repo of ['LunexSU', 'NekoKEM']) assert.ok(projects.includes(`https://github.com/Shixiaoshi0417/${repo}`));
  assert.doesNotMatch(home, /https:\/\/(api\.iconify\.design|fonts\.googleapis\.com|fonts\.gstatic\.com|www\.googletagmanager\.com)/);
});

test('review builds remain noindex', async () => {
  assert.match(await read('_headers'), /X-Robots-Tag: noindex, nofollow/);
  assert.match(await read('robots.txt'), /Disallow:\s*\//);
});
