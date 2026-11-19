#!/usr/bin/env python3
"""Higher-quality background removal (used for public/img/portrait-dark.webp).
Usage: python3 scripts/cutout_rembg.py in.jpg out.webp [model]   (default model: birefnet-portrait)
Needs: pip install "rembg[cpu]" pillow   (downloads the model on first run)"""
import sys
from PIL import Image
from rembg import new_session, remove

src, out = sys.argv[1], sys.argv[2]
model = sys.argv[3] if len(sys.argv) > 3 else "birefnet-portrait"
img = Image.open(src).convert("RGB")
rgba = remove(img, session=new_session(model))
bbox = rgba.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
rgba = rgba.crop((bbox[0], bbox[1], bbox[2], img.height))  # keep the photo's bottom edge
rgba.thumbnail((1000, 1000))
rgba.save(out, "WEBP", quality=90, method=6)
print(out, rgba.size)
