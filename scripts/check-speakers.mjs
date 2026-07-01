// scripts/check-speakers.mjs
// CI Stage 1 (supplementary) — Speaker profile existence check.
// Reads all .md files in src/content/discourses/, extracts speaker names,
// and warns if no corresponding profile exists in src/data/speakers/.
//
// Always exits 0 — this is a warning only, not a blocking check.
//
// Usage: node scripts/check-speakers.mjs

import { readdir, readFile, access } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const DISCOURSES_DIR = resolve('src/content/discourses');
const SPEAKERS_DIR   = resolve('src/data/speakers');

// Matches the nameToSlug logic in src/pages/speakers/[speaker].astro
function nameToSlug(name) {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function extractSpeakers(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return [];
  const frontmatter = match[1];

  // Match YAML array: speaker:\n  - Name or speaker: ["Name"]
  const block = frontmatter.match(/^speaker:\s*\n((?:[ \t]+-[^\n]*\n?)+)/m);
  if (block) {
    return [...block[1].matchAll(/[ \t]+-\s*["']?([^"'\n]+?)["']?\s*$/gm)]
      .map(m => m[1].trim())
      .filter(Boolean);
  }

  // Inline array: speaker: ["Name", "Name2"]
  const inline = frontmatter.match(/^speaker:\s*\[([^\]]+)\]/m);
  if (inline) {
    return inline[1]
      .split(',')
      .map(s => s.trim().replace(/^["']|["']$/g, ''))
      .filter(Boolean);
  }

  return [];
}

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
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
    process.exit(0);
  }

  if (files.length === 0) {
    console.log('ℹ️  No discourse files found — skipping speaker profile check.');
    process.exit(0);
  }

  // Collect unique speaker names across all discourses
  const speakerNames = new Set();
  for (const file of files) {
    const content = await readFile(file, 'utf-8');
    for (const name of extractSpeakers(content)) {
      speakerNames.add(name);
    }
  }

  let warnings = 0;
  for (const name of [...speakerNames].sort()) {
    const slug = nameToSlug(name);
    const profilePath = join(SPEAKERS_DIR, `${slug}.md`);
    if (!(await fileExists(profilePath))) {
      console.warn(`⚠️  No speaker profile for "${name}" (expected: src/data/speakers/${slug}.md)`);
      warnings++;
    }
  }

  if (warnings === 0) {
    console.log(`✅ Speaker profiles OK — all ${speakerNames.size} speaker(s) have profiles.`);
  } else {
    console.warn(`\n⚠️  ${warnings} speaker profile(s) missing. Add profiles to suppress these warnings.`);
  }

  process.exit(0);
}

main().catch(err => {
  console.error('❌ Unexpected error in speaker check:', err);
  process.exit(0);
});
