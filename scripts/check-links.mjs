// scripts/check-links.mjs
// CI Stage 3 — Broken internal link detection.
// Scans all discourse .md files for cross-references to other discourses
// (links of the form /suhba/<slug> or [text](/suhba/<slug>))
// and verifies that the referenced slug exists as a published discourse.
//
// Usage: node scripts/check-links.mjs

import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const DISCOURSES_DIR = resolve('src/content/discourses');

// Internal link patterns to check:
// Markdown: [text](/suhba/some-slug) or [text](/suhba/some-slug#anchor)
// Plain:    /suhba/some-slug
const INTERNAL_LINK_RE = /(?:\[.*?\])?\(\/suhba\/([\w-]+)(?:#[^)]+)?\)|(?<!["\w])\/suhba\/([\w-]+)/g;

function extractSlugAndStatus(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return { slug: null, status: null };
  const fm = match[1];
  const slugM = fm.match(/^slug:\s*["']?([^"'\n]+)["']?\s*$/m);
  const statusM = fm.match(/^status:\s*["']?([^"'\n]+)["']?\s*$/m);
  return {
    slug: slugM ? slugM[1].trim() : null,
    status: statusM ? statusM[1].trim() : null,
  };
}

async function getAllMdFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });
  return entries
    .filter(e => e.isFile() && e.name.endsWith('.md'))
    .map(e => join(e.parentPath ?? e.path, e.name));
}

async function main() {
  let files;
  try {
    files = await getAllMdFiles(DISCOURSES_DIR);
  } catch {
    console.log('ℹ️  No discourses directory found — skipping link check.');
    process.exit(0);
  }

  if (files.length === 0) {
    console.log('ℹ️  No discourse files found — skipping link check.');
    process.exit(0);
  }

  // Build set of all published slugs
  const publishedSlugs = new Set();
  const fileContents = new Map();

  for (const file of files) {
    const content = await readFile(file, 'utf-8');
    fileContents.set(file, content);
    const { slug, status } = extractSlugAndStatus(content);
    if (slug && status === 'published') {
      publishedSlugs.add(slug);
    }
  }

  // Check all cross-references
  const broken = [];

  for (const [file, content] of fileContents) {
    const matches = [...content.matchAll(INTERNAL_LINK_RE)];
    for (const m of matches) {
      const referencedSlug = m[1] ?? m[2];
      if (referencedSlug && !publishedSlugs.has(referencedSlug)) {
        broken.push({ file, referencedSlug });
      }
    }
  }

  if (broken.length > 0) {
    console.error('\n❌ Broken internal links detected:\n');
    for (const { file, referencedSlug } of broken) {
      console.error(`  File:           ${file}`);
      console.error(`  Missing slug:   /suhba/${referencedSlug}\n`);
    }
    console.error('Fix: ensure referenced slugs exist as published discourses, or remove the links.\n');
    process.exit(1);
  }

  console.log(`✅ Link check passed — ${publishedSlugs.size} published slug${publishedSlugs.size !== 1 ? 's' : ''} checked across ${files.length} file${files.length !== 1 ? 's' : ''}.`);
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Unexpected error in link check:', err);
  process.exit(1);
});
