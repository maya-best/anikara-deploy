# anikara.systems

Static site for [anikara.systems](https://anikara.systems), built with [Eleventy](https://www.11ty.dev/) and deployed on Netlify via Git.

Output is clean, static HTML — best for SEO, AEO, and answer-engine citation. No client-side framework, no build-time JS bloat.

## Structure

```
src/
  begin.html              # link-in-bio portal (passthrough, untouched) → /begin
  _redirects              # Netlify redirects (passthrough)         → /portal → /begin
  pre-sleep/              # React PWA (passthrough, untouched)       → /pre-sleep/
  corpus/                 # markdown blog posts → /corpus/<slug>/
    corpus.json           # shared front matter for all posts
    the-practice-of-noticing.md
  corpus-index.njk        # the corpus index   → /corpus/
  sitemap.njk             # → /sitemap.xml
  robots.njk              # → /robots.txt
  _data/site.js           # global site metadata (url, title, defaults)
  _includes/
    base.njk              # HTML shell: SEO head, OpenGraph, JSON-LD, design system
    post.njk              # single post layout
.eleventy.js              # Eleventy config (passthrough, collections, filters)
netlify.toml              # build command + Node version
```

Everything in `pre-sleep/`, plus `begin.html` and `_redirects`, is copied to the build **untouched**.

## Add a new post

1. Create a markdown file in `src/corpus/`, e.g. `src/corpus/my-new-note.md`.
2. Add front matter at the top:

   ```yaml
   ---
   title: My New Note
   description: A one-line summary used for SEO and the corpus index excerpt.
   date: 2026-06-15
   layout: post.njk
   ---
   ```

   `title`, `description`, and `date` are required. The filename becomes the URL:
   `my-new-note.md` → `/corpus/my-new-note/`.
3. Write the body in markdown below the front matter.
4. Commit and push:

   ```bash
   git add src/corpus/my-new-note.md
   git commit -m "Add post: My New Note"
   git push
   ```

   Netlify auto-builds and deploys.

## Run locally

```bash
npm install                  # first time only
npx @11ty/eleventy --serve   # live-reload dev server at http://localhost:8080
```

Build without serving:

```bash
npx @11ty/eleventy           # outputs to _site/
```

## How deploy works

Push to `main` → Netlify detects the commit → runs `npx @11ty/eleventy` → publishes `_site/`.
You no longer drag files into Netlify; the repo is the source of truth, so pages can't be wiped.

## To do later

- Add a real social share image at `src/og-default.png` (1200×630). It will be picked up
  automatically as the OpenGraph / Twitter card image (referenced in `_data/site.js`).
- Build the homepage at `/` when ready (add `src/index.njk`).
