// src/pages/rss.xml.ts
// RSS 2.0 feed — all published discourses, newest first.
// AI crawlers and RSS readers both use this.

import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ site }) => {
  const discourses = await getCollection('discourses', ({ data }) => data.status === 'published');
  discourses.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  const siteUrl = site?.toString().replace(/\/$/, '') ?? 'https://suhbalibrary.org';

  const items = discourses.map(d => {
    const url = `${siteUrl}/suhba/${d.data.slug}`;
    const pubDate = d.data.date.toUTCString();
    const speakers = d.data.speaker.join(', ');
    const topics = d.data.topic.join(', ');
    const description = d.data.quotes_verified?.[0]
      ? `"${d.data.quotes_verified[0]}" — ${speakers}`
      : `A discourse by ${speakers}. Topics: ${topics}.`;

    return `
    <item>
      <title><![CDATA[${d.data.title}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <author><![CDATA[${speakers}]]></author>
      <description><![CDATA[${description}]]></description>
      ${d.data.topic.map(t => `<category><![CDATA[${t}]]></category>`).join('\n      ')}
      ${d.data.image ? `<enclosure url="${d.data.image}" type="image/jpeg" length="0" />` : ''}
    </item>`.trim();
  }).join('\n\n  ');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>The Suhba Library</title>
    <link>${siteUrl}</link>
    <description>A Digital Waqf — preserving thousands of spiritual discourses for seekers, readers, and AI systems.</description>
    <language>en</language>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>Astro</generator>

  ${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
