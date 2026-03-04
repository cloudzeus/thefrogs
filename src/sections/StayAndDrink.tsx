"use client";
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { HomeSectionRow } from '@/types/home-section';
import { useLanguage } from '@/context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

type Props = { data?: HomeSectionRow | null };

export default function StayAndDrink({ data }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const decorRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const image = data?.image ?? '/images/bar-interior.jpg';
  const rawTitle = t(data?.titleEN ?? 'STAY\nHERE\n&\nDRINK\nWITH US', data?.titleEL ?? 'ΜΕΙΝΕ\nΕΔΩ\n&\nΠΙΕ\nΜΑΖΙ ΜΑΣ') || (data as any)?.title || '';
  const body = t(data?.bodyEN ?? "We're a guesthouse first—but the bar is where the day starts and ends. Come down for coffee, stay for cocktails, then take the stairs to bed.", data?.bodyEL ?? 'Είμαστε πρώτα ξενοδοχείο — αλλά το bar είναι εκεί που ξεκινά και τελειώνει η μέρα.') || (data as any)?.body || '';
  const ctaLabel = t(data?.ctaLabelEN ?? 'Reserve a Table', data?.ctaLabelEL ?? 'Κράτηση Τραπεζιού');
  const ctaUrl = data?.ctaUrl ?? 'https://thefrogsguesthouse.reserve-online.net/';
  const extras = (data?.extras ?? {}) as { stats?: { value: string; labelEN: string; labelEL: string }[] };
  const stats = extras.stats ?? [
    { value: '7', labelEN: 'ROOMS', labelEL: 'ΔΩΜΑΤΙΑ' },
    { value: '1', labelEN: 'BAR', labelEL: 'BAR' },
    { value: '1', labelEN: 'ROOFTOP', labelEL: 'ΤΑΡΑΤΣΑ' }
  ];

  // Split title into lines; treat "&" line as the ampersand
  const titleLines = rawTitle.split('\n').filter(Boolean);

  useEffect(() => {
    const section = sectionRef.current, headline = headlineRef.current, body = bodyRef.current, image = imageRef.current, decor = decorRef.current;
    if (!section || !headline || !body || !image) return;
    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({ scrollTrigger: { trigger: section, start: 'top top', end: '+=150%', pin: true, scrub: 0.8 } });
      scrollTl
        .fromTo(image, { scale: 1.1, x: '-8vw', opacity: 0.5 }, { scale: 1, x: 0, opacity: 1, ease: 'none' }, 0)
        .fromTo(headline.querySelectorAll('.headline-line'), { x: '-50vw', opacity: 0 }, { x: 0, opacity: 1, stagger: 0.02, ease: 'none' }, 0.02)
        .fromTo(body, { x: '20vw', opacity: 0 }, { x: 0, opacity: 1, ease: 'none' }, 0.1)
        .fromTo(headline, { y: 0, opacity: 1 }, { y: '-20vh', opacity: 0, ease: 'power2.in' }, 0.7)
        .fromTo(body, { x: 0, opacity: 1 }, { x: '15vw', opacity: 0, ease: 'power2.in' }, 0.7)
        .fromTo(image, { scale: 1, y: 0 }, { scale: 1.06, y: '-5vh', ease: 'power1.in' }, 0.7);
      if (decor) scrollTl.fromTo(decor, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, ease: 'none' }, 0.15);
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="section-pinned bg-frogs-dark z-20">
      <div ref={imageRef} className="absolute inset-0 w-full h-full" style={{ willChange: 'transform, opacity' }}>
        <img src={image} alt={t("Bar Interior", "Εσωτερικό του Bar")} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-frogs-dark/60" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(42,45,37,0.8) 0%, rgba(42,45,37,0.4) 50%, rgba(42,45,37,0.6) 100%)' }} />
      </div>

      <div ref={decorRef} className="absolute top-20 right-20 w-32 h-32 hidden lg:block">
        <div className="w-full h-full rounded-full border border-frogs-gold/20" style={{ animation: 'spin 20s linear infinite' }} />
        <div className="absolute inset-4 rounded-full border border-frogs-gold/10" style={{ animation: 'spin 15s linear infinite reverse' }} />
      </div>

      <div className="relative z-10 h-full flex items-center px-6 lg:px-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 w-full max-w-7xl mx-auto">
          <div ref={headlineRef}>
            {titleLines.map((line: string, i: number) => (
              <div key={i} className="headline-line overflow-hidden">
                <span className={`font-display text-display block ${line === '&' ? 'text-frogs-gold ml-8 lg:ml-16 py-2' : 'text-frogs-text-light'}`}>
                  {line}
                </span>
              </div>
            ))}
          </div>
          <div ref={bodyRef} className="flex flex-col justify-center">
            <div className="w-20 h-1 bg-frogs-gold mb-8" />
            <p className="font-body text-xl lg:text-2xl text-frogs-text-light/90 leading-relaxed mb-8 max-w-md">{body}</p>
            <div className="flex items-center gap-6 mb-8">
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <span className="font-display text-4xl text-frogs-gold">{stat.value}</span>
                  <p className="font-body text-xs text-frogs-text-light/50 mt-1">
                    {t(stat.labelEN, stat.labelEL)}
                  </p>
                </div>
              ))}
            </div>
            {ctaUrl && ctaLabel && (
              <a href={ctaUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary self-start">{ctaLabel}</a>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </section>
  );
}
