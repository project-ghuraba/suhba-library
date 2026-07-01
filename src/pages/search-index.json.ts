// src/pages/search-index.json.ts
// Generates /search-index.json at build time.
// Contains all published discourses with metadata for client-side filtering.

import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { toHijri } from 'hijri-converter';

const HIJRI_MONTHS = [
  'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
  'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', "Sha'ban",
  'Ramadan', 'Shawwal', 'Dhul Qadah', 'Dhul Hijjah',
];

function computeHijri(date: Date): string {
  const { hy, hm, hd } = toHijri(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return `${hd} ${HIJRI_MONTHS[hm - 1]} ${hy} (est.)`;
}

export const GET: APIRoute = async () => {
  const discourses = await getCollection('discourses', ({ data }) => data.status === 'published');

  const index = discourses
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
    .map(d => ({
      slug: d.data.slug,
      title: d.data.title,
      date: d.data.date.toISOString().split('T')[0],
      date_hijri: d.data.date_hijri ?? computeHijri(d.data.date),
      date_hijri_est: !d.data.date_hijri,
      year: d.data.date.getFullYear(),
      speaker: d.data.speaker,
      location_country: d.data.location_country,
      location_city: d.data.location_city ?? null,
      location_venue: d.data.location_venue ?? null,
      language: d.data.language,
      topic: d.data.topic,
      transcript_quality: d.data.transcript_quality ?? null,
      has_youtube: !!d.data.youtube_url,
      has_quotes: !!(d.data.quotes_verified?.length),
      type: d.data.type,
      source: d.data.source,
      date_added: d.data.edited_at
        ? d.data.edited_at.toISOString().split('T')[0]
        : d.data.date_added ?? d.data.date.toISOString().split('T')[0],
      body_excerpt: d.body
        ? d.body.replace(/[#*_`[\]()>~]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 250)
        : '',
    }));

  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json' },
  });
};
