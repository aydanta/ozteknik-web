import { photoSrc, photoSrcSet, type PhotoKey } from '@/lib/photos';

/** Kurumsal fotoğraf (16:9, 960/1920 WebP). alt="" → dekoratif (başlık bandı arka planı gibi). */
export default function Photo({ k, alt = '', sizes = '100vw', eager, className }: { k: PhotoKey; alt?: string; sizes?: string; eager?: boolean; className?: string }) {
  return (
    <img
      className={className}
      src={photoSrc(k)}
      srcSet={photoSrcSet(k)}
      sizes={sizes}
      alt={alt}
      width={1920}
      height={1080}
      loading={eager ? undefined : 'lazy'}
      fetchPriority={eager ? 'high' : undefined}
      decoding="async"
    />
  );
}
