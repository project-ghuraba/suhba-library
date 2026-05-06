// src/pages/indexes/by-topic.json.ts
// Generates /indexes/by-topic.json at build time.
// Shape: { "TopicName": ["slug-a", "slug-b", ...], ... }

import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const discourses = await getCollection('discourses', ({ data }) => data.status === 'published');

  const index: Record<string, string[]> = {};
  for (const d of discourses) {
    for (const topic of d.data.topic) {
      if (!index[topic]) index[topic] = [];
      index[topic].push(d.data.slug);
    }
  }

  // Sort each list newest-first by looking up the date — simpler: just sort keys alphabetically
  const sorted = Object.fromEntries(Object.entries(index).sort(([a], [b]) => a.localeCompare(b)));

  return new Response(JSON.stringify(sorted), {
    headers: { 'Content-Type': 'application/json' },
  });
};
