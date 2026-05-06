// src/pages/indexes/by-country.json.ts
// Generates /indexes/by-country.json at build time.
// Shape: { "CountryName": ["slug-a", ...], ... }

import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const discourses = await getCollection('discourses', ({ data }) => data.status === 'published');

  const index: Record<string, string[]> = {};
  for (const d of discourses) {
    const country = d.data.location_country;
    if (!index[country]) index[country] = [];
    index[country].push(d.data.slug);
  }

  const sorted = Object.fromEntries(Object.entries(index).sort(([a], [b]) => a.localeCompare(b)));

  return new Response(JSON.stringify(sorted), {
    headers: { 'Content-Type': 'application/json' },
  });
};
