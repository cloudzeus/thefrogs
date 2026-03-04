"use client";
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { X } from 'lucide-react';
import Image from 'next/image';
import type { HomeSectionRow } from '@/types/home-section';
import { useLanguage } from '@/context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

type Props = { data?: HomeSectionRow | null; dbImages?: any[] };

const DEFAULT_IMAGES = [
  { src: '/images/gallery-1.jpg', alt: 'Athens Street', span: 'col-span-2 row-span-1' },
  { src: '/images/gallery-2.jpg', alt: 'Room Corner', span: 'col-span-1 row-span-1' },
  { src: '/images/gallery-3.jpg', alt: 'Bar Detail', span: 'col-span-1 row-span-1' },
  { src: '/images/gallery-4.jpg', alt: 'Rooftop', span: 'col-span-1 row-span-1' },
  { src: '/images/gallery-5.jpg', alt: 'Breakfast', span: 'col-span-2 row-span-1' },
  { src: '/images/gallery-6.jpg', alt: 'Staircase', span: 'col-span-1 row-span-1' },
];

const SPANS = ['col-span-2', 'col-span-1', 'col-span-1', 'col-span-2', 'col-span-2', 'col-span-1'];

export default function Gallery({ data, dbImages }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const { t } = useLanguage();

  const ex = (data?.extras ?? {}) as { images?: string[] };
  const title = t(data?.titleEN ?? 'Gallery', data?.titleEL ?? 'Γκαλερί');
  const label = t(data?.labelEN ?? 'OUR SPACE', data?.labelEL ?? 'Ο ΧΩΡΟΣ ΜΑΣ');

  // Build image list from extras.images or fallback to defaults
  let images = DEFAULT_IMAGES;
  if (dbImages && dbImages.length > 0) {
    images = dbImages.map((img, i) => ({
      src: img.url,
      alt: img.title || `Gallery ${i + 1}`,
      span: SPANS[i % SPANS.length]
    }));
  } else if (ex.images && ex.images.length > 0) {
    images = ex.images.map((src, i) => ({ src, alt: `Gallery ${i + 1}`, span: SPANS[i % SPANS.length] }));
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxImage && e.key === 'Escape') setLightboxImage(null);
    };
    window.addEventListener('keydown', handleKeyDown);

    const section = sectionRef.current, heading = headingRef.current, grid = gridRef.current;
    if (!section || !heading || !grid) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(heading, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out', scrollTrigger: { trigger: heading, start: 'top 80%', toggleActions: 'play none none reverse' } });
      gsap.fromTo(grid.querySelectorAll('.gallery-item'), { scale: 0.96, y: 24, opacity: 0 }, { scale: 1, y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power2.out', scrollTrigger: { trigger: grid, start: 'top 75%', toggleActions: 'play none none reverse' } });
    }, section);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      ctx.revert();
    };
  }, [lightboxImage]);

  return (
    <section ref={sectionRef} className="relative bg-frogs-dark py-24 lg:py-32 z-[80]">
      <div className="px-6 lg:px-16 max-w-7xl mx-auto">
        <div ref={headingRef} className="mb-12">
          <span className="label-micro text-frogs-gold mb-4 block underline decoration-frogs-gold/30 underline-offset-8">{label}</span>
          <h2 className="font-heading text-headline text-frogs-text-light">{title}</h2>
        </div>
        <div ref={gridRef} className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image, i) => (
            <div
              key={i}
              className={`gallery-item relative overflow-hidden rounded-lg cursor-pointer group ${image.span}`}
              onClick={() => setLightboxImage(image.src)}
              role="button"
              aria-label={`View ${image.alt}`}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setLightboxImage(image.src)}
            >
              <div className="relative aspect-[4/3] lg:aspect-auto h-full min-h-[300px] lg:min-h-[400px]">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="absolute inset-0 bg-frogs-dark/40 opacity-100 group-hover:opacity-0 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </div>
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[100] bg-frogs-dark/95 backdrop-blur-lg flex items-center justify-center p-6"
          onClick={() => setLightboxImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
        >
          <button
            className="absolute top-6 right-6 p-2 text-frogs-text-light/60 hover:text-frogs-text-light transition-colors"
            onClick={() => setLightboxImage(null)}
            aria-label="Close preview"
          >
            <X className="w-8 h-8" aria-hidden="true" />
          </button>
          <div className="relative max-w-5xl max-h-[90vh] w-full h-full" onClick={(e) => e.stopPropagation()}>
            <Image
              src={lightboxImage}
              alt="Gallery preview"
              fill
              sizes="90vw"
              className="object-contain rounded-lg"
              priority
            />
          </div>
        </div>
      )}
    </section>
  );
}
