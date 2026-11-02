import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
const loader = html.match(/<script id="production-analytics">([\s\S]*?)<\/script>/)?.[1];

function runLoader(hostname, pathname = '/') {
  const scripts = [];
  const window = { location: { hostname, pathname } };
  const document = {
    createElement: tagName => ({ tagName }),
    head: { appendChild: script => scripts.push(script) },
  };
  assert.ok(loader, 'Production loader is present in the served HTML template');
  runInNewContext(loader, { window, document });
  return { window, scripts };
}

test('public production hosts retain the Google tag configuration and event queue', () => {
  for (const hostname of ['pahwajee.in', 'www.pahwajee.in']) {
    const { window, scripts } = runLoader(hostname, '/gifting');
    assert.equal(scripts.length, 1);
    assert.equal(scripts[0].tagName, 'script');
    assert.equal(scripts[0].async, true);
    assert.equal(scripts[0].src, 'https://www.googletagmanager.com/gtag/js?id=G-KT1V9V0JZT');
    assert.deepEqual(Array.from(window.dataLayer[1]), ['config', 'G-KT1V9V0JZT']);
    window.gtag('event', 'generate_lead', { lead_type: 'contact', page_path: '/contact' });
    assert.equal(window.dataLayer.length, 3);
    assert.equal(window.dataLayer[2][1], 'generate_lead');
  }
});

test('local, preview and lookalike hosts never load or queue production GA', () => {
  assert.doesNotMatch(html, /<script\b[^>]*src=["'][^"']*googletagmanager\.com/i, 'No unconditional Google tag bypasses the host guard');
  for (const hostname of ['localhost', '127.0.0.1', '[::1]', 'pahwajee.vercel.app', 'pahwajee-git-preview.vercel.app', 'staging.pahwajee.in', 'pahwajee.in.example.com', '']) {
    const { window, scripts } = runLoader(hostname);
    assert.deepEqual(scripts, []);
    assert.equal(window.gtag, undefined);
    assert.equal(window.dataLayer, undefined);
  }
});

test('direct admin visits are excluded, while public paths still load the tag', () => {
  for (const pathname of ['/admin', '/admin/', '/admin/products', '/ADMIN/login', '/%61dmin/orders']) {
    const { window, scripts } = runLoader('pahwajee.in', pathname);
    assert.deepEqual(scripts, []);
    assert.equal(window.gtag, undefined);
  }
  assert.equal(runLoader('pahwajee.in', '/products').scripts.length, 1);
});
