"""Generate responsive WebP files without modifying source photos.
Run: python -m pip install Pillow==12.3.0
     python scripts/optimize-images.py
Commit public/media and src/generated/images.json with image changes.
No Python installation is needed on the deployment server.
"""
from pathlib import Path
from hashlib import sha256
from PIL import Image, ImageOps
import json

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'public'
OUTPUT = PUBLIC / 'media'
OUTPUT.mkdir(exist_ok=True)
sources = sorted([*PUBLIC.glob('products/*'), *PUBLIC.glob('gallery/*')])
sources += [PUBLIC / name for name in ['our_shop_main.jpeg', 'pahwa_family.jpg', 'brand/pahwajee-day.png', 'brand/pahwajee-dark.png']]
manifest = {}
original_bytes = largest_bytes = card_bytes = 0
for source in sources:
    if source.suffix.lower() not in {'.png', '.jpg', '.jpeg', '.webp'}:
        continue
    raw = source.read_bytes()
    image = ImageOps.exif_transpose(Image.open(source))
    image = image.convert('RGBA' if 'A' in image.getbands() else 'RGB')
    logo = source.parent.name == 'brand'
    quality = 90 if logo else 82
    widths = sorted({min(image.width, w) for w in ([160, 320, 640] if logo else [320, 640, 960, 1440])})
    # Include encoder settings in the key so cached URLs never change contents.
    digest = sha256(raw + f'webp-v1-q{quality}-method6-pillow12.3.0'.encode()).hexdigest()[:16]
    base = '/media/' + digest
    sizes = {}
    for width in widths:
        destination = OUTPUT / f'{digest}-{width}.webp'
        if not destination.exists():
            resized = image.resize((width, max(1, round(image.height * width / image.width))), Image.Resampling.LANCZOS)
            resized.save(destination, 'WEBP', quality=quality, method=6)
        sizes[width] = destination.stat().st_size
    manifest['/' + source.relative_to(PUBLIC).as_posix()] = {'base': base, 'width': image.width, 'height': image.height, 'widths': widths}
    original_bytes += len(raw)
    largest_bytes += sizes[max(widths)]
    card_bytes += sizes[min(widths, key=lambda w: abs(w - 640))]

# Use the existing brand mark, resized for its actual browser-icon use.
icon = Image.open(PUBLIC / 'brand/pj-icon.png').convert('RGBA')
for size in [32, 180]:
    icon.resize((size, size), Image.Resampling.LANCZOS).save(OUTPUT / f'pj-icon-{size}.png', optimize=True)

target = ROOT / 'src/generated/images.json'
target.parent.mkdir(exist_ok=True)
target.write_text(json.dumps(manifest, separators=(',', ':')) + '\n', encoding='utf-8')
print(json.dumps({'images': len(manifest), 'original_bytes': original_bytes, 'largest_webp_bytes': largest_bytes, '640px_webp_bytes': card_bytes}, indent=2))
