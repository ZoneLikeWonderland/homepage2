# Longwen Zhang — personal academic homepage

A buildless static site, published through GitHub Pages from `main` at
[zhanglongwen.com](https://zhanglongwen.com/).

## Local preview

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open <http://localhost:8000/>. There are no package dependencies, external fonts,
CDN stylesheets, or build requirements. Paper entries open a full-width overlay on the current page without changing
its URL. External resource links remain available on the homepage and open in new tabs.

## Editing

- `index.html`: biography, research previews, all publication entries, contact links.
- `style.css`: layout, responsive styles, reduced-motion and print styles.
- `assets/`: local research previews and favicon.
- `projects/nvpr/`: original project pages, retained at their existing URLs.
- `assets/portrait.webp`, `zlw_resume.pdf`, `CNAME`: portrait, CV, and domain.

Keep publication entries in reverse chronological order. Use the formal publication
year/title when available and label unpublished manuscripts `arXiv`. Do not add
contribution markers. Keep the biography as a current ShanghaiTech Ph.D. candidate
without a company affiliation, per the owner's instructions. The existing CV PDF
has been retained; this revision does not update its contents.

## Publication verification (2026-11-16)

The homepage contains 16 distinct works, including the ChatAvatar Real-Time Live!
entry. Conference/journal versions and arXiv versions are not counted separately.
Author names are listed in publication order; only Longwen Zhang's name is bold.

Sources used for the seven additions and version updates:

- SATO: <https://ruixu.me/html/SATO/index.html> links Longwen Zhang directly to this
  homepage. Formal record: <https://doi.org/10.1145/3811286>, ACM TOG 45(4), 2026.
- GenPIE: <https://doi.org/10.1145/3811281>, ACM TOG 45(4), 2026. Identity checked
  against the official program's author affiliations:
  <https://s2026.conference-schedule.org/presentation/?id=papers_142&sess=sess147>.
- TAPESTRY: <https://arxiv.org/abs/2603.17735>, 2026, arXiv.
- BANG: <https://arxiv.org/abs/2507.21493> and
  <https://doi.org/10.1145/3730840>, ACM TOG / SIGGRAPH 2025.
- CAST: <https://sites.google.com/view/cast4>,
  <https://arxiv.org/abs/2502.12894>, ACM TOG / SIGGRAPH 2025. Author order follows
  the formal publication record indexed at <https://dblp.org/pid/289/5800.html>.
- TransGS: <https://doi.org/10.1109/TPAMI.2025.3550195>, IEEE TPAMI, published
  March 14, 2025. The formal title is “Instant Gaussian Splatting Generation for
  High-Quality and Real-Time Facial Asset Rendering”, replacing the 2024 arXiv
  title. Formal author ordering checked at <https://dolphinqiao.github.io/>.
- ChatAvatar: <https://doi.org/10.1145/3588430.3597244>, SIGGRAPH Real-Time Live!
  2023; a demonstration publication, not a technical paper. The original PDF
  lists the owner's ShanghaiTech email:
  <https://s2024.siggraph.org/wp-content/uploads/2024/05/siggraph23realtimelive-1.pdf>.
- GaussianHair remains arXiv 2024, matching <https://haiminluo.github.io/> and
  <https://arxiv.org/abs/2402.10483>.

The other nine works were already present on the owner's homepage; their original
years were retained after bibliographic cross-checks. NIMBLE uses formal author
ordering rather than the different ordering in the original arXiv submission.

Author-disambiguation note: do not import the DBLP author page wholesale. The
malicious-website detection article (10.1016/j.cose.2023.103641) belongs to a
Shenzhen University namesake according to the publisher biography, and is excluded.
Do not use aggregated citation counts from the mixed OpenAlex author profile.

## Research image credits

The local WebP previews reproduce the authors' original teaser figures, resized
for web display. The cards link to the corresponding publication entries with
paper and project links. The figures retain their original authorship and rights.

- `assets/clay.webp`: Figure 1, CLAY —
  <https://arxiv.org/html/2406.13897v1/fig/realteaser_c.jpg>
- `assets/bang.webp`: BANG teaser —
  <https://arxiv.org/html/2507.21493v1/figs/teaser3.jpg>
- `assets/cast.webp`: CAST teaser —
  <https://arxiv.org/html/2502.12894v1/figs/teaser.png>

## Publication teasers

All 16 entries display a fixed-size teaser to the right of their bibliographic
details (below the text on narrow screens). Images keep their full composition with `object-fit: contain`; teaser containers
have no background, border, or rounded frame.
Clicking a publication teaser opens that paper's full-width overlay on the current
page, matching the title and whole-row behavior. Full-resolution images allow native
right-click saving, with an additional download link for the current image.
The homepage itself has no scrolling background effects.

- `assets/teasers/`: full-size images, up to 3840 pixels wide.
- `assets/teasers/thumbs/`: smaller previews, loaded lazily in the list.
- `assets/teasers/sources.json`: original source for every image.

SATO and TransGS use the teaser figures from their arXiv papers, replacing the
results galleries used in the discarded background experiment. ChatAvatar uses
the left preview panel of Figure 1, extracted from the official Real-Time Live!
paper. The figures retain their original authorship and rights.

Content preferences: omit the CLAY GitHub link; show contact email quietly in
the footer, with no “Let's talk” invitation or location label. YouTube belongs
with the profile links, separate from the Dota 2 interest.

## Publication links (2026-11-16)

Each entry separates Project, publisher (ACM / IEEE / CVF), arXiv, and YouTube
links when verified. Titles, images, and row whitespace open a full-width overlay without navigation. Resource links independently open their original destinations in new tabs.
`assets/publication-links.json` records the links, verification sources, and
exceptions for all 16 entries. It is a reference manifest, not a runtime dependency;
keep it synchronized with `assets/papers.json` when editing links.

DOIs were checked against publisher-deposited Crossref metadata, author project
pages, or the papers themselves. YouTube IDs come from author project pages
(or the retained NVPR page), and their titles were checked with YouTube oEmbed.
Use the project page's SIGGRAPH video for DreamFace and Media2Face instead of
duplicating their earlier preprint uploads.

GenPIE and ChatAvatar have no verified arXiv links. SATO and ChatAvatar have no
verified academic YouTube videos. ChatAvatar's Project link is its official product
page. Missing link types are omitted rather than shown as empty placeholders.
NIMBLE's working project URL has no trailing slash; its ACM link is the TOG journal
article, not the separate conference video record. CLAY's GitHub remains omitted.

## Publication awards

Award labels remain beside the venue; on detail pages they link to official SIGGRAPH announcements.

- CAST: SIGGRAPH 2025 — Best Paper. <https://blog.siggraph.org/2025/06/siggraph-2025-technical-papers-awards-best-papers-honorable-mentions-and-test-of-time.html/>
- CLAY: SIGGRAPH 2024 — Honorable Mention. <https://blog.siggraph.org/2024/06/siggraph-2024-technical-papers-awards-best-papers-honorable-mentions-and-test-of-time.html/>

The three research highlights use borderless, unframed images with `object-fit: cover`
to fill equally sized previews without letterboxing or color blending. Publication
teasers still preserve the full scientific figures with `object-fit: contain`.

## Image formats and quality

All raster images served by the homepage and retained NVPR project pages are WebP.
The favicon remains a resolution-independent SVG. Original JPG/PNG files are
backed up outside the site under `../artifacts/homepage-preview/`.

CLAY and BANG were regenerated from the original 3840 × 2160 arXiv JPEGs,
not from the previous compressed previews. Full-size WebPs retain 3840 × 2160 resolution with high-quality lossy compression
(WebP quality 95); 1600-pixel highlight images and 1040-pixel list previews also
use quality 95. Responsive image candidates
allow sharper rendering on dense displays. NVPR's former PNG figures and icons
use WebP quality 95. The current portrait uses quality 97 WebP. The owner chose to retain this photo
and defer the LinkedIn replacement.

Research highlights use a 16:9 aspect ratio at every viewport size to show the
complete CLAY and BANG compositions while keeping equal-height tiles.

The header contains navigation only; omit the invented “LZ.” monogram.

## Deployment and final polish

GitHub Pages serves this static tree directly (`.nojekyll`); keep the custom-domain
`CNAME`. The stylesheet URL includes a content hash; refresh it after CSS changes.
The page includes canonical and Open Graph metadata for the custom domain.
Responsive WebP sources preserve sharp images on dense displays, while a 640-pixel
portrait avoids loading the full-size photo unnecessarily. Publication DOM order
follows the visible reading order: text and links, then the teaser.


## Publication gallery

- `assets/papers.json`: verified publication metadata, concise editorial summaries of
  abstracts, resource links, and gallery provenance. Summaries are labeled as such.
- `scripts/build-papers.py`: regenerates the 16 paper documents and inert inline
  homepage templates using the Python standard library. Run after changing the
  manifest, gallery CSS, overlay CSS, or navigation script; it updates cache hashes.
- `gallery.css`, `gallery.js`: sticky information on the left, a naturally scrolling
  image sequence on the right, accessible frame controls, and reduced motion.
- `navigation.js`: opens the selected inline template inside a native dialog and
  restores list position/focus on close. No iframe, detail navigation, or metadata
  request is needed on click. Shadow DOM isolates detail styles from the homepage.
- `study-overlay.css`: full-width panel adaptations and preview-to-full-image fades.

External resource links open new tabs and remain on both the homepage and detail
view. Homepage paper titles, teasers, and whitespace share one detail button.
The overlay spans the viewport width, centered at 78% of the viewport height
(up to 760 px), leaving exposed backdrop above and below. The information column
has no independent scrolling. If text cannot fit a short viewport, it flows with
the whole panel so that every link and paragraph remains reachable.
The backdrop dims the original page; clicking either exposed strip, Close, Escape,
or Publications restores the original list position. The panel fades in with a
small upward movement and fades out on dismissal, respecting reduced motion. On narrow screens,
information precedes the image sequence. Images retain their complete aspect ratios,
allow native right-click saving, and each have their own Save image control.

CLAY and BANG include two additional 3840 × 2160 gallery figures from the authors'
arXiv papers. CAST includes its full 5300 × 5082 scene gallery; GaussianHair includes
editing and relighting figures from its project page. New images preserve source
resolution and use lossy WebP quality 95. The Google Sites image endpoints rejected
image downloads; corresponding author-paper figures were used instead.

GitHub Pages publishes this gallery with the rest of the site from `main`.

Image loading uses an immediate preview followed by a decoded high-resolution WebP
fade. Intentional hover/focus warms only the selected teaser. Gallery preview assets
are separate from the original-resolution files; saving still uses the full image.

## Interaction regression checks

Row shading is restricted to mouse hover (`hover: hover` and `pointer: fine`).
Returning keyboard focus to a study does not shade the row; keyboard focus keeps
its own visible outline. Mouse/touch openers retain focus without an outline on
return, including after Escape; subsequent keyboard navigation restores the focus
indicator. Touch devices do not use sticky hover styling. Backdrop
dismissal requires an uncancelled primary-button press and release outside the
panel; right-clicks and drags out of the content do not dismiss it.

`scripts/check-interactions.cjs` runs against a dedicated Chromium/Edge browser
with remote debugging enabled and a running local preview. It closes that dedicated
browser when successful. It needs Node.js and the `ws` package; set
`HOMEPAGE_WS_MODULE` to an existing module path if it is not locally installed.

```sh
node scripts/check-interactions.cjs '<browser-websocket-url>' 'http://127.0.0.1:8000/'
```

Optional `HOMEPAGE_QA_OUTPUT_DIR` saves screenshots. Set
`HOMEPAGE_QA_DOWNLOAD_DIR` to a path on the browser's host to additionally verify
an actual full-resolution download and its byte count.

Coverage includes all 16 studies, pointer-only highlighting, restored focus/scroll,
Enter/Space/Tab/Escape, rapid reopening, outside-click gesture boundaries, direct
resource links, gallery scrolling, full-image loading and fallback previews,
reduced motion, and touch emulation at responsive widths from 320 to 1440 pixels.

## Visitor map

The footer uses Flag Counter's image-only country map, counter `O0MI`:
https://info.flagcounter.com/O0MI. It requires no server deployment, external
JavaScript library, API key, or subscription. The registration email is
zhanglw2@shanghaitech.edu.cn; management information is sent by the provider.

`visitors.js` loads exactly one external counter image, and only on
`zhanglongwen.com` or `www.zhanglongwen.com`. No third-party scripts run on the
homepage. Local previews never load the counter. The image is validated before
it replaces the local public-domain Natural Earth outline in `assets/visitors/`;
a blocked/failed request or a 1px error response leaves that outline intact,
without error banners, fabricated visitor dots, or fabricated counts. Statistics
links always open in new tabs. The provider supplies the live image format;
local research assets remain WebP. Image counters may refresh more slowly than
the provider's statistics page and only count browsers that load the image.

MapMyVisitors was removed after its host timed out on direct connections while
working through a proxy. Its 3D data endpoint also returned HTML rather than
JSONP. No third-party service has a guaranteed lifetime: the local outline and
layout remain independent, and the image/statistics URLs can be replaced without
changing the rest of the site. Old counts do not transfer automatically.
