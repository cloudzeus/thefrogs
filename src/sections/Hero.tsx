"use client";
import Link from 'next/link';
import Image from 'next/image';
import type { HomeSectionRow } from '@/types/home-section';
import { useLanguage } from '@/context/LanguageContext';

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

// CSS animation delays for staggered entrance — runs immediately on first paint,
// no JS needed, LCP-friendly (elements are visible from the start in the DOM,
// animation-fill-mode: both keeps them invisible only during the delay, then
// transitions them in once the delay expires — fully CSS-driven).
const ANIM_DELAYS = ['0.05s', '0.2s', '0.35s', '0.5s', '0.65s', '0.8s'];

export default function Hero({ data }: Props) {
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

  // Assign stagger delays sequentially
  let delayIdx = 0;
  const nextDelay = () => ANIM_DELAYS[Math.min(delayIdx++, ANIM_DELAYS.length - 1)];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-frogs-dark">
      {/* Background — CSS fade/scale in, composited (no reflow) */}
      <div
        className="absolute inset-0"
        style={{ animation: 'hero-bg-in 1.4s ease-out forwards' }}
      >
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

      {/* Content — CSS staggered entrance, each element is in DOM immediately (LCP-friendly) */}
      <div className="relative z-10 px-6 lg:px-16 max-w-7xl mx-auto w-full pt-24 pb-16">
        <span
          className="label-micro text-frogs-gold mb-6 block"
          style={{ animation: `hero-line-in 0.9s ease-out ${nextDelay()} both` }}
        >
          {label}
        </span>

        <h1 className="font-display text-display text-frogs-text-light mb-8">
          {titleLines.map((line: string, i: number) => (
            <span
              key={i}
              className="block"
              style={{ animation: `hero-line-in 0.9s ease-out ${nextDelay()} both` }}
            >
              {line}
            </span>
          ))}
        </h1>

        <p
          className="font-body text-xl text-frogs-text-light/80 max-w-lg mb-12 leading-relaxed"
          style={{ animation: `hero-line-in 0.9s ease-out ${nextDelay()} both` }}
        >
          {body}
        </p>

        {/* Stats */}
        <div
          className="flex items-center gap-8 mb-12"
          aria-label="Quick statistics"
          style={{ animation: `hero-line-in 0.9s ease-out ${nextDelay()} both` }}
        >
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
        <div
          className="flex flex-wrap gap-4"
          style={{ animation: `hero-line-in 0.9s ease-out ${nextDelay()} both` }}
        >
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

      {/* Keyframes inlined — available immediately, no JS execution needed */}
      <style>{`
        @keyframes hero-bg-in {
          from { opacity: 0; transform: scale(1.08); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes hero-line-in {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
