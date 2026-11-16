#!/usr/bin/env python3
"""Regenerate static paper pages from the source-backed manifest. No dependencies."""
import hashlib, html, json, re
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
esc = html.escape
papers = json.loads((ROOT / 'assets/papers.json').read_text())
inline_studies=[]
def version(name): return hashlib.sha256((ROOT/name).read_bytes()).hexdigest()[:10]
def link(url, label, cls=''):
    if not re.match(r'https?://|mailto:', url): url = '../../' + url
    return f'<a class="{cls}" href="{esc(url)}" target="_blank" rel="noopener">{label}</a>'
def new_tabs(s):
    return re.sub(r'<a\b([^>]+)>',r'<a\1 target="_blank" rel="noopener">',s)
for p in papers:
    frames=[]
    for i, frame in enumerate(p['gallery']):
        load='fetchpriority="high"' if i == 0 else 'loading="lazy"'
        caption=esc(frame['caption']); image='../../'+esc(frame['image'])
        frames.append(f'<figure class="gallery-frame" id="figure-{i+1}"><img src="{image}" alt="{esc(p["title"])} — {caption}" decoding="async" {load}><figcaption><span class="figure-label"><span class="figure-number">{i+1:02}</span>{caption}</span><a class="gallery-download" href="{image}" target="_blank" rel="noopener" download>Save image ↓</a></figcaption></figure>')
    controls=''.join(f'<button type="button" data-frame="{i}" aria-label="Show image {i+1}: {esc(f["caption"])}" aria-current="{str(i==0).lower()}"></button>' for i,f in enumerate(p['gallery'])) if len(frames)>1 else ''
    resources=''.join(link(l['url'],esc(l['label'])+' <span aria-hidden="true">↗</span>') for l in p['links'])
    overview_source=link(p['overview_source'],'Summary · Read original ↗','overview-source')
    short={'transgs':'TransGS','media2face':'Media2Face','gaussianhair':'GaussianHair','dreamface':'DreamFace','chatavatar':'ChatAvatar','genpie':'GenPIE'}.get(p['id'],p['id'].upper())
    page=f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(short)} — Longwen Zhang</title>
<meta name="description" content="{esc(p['overview'])}"><meta name="theme-color" content="#f9f9f6">
<link rel="canonical" href="https://zhanglongwen.com/papers/{p['id']}/">
<meta property="og:title" content="{esc(p['title'])}"><meta property="og:image" content="https://zhanglongwen.com/{p['gallery'][0]['image']}">
<link rel="icon" href="../../assets/favicon.svg?v=2" type="image/svg+xml">
<link rel="stylesheet" href="../../gallery.css?v={version('gallery.css')}">
<script src="../../gallery.js?v={version('gallery.js')}" defer></script>
</head>
<body>
<main class="study-layout">
<section class="study" aria-labelledby="study-title">
<a class="study-home" href="../../" target="_blank" rel="noopener">Longwen Zhang ↗</a><button class="study-back" type="button">← Publications</button>
<p class="study-meta">{new_tabs(p['venue_html'])}</p><h1 id="study-title">{esc(p['title'])}</h1>
<p class="study-authors">{p['authors_html']}</p>
<div class="study-overview"><h2>Research overview</h2><p class="overview">{esc(p['overview'])}</p>{overview_source}</div>
<nav class="resource-links" aria-label="Paper resources">{resources}</nav>
<div class="gallery-index"><span class="gallery-count">01 / {len(frames):02}</span><nav class="gallery-progress" aria-label="Gallery images">{controls}</nav>{'<span class="gallery-hint">Scroll to explore ↓</span>' if len(frames)>1 else ''}</div>
</section>
<section class="gallery-story" aria-label="{esc(short)} image gallery">{''.join(frames)}</section>
</main></body></html>
'''
    inner = re.search(r'<main class="study-layout">(.*?)</main>',page,re.S)[1]
    for i, frame in enumerate(p['gallery']):
        source = '../../'+esc(frame['image'])
        image_pattern = r'<img src="'+re.escape(source)+r'"[^>]*>'
        load = 'fetchpriority="high"' if i == 0 else 'loading="lazy"'
        media = f'<div class="figure-media" style="aspect-ratio:{frame["width"]}/{frame["height"]}"><img class="figure-preview" src="{esc(frame["preview"])}" alt="" aria-hidden="true" decoding="async" {load}><img class="figure-full" src="{esc(frame["image"])}" alt="{esc(p["title"])} — {esc(frame["caption"])}" width="{frame["width"]}" height="{frame["height"]}" decoding="async" {load}></div>'
        inner=re.sub(image_pattern,lambda _:media,inner)
    inner=inner.replace('href="../../','href="')
    inline_studies.append(f'<template id="study-{p["id"]}" data-title="{esc(p["title"])}"><div class="study-layout">{inner}</div></template>')
    dest=ROOT/'papers'/p['id'];dest.mkdir(parents=True,exist_ok=True);(dest/'index.html').write_text(page)
print(f'Generated {len(papers)} paper pages, {sum(len(p["gallery"]) for p in papers)} images.')

# Keep the overlay shell, metadata and layout local to the homepage. Templates are inert:
# their images do not load until the selected study is mounted.
home=ROOT/'index.html'
markup=home.read_text()
markup=re.sub(r'\n<!-- Inline studies start -->.*?<!-- Inline studies end -->','',markup,flags=re.S)
styles=(ROOT/'gallery.css').read_text()+'\n'+(ROOT/'study-overlay.css').read_text()
inline='\n<!-- Inline studies start -->\n<template id="study-styles"><style>'+styles+'</style></template>\n'+'\n'.join(inline_studies)+'\n<!-- Inline studies end -->\n'
markup=markup.replace('</body>',inline+'</body>')
for name in ['style.css','navigation.js']:
    markup=re.sub(re.escape(name)+r'\?v=[^" ]+',name+'?v='+version(name),markup)
home.write_text(markup)
