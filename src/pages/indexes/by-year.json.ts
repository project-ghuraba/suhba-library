// src/pages/indexes/by-year.json.ts
// Generates /indexes/by-year.json at build time.
// Shape: { "1994": ["slug-a", ...], "2003": ["slug-b", ...], ... }

import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const discourses = await getCollection('discourses', ({ data }) => data.status === 'published');

  const index: Record<string, string[]> = {};
  for (const d of discourses) {
    const year = String(d.data.date.getFullYear());
    if (!index[year]) index[year] = [];
    index[year].push(d.data.slug);
  }

  const sorted = Object.fromEntries(
    Object.entries(index).sort(([a], [b]) => Number(b) - Number(a))
  );

  return new Response(JSON.stringify(sorted), {
    headers: { 'Content-Type': 'application/json' },
  });
};
