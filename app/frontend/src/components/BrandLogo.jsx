import OptimizedImage from './OptimizedImage';
export default function BrandLogo({ className = '', alt = 'PAHWA JEE', sizes = '(min-width: 640px) 160px, 120px' }) {
  return (
    <>
      <OptimizedImage loading="eager" sizes={sizes} src="/brand/pahwajee-day.png" width="1958" height="803" alt={alt} className={`block dark:hidden object-contain ${className}`} />
      <OptimizedImage loading="eager" sizes={sizes} src="/brand/pahwajee-dark.png" width="1958" height="803" alt={alt} className={`hidden dark:block object-contain ${className}`} />
    </>
  );
}
