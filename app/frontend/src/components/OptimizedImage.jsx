import { imageProps } from '../lib/images';

export default function OptimizedImage({ src, sizes, loading = 'lazy', decoding = 'async', ...props }) {
  return <img {...imageProps(src, sizes)} loading={loading} decoding={decoding} {...props} />;
}
