// src/pages/indexes/quotes.json.ts
// Generates /indexes/quotes.json at build time.
// Shape: [{ quote: "...", slug: "...", speaker: ["..."], title: "..." }, ...]

import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const discourses = await getCollection('discourses', ({ data }) => data.status === 'published');

  const quotes: Array<{ quote: string; slug: string; speaker: string[]; title: string }> = [];

  for (const d of discourses) {
    for (const quote of d.data.quotes_verified ?? []) {
      quotes.push({
        quote,
        slug: d.data.slug,
        speaker: d.data.speaker,
        title: d.data.title,
      });
    }
  }

  return new Response(JSON.stringify(quotes), {
    headers: { 'Content-Type': 'application/json' },
  });
};
