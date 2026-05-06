// src/pages/indexes/by-speaker.json.ts
// Generates /indexes/by-speaker.json at build time.
// Shape: { "Speaker Name": ["slug-a", ...], ... }

import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const discourses = await getCollection('discourses', ({ data }) => data.status === 'published');

  const index: Record<string, string[]> = {};
  for (const d of discourses) {
    for (const speaker of d.data.speaker) {
      if (!index[speaker]) index[speaker] = [];
      index[speaker].push(d.data.slug);
    }
  }

  const sorted = Object.fromEntries(Object.entries(index).sort(([a], [b]) => a.localeCompare(b)));

  return new Response(JSON.stringify(sorted), {
    headers: { 'Content-Type': 'application/json' },
  });
};
