import { imageProps, avifProps } from '../lib/images';

export default function OptimizedImage({ src, sizes, loading = 'lazy', decoding = 'async', ...props }) {
  const avif = avifProps(src, sizes);
  const image = <img {...imageProps(src, sizes)} loading={loading} decoding={decoding} {...props} />;
  return avif ? <picture style={{display: 'contents'}}><source type="image/avif" {...avif} />{image}</picture> : image;
}
