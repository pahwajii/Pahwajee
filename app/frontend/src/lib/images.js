import images from '../generated/images.json';

// Unknown URLs (including new admin uploads) keep their original source.
export function imageProps(src, sizes = '(min-width: 1280px) 600px, (min-width: 768px) 50vw, 100vw') {
  const image = images[src];
  if (!image) return { src };
  const fallbackWidth = image.widths.find(width => width >= 960) || image.widths.at(-1);
  return {
    src: `${image.base}-${fallbackWidth}.webp`,
    srcSet: image.widths.map(width => `${image.base}-${width}.webp ${width}w`).join(', '),
    sizes,
    width: image.width,
    height: image.height,
  };
}
