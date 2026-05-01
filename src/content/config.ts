// src/content/config.ts
// Astro 5 Content Collections — Zod schema enforcement
// Any .md file in src/content/discourses/ that fails this schema
// will cause the build (and CI Stage 1) to fail with a clear error.

import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// BCP 47 language code — basic pattern; covers all expected values
const bcp47 = z.string().regex(
  /^[a-z]{2,3}(-[A-Z][a-z]{3})?(-[A-Z]{2}|\d{3})?$/,
  'Must be a valid BCP 47 language code (e.g. "en", "ar", "tr")'
);

// Slug convention: YYYY-MM-DD-short-title, lowercase, hyphens only
const slugPattern = z.string().regex(
  /^\d{4}-\d{2}-\d{2}-[a-z0-9-]+$/,
  'Slug must match YYYY-MM-DD-short-title convention using lowercase letters, digits, and hyphens only'
);

// Absolute URL helper
const absoluteUrl = z.string().url();

// NFC-normalised string — Zod transform enforces Unicode normalisation
const nfcString = z.string().transform(s => s.normalize('NFC'));
const nfcStringArray = z.array(nfcString);

// ---------------------------------------------------------------------------
// Discourse schema
// ---------------------------------------------------------------------------

const discourseSchema = z.object({

  // --- Required fields ---

  title: nfcString
    .min(1, 'title is required'),

  date: z.coerce.date(),

  speaker: nfcStringArray
    .min(1, 'At least one speaker is required'),

  location_country: nfcString
    .min(1, 'location_country is required'),

  language: bcp47,

  slug: slugPattern,

  status: z.enum(['published', 'draft', 'archived']),

  topic: nfcStringArray
    .min(1, 'At least one topic tag is required'),

  // --- Optional fields ---

  date_hijri: nfcString.optional(),

  location_city: nfcString.optional(),

  location_venue: nfcString.optional(),

  transcript_quality: z.enum(['draft', 'reviewed', 'verified']).optional(),

  youtube_url: absoluteUrl.optional(),

  image: absoluteUrl.optional(),

  quotes_verified: nfcStringArray.optional(),

  version: z.number().int().positive().optional(),

  edited_at: z.coerce.date().optional().nullable(),
});

// ---------------------------------------------------------------------------
// Speaker biography schema (src/data/speakers/ — not a Content Collection,
// but included here for reference. Speaker pages use getStaticPaths with
// manual file loading.)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Collection registration — Astro 5 glob loader
// ---------------------------------------------------------------------------

export const collections = {
  discourses: defineCollection({
    loader: glob({
      pattern: '**/*.md',
      base: './src/content/discourses',
    }),
    schema: discourseSchema,
  }),
};

// ---------------------------------------------------------------------------
// Export schema type for use elsewhere (index generation, RSS, etc.)
// ---------------------------------------------------------------------------

export type DiscourseSchema = z.infer<typeof discourseSchema>;
