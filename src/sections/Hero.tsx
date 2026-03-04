"use client";
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import Image from 'next/image';
import type { HomeSectionRow } from '@/types/home-section';
import { useLanguage } from '@/context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);


type Props = { data?: HomeSectionRow | null };

const DEFAULTS = {
  image: '/images/hero-athens-bar.jpg',
  labelEN: 'BOUTIQUE ROOMS • BAR • ROOFTOP',
  labelEL: 'BOUTIQUE ΔΩΜΑΤΙΑ • BAR • ΤΑΡΑΤΣΑ',
  titleEN: 'THE FROGS\nGUESTHOUSE',
  titleEL: 'THE FROGS\nGUESTHOUSE',
  bodyEN: 'A boutique guesthouse in the heart of Athens with a bar downstairs and a rooftop made for golden hour. Est. 2018.',
  bodyEL: 'Ένα boutique ξενοδοχείο στην καρδιά της Αθήνας με bar στο ισόγειο και ταράτσα για χρυσές ώρες. Est. 2018.',
  ctaLabelEN: 'Book Your Stay',
  ctaLabelEL: 'Κράτηση',
  ctaUrl: 'https://thefrogsguesthouse.reserve-online.net/',
  cta2LabelEN: 'Explore Rooms',
  cta2LabelEL: 'Δείτε Δωμάτια',
  cta2Url: '/rooms',
  stats: [
    { value: '7', labelEN: 'ROOMS', labelEL: 'ΔΩΜΑΤΙΑ' },
    { value: '1', labelEN: 'BAR', labelEL: 'BAR' },
    { value: '1', labelEN: 'ROOFTOP', labelEL: 'ΤΑΡΑΤΣΑ' }
  ],
};

export default function Hero({ data }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const image = data?.image ?? DEFAULTS.image;
  const label = t(data?.labelEN ?? DEFAULTS.labelEN, data?.labelEL ?? DEFAULTS.labelEL) || (data as any)?.label || '';
  const rawTitle = t(data?.titleEN ?? DEFAULTS.titleEN, data?.titleEL ?? DEFAULTS.titleEL) || (data as any)?.title || '';
  const body = t(data?.bodyEN ?? DEFAULTS.bodyEN, data?.bodyEL ?? DEFAULTS.bodyEL) || (data as any)?.body || '';
  const ctaLabel = t(data?.ctaLabelEN ?? DEFAULTS.ctaLabelEN, data?.ctaLabelEL ?? DEFAULTS.ctaLabelEL);
  const ctaUrl = data?.ctaUrl ?? DEFAULTS.ctaUrl;
  const cta2Label = t(data?.cta2LabelEN ?? DEFAULTS.cta2LabelEN, data?.cta2LabelEL ?? DEFAULTS.cta2LabelEL);
  const cta2Url = data?.cta2Url ?? DEFAULTS.cta2Url;
  const extras = (data?.extras ?? {}) as { stats?: { value: string; labelEN: string; labelEL: string }[] };
  const stats = extras.stats ?? DEFAULTS.stats;
  const titleLines = rawTitle.split('\n').filter(Boolean);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.2 });
      if (imageRef.current) {
        tl.fromTo(imageRef.current, { scale: 1.08, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.4, ease: 'power2.out' }, 0);
      }
      if (contentRef.current) {
        tl.fromTo(contentRef.current.querySelectorAll('.anim-line'),
          { y: 60, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, stagger: 0.12, ease: 'power3.out' },
          0.3
        );
      }
    });
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center overflow-hidden bg-frogs-dark">
      {/* Background */}
      <div ref={imageRef} className="absolute inset-0" style={{ willChange: 'transform, opacity' }}>
        <Image
          src={image}
          alt={`The Frogs Guesthouse - ${label}`}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-frogs-dark/40 via-frogs-dark/50 to-frogs-dark/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-frogs-dark/70 to-transparent" />
      </div>


      {/* Content */}
      <div ref={contentRef} className="relative z-10 px-6 lg:px-16 max-w-7xl mx-auto w-full pt-24 pb-16">
        <span className="anim-line label-micro text-frogs-gold mb-6 block">{label}</span>

        <h1 className="font-display text-display text-frogs-text-light mb-8">
          {titleLines.map((line: string, i: number) => (
            <span key={i} className="anim-line block">{line}</span>
          ))}
        </h1>

        <p className="anim-line font-body text-xl text-frogs-text-light/80 max-w-lg mb-12 leading-relaxed">{body}</p>

        {/* Stats */}
        <div className="anim-line flex items-center gap-8 mb-12" aria-label="Quick statistics">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <span className="font-display text-4xl text-frogs-gold">{stat.value}</span>
              <p className="font-body text-xs text-frogs-text-light/70 mt-1">
                {t(stat.labelEN, stat.labelEL) || (stat as any).label || ''}
              </p>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="anim-line flex flex-wrap gap-4">
          {ctaUrl && ctaLabel && (
            <a
              href={ctaUrl}
              target={ctaUrl.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="btn-primary"
              aria-label={`${ctaLabel} (opens in new tab)`}
            >
              {ctaLabel}
            </a>
          )}
          {cta2Url && cta2Label && (
            <Link href={cta2Url} className="btn-secondary">{cta2Label}</Link>
          )}
        </div>
      </div>
    </section>
  );
}
