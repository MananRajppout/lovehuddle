#!/usr/bin/env node
// =================================================================
// LoveHuddle — sitemap generator
// Fetches published posts from Supabase and writes:
//   - public/sitemap.xml   (source used by `vite build`)
//   - dist/sitemap.xml     (so post-build runs also overwrite output)
// Run:
//   node scripts/generate-sitemap.mjs
//   npm run build      (build script chains this automatically)
// =================================================================

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SITE_URL = process.env.SITE_URL || 'https://lovehuddle.co.uk';
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://fvkbtvzqvqayzncibjic.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2a2J0dnpxdnFheXpuY2liamljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMjI3MDQsImV4cCI6MjA4ODY5ODcwNH0.gdx_nDwowR6Q3tJvYb8vFuImH3ifjiOV0B8JnV7SRlQ';

const STATIC_PAGES = [
  { path: '/',         changefreq: 'weekly',  priority: '1.0' },
  { path: '/blog',     changefreq: 'weekly',  priority: '0.9' },
  { path: '/safety',   changefreq: 'monthly', priority: '0.7' },
  { path: '/contact',  changefreq: 'monthly', priority: '0.5' },
  { path: '/privacy',  changefreq: 'yearly',  priority: '0.3' },
  { path: '/terms',    changefreq: 'yearly',  priority: '0.3' },
  { path: '/cookies',  changefreq: 'yearly',  priority: '0.3' },
];

function slugify(text = '') {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function xmlEscape(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function fetchPosts() {
  const url = `${SUPABASE_URL}/rest/v1/blog_posts?select=slug,title,updated_at,published&order=created_at.desc`;
  try {
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    if (!res.ok) {
      console.warn(`[sitemap] Supabase fetch failed (${res.status}). Continuing with static pages only.`);
      return [];
    }
    const data = await res.json();
    return (Array.isArray(data) ? data : []).filter(p => p && p.published !== false);
  } catch (e) {
    console.warn('[sitemap] Could not reach Supabase:', e.message);
    return [];
  }
}

function buildSitemap(posts) {
  const today = new Date().toISOString().slice(0, 10);
  const lines = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');

  for (const page of STATIC_PAGES) {
    lines.push('  <url>');
    lines.push(`    <loc>${SITE_URL}${page.path}</loc>`);
    lines.push(`    <lastmod>${today}</lastmod>`);
    lines.push(`    <changefreq>${page.changefreq}</changefreq>`);
    lines.push(`    <priority>${page.priority}</priority>`);
    lines.push('  </url>');
  }

  for (const post of posts) {
    const slug = post.slug || slugify(post.title || '');
    if (!slug) continue;
    const lastmod = (post.updated_at || '').slice(0, 10) || today;
    lines.push('  <url>');
    lines.push(`    <loc>${SITE_URL}/blog/${xmlEscape(slug)}</loc>`);
    lines.push(`    <lastmod>${lastmod}</lastmod>`);
    lines.push('    <changefreq>monthly</changefreq>');
    lines.push('    <priority>0.7</priority>');
    lines.push('  </url>');
  }

  lines.push('</urlset>');
  return lines.join('\n') + '\n';
}

async function writeFile(targetPath, body) {
  try {
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.writeFile(targetPath, body, 'utf8');
    console.log(`[sitemap] wrote ${path.relative(ROOT, targetPath)}`);
  } catch (e) {
    console.warn(`[sitemap] could not write ${targetPath}:`, e.message);
  }
}

async function main() {
  const posts = await fetchPosts();
  console.log(`[sitemap] ${posts.length} published post(s) found.`);
  const xml = buildSitemap(posts);
  await writeFile(path.join(ROOT, 'public', 'sitemap.xml'), xml);
  await writeFile(path.join(ROOT, 'dist', 'sitemap.xml'), xml);
}

main().catch(err => {
  console.error('[sitemap] fatal:', err);
  process.exitCode = 0;
});
