"""Generate PWA / favicon icons from the Buddy mascot photo."""
from PIL import Image

SRC = "public/art/Smileydogfunny.jpg"
src = Image.open(SRC).convert("RGB")

# already square; center-crop defensively in case the source changes
w, h = src.size
side = min(w, h)
left, top = (w - side) // 2, (h - side) // 2
sq = src.crop((left, top, left + side, top + side))

for size, name in [(512, "icon-512.png"), (192, "icon-192.png"),
                    (180, "apple-icon.png"), (32, "favicon-32.png")]:
    sq.resize((size, size), Image.LANCZOS).save(f"public/{name}")
    print("wrote", name)
