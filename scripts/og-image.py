#!/usr/bin/env python3
"""Builds src/app/opengraph-image.jpg (1200x630 link-preview card) from the light portrait cut-out.
Usage: python3 scripts/og-image.py fraunces.ttf inter.ttf   (TTFs converted from the @fontsource-variable woff2 files)"""
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

FR, IN = sys.argv[1], sys.argv[2]
W, H = 1200, 630
BG = (247, 244, 239)

def font(path, size, wght):
    f = ImageFont.truetype(path, size)
    try:
        f.set_variation_by_axes([wght])
    except Exception:
        pass
    return f

img = Image.new("RGB", (W, H), BG)
# soft peach glow, top right
glow = Image.new("RGB", (W, H), BG)
g = ImageDraw.Draw(glow)
g.ellipse((560, -260, 1400, 420), fill=(255, 205, 180))
glow = glow.filter(ImageFilter.GaussianBlur(120))
img = Image.blend(img, glow, 0.7)

# gradient frame
fx0, fy0, fx1, fy1 = 700, 130, 1120, 560
grad = Image.new("RGB", (fx1 - fx0, fy1 - fy0))
px = grad.load()
c1, c2 = (255, 187, 163), (240, 86, 107)
for y in range(grad.height):
    for x in range(grad.width):
        t = (x * 0.45 + y * 0.9) / (grad.width * 0.45 + grad.height * 0.9)
        px[x, y] = tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))
mask = Image.new("L", grad.size, 0)
ImageDraw.Draw(mask).rounded_rectangle((0, 0, grad.width, grad.height), 34, fill=255)
img.paste(grad, (fx0, fy0), mask)

# portrait: bottom aligned to the frame, head breaking the top edge, clipped at the rounded bottom
p = Image.open("public/img/portrait-light.webp").convert("RGBA")
ph = 500
p = p.resize((int(p.width * ph / p.height), ph), Image.LANCZOS)
layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
layer.paste(p, ((fx0 + fx1) // 2 - p.width // 2, fy1 - ph), p)
clip = Image.new("L", (W, H), 0)
d = ImageDraw.Draw(clip)
d.rectangle((0, 0, W, fy1 - 34), fill=255)
d.rounded_rectangle((fx0, fy0, fx1, fy1), 34, fill=255)
d.rectangle((fx0 - 200, 0, fx1 + 200, fy0 + 60), fill=255)
layer.putalpha(Image.composite(layer.getchannel("A"), Image.new("L", (W, H), 0), clip))
img.paste(layer, (0, 0), layer)

d = ImageDraw.Draw(img)
ink, muted, accent = (34, 29, 25), (95, 87, 79), (216, 72, 44)
d.text((72, 150), "Hi, I’m", font=font(IN, 30, 600), fill=accent)
d.text((72, 200), "Khaw", font=font(FR, 84, 620), fill=ink)
d.text((72, 290), "Cheng Chuan", font=font(FR, 84, 620), fill=ink)
for i, line in enumerate(["Telecommunications & IT Transformation", "Executive · Product & Platform Leader · Builder"]):
    d.text((72, 450 + i * 36), line, font=font(IN, 26, 450), fill=muted)
d.text((72, 548), "khaw.cc", font=font(IN, 30, 650), fill=accent)

img.save("src/app/opengraph-image.jpg", quality=86, optimize=True, progressive=True)
print("saved", img.size)
