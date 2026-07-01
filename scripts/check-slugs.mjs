// scripts/check-slugs.mjs
// CI Stage 2 — Duplicate slug detection.
// Reads all .md files in src/content/discourses/, parses the slug field,
// and fails with a clear error message if any two files share a slug.
//
// Usage: node scripts/check-slugs.mjs

import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const DISCOURSES_DIR = resolve('src/content/discourses');

// Minimal YAML front-matter slug extractor — avoids a full YAML parser dependency.
function extractSlug(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return null;
  const frontmatter = match[1];
  const slugMatch = frontmatter.match(/^slug:\s*["']?([^"'\n]+)["']?\s*$/m);
  return slugMatch ? slugMatch[1].trim() : null;
}

async function getAllMdFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });
  return entries
    .filter(e => e.isFile() && e.name.endsWith('.md'))
    .map(e => join(e.parentPath, e.name));
}

async function main() {
  let files;
  try {
    files = await getAllMdFiles(DISCOURSES_DIR);
  } catch {
    console.error(`❌ Could not read discourses directory: ${DISCOURSES_DIR}`);
    process.exit(1);
  }

  if (files.length === 0) {
    console.log('ℹ️  No discourse files found — skipping slug check.');
    process.exit(0);
  }

  const slugMap = new Map(); // slug → file path
  const duplicates = [];

  for (const file of files) {
    const content = await readFile(file, 'utf-8');
    const slug = extractSlug(content);

    if (!slug) {
      console.error(`❌ Missing or unparseable slug in: ${file}`);
      process.exit(1);
    }

    if (slugMap.has(slug)) {
      duplicates.push({ slug, files: [slugMap.get(slug), file] });
    } else {
      slugMap.set(slug, file);
    }
  }

  if (duplicates.length > 0) {
    console.error('\n❌ Duplicate slugs detected:\n');
    for (const { slug, files } of duplicates) {
      console.error(`  Slug: "${slug}"`);
      for (const f of files) console.error(`    → ${f}`);
    }
    console.error('\nFix: each discourse must have a unique slug field.\n');
    process.exit(1);
  }

  console.log(`✅ Slug check passed — ${slugMap.size} unique slug${slugMap.size !== 1 ? 's' : ''} across ${files.length} file${files.length !== 1 ? 's' : ''}.`);
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Unexpected error in slug check:', err);
  process.exit(1);
});
