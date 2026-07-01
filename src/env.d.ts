/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

// Pagefind is a post-build artifact — no types exist at check time.
declare module '/pagefind/pagefind.js' {
  const pagefind: any;
  export = pagefind;
}
