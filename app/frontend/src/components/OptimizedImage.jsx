import { imageProps, avifProps } from '../lib/images';
import { squarePhotos } from '../lib/squarePhotos';

export default function OptimizedImage({ src, square = false, sizes, loading = 'lazy', decoding = 'async', ...props }) {
  const source = square ? squarePhotos[src] || src : src;
  const avif = avifProps(source, sizes);
  const image = <img {...imageProps(source, sizes)} loading={loading} decoding={decoding} {...props} />;
  return avif ? <picture style={{display: 'contents'}}><source type="image/avif" {...avif} />{image}</picture> : image;
}
