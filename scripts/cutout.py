#!/usr/bin/env python3
"""Background-removal helper used once to produce public/img/portrait-*.webp.
Usage: python3 scripts/cutout.py in.jpg out.webp x0 y0 x1 y1   (rect around the subject)
Needs: pip install opencv-python-headless pillow numpy"""
import sys, cv2, numpy as np
from PIL import Image

src, out = sys.argv[1], sys.argv[2]
x0, y0, x1, y1 = map(int, sys.argv[3:7])
img = cv2.imread(src)
h, w = img.shape[:2]
mode = sys.argv[7] if len(sys.argv) > 7 else "mask"  # "rect" for subjects with white clothing
mask = np.full((h, w), cv2.GC_BGD, np.uint8)
mask[y0:y1, x0:x1] = cv2.GC_PR_FGD
# bright, unsaturated pixels are studio backdrop -> definite background
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
backdrop = (img.min(axis=2) > 196) & (hsv[:, :, 1] < 40)
mask[backdrop] = cv2.GC_BGD
# definite foreground core: face ellipse + torso (derived from the rect)
cx, bw, bh = (x0 + x1) // 2, x1 - x0, y1 - y0
cv2.ellipse(mask, (cx, y0 + int(bh * 0.22)), (int(bw * 0.12), int(bh * 0.14)), 0, 0, 360, cv2.GC_FGD, -1)
cv2.rectangle(mask, (x0 + int(bw * 0.18), y0 + int(bh * 0.62)), (x1 - int(bw * 0.18), y1 - 2), cv2.GC_FGD, -1)
bgd, fgd = np.zeros((1, 65)), np.zeros((1, 65))
if mode == "rect":
    mask[:] = 0
    cv2.grabCut(img, mask, (x0, y0, x1 - x0, y1 - y0), bgd, fgd, 8, cv2.GC_INIT_WITH_RECT)
else:
    cv2.grabCut(img, mask, None, bgd, fgd, 10, cv2.GC_INIT_WITH_MASK)
m = np.where((mask == 1) | (mask == 3), 255, 0).astype(np.uint8)
# keep the largest component, fill holes, then feather
n, lab, st, _ = cv2.connectedComponentsWithStats(m)
if n > 1:
    big = 1 + np.argmax(st[1:, cv2.CC_STAT_AREA])
    m = np.where(lab == big, 255, 0).astype(np.uint8)
m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
m = cv2.erode(m, np.ones((3, 3), np.uint8))
m = cv2.GaussianBlur(m, (0, 0), 1.6)
rgba = cv2.cvtColor(img, cv2.COLOR_BGR2RGBA)
rgba[:, :, 3] = m
im = Image.fromarray(rgba)
# trim transparent margins on top/left/right (keep the bottom edge: the photo is cropped there)
bbox = im.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
im = im.crop((bbox[0], bbox[1], bbox[2], h))
im.thumbnail((1000, 1000))
im.save(out, "WEBP", quality=88, method=6)
print(out, im.size)
