#!/usr/bin/env python3
"""Compress an original image as WebP without discarding its alpha channel.

Requires Pillow. Resize only when dimensions are explicitly supplied.
"""
import argparse
from pathlib import Path
from PIL import Image, ImageOps, ImageChops

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('source', type=Path)
parser.add_argument('destination', type=Path)
parser.add_argument('--width', type=int)
parser.add_argument('--height', type=int)
parser.add_argument('--quality', type=int, default=95)
args = parser.parse_args()
if not 0 <= args.quality <= 100:
    parser.error('quality must be between 0 and 100')
if any(n is not None and n <= 0 for n in [args.width, args.height]):
    parser.error('dimensions must be positive')

with Image.open(args.source) as original:
    image = ImageOps.exif_transpose(original)
    has_alpha = 'A' in image.getbands() or 'transparency' in image.info
    image = image.convert('RGBA' if has_alpha else 'RGB')
    if args.width or args.height:
        width = args.width or round(image.width * args.height / image.height)
        height = args.height or round(image.height * args.width / image.width)
        image = image.resize((width, height), Image.Resampling.LANCZOS)
    args.destination.parent.mkdir(parents=True, exist_ok=True)
    # WebP compresses color lossily at the chosen quality and preserves alpha.
    image.save(args.destination, 'WEBP', quality=args.quality, method=6)
    if has_alpha:
        with Image.open(args.destination) as saved:
            difference = ImageChops.difference(image.getchannel('A'), saved.convert('RGBA').getchannel('A'))
            if difference.getbbox() is not None:
                raise RuntimeError('The encoded alpha channel differs from the source')
    print(f'{args.destination}: {image.width} x {image.height}, alpha={has_alpha}, quality={args.quality}')
