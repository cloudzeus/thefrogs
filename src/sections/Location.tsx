"use client";
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin } from 'lucide-react';
import type { HomeSectionRow } from '@/types/home-section';
import { useLanguage } from '@/context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

type Props = { data?: HomeSectionRow | null };

export default function Location({ data }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const ex = (data?.extras ?? {}) as { address?: string; city?: string; mapEmbedUrl?: string };
  const label = t(data?.labelEN ?? 'PSYRI, ATHENS', data?.labelEL ?? 'ΨΥΡΡΗ, ΑΘΗΝΑ') || (data as any)?.label || '';
  const rawTitle = t(data?.titleEN ?? 'THE\nLOCATION', data?.titleEL ?? 'Η\nΤΟΠΟΘΕΣΙΑ') || (data as any)?.title || '';
  const body = t(data?.bodyEN ?? "We're in Psyri—walking distance to the Acropolis, the market, and late-night spots. Quiet street, central everything.", data?.bodyEL ?? 'Βρισκόμαστε στον Ψυρρή — σε απόσταση βόλτας από την Ακρόπολη, την αγορά και τα νυχτερινά μαγαζιά.') || (data as any)?.body || '';
  const ctaLabel = t(data?.ctaLabelEN ?? 'Get Directions', data?.ctaLabelEL ?? 'Οδηγίες');
  const ctaUrl = data?.ctaUrl ?? 'https://maps.google.com/?q=4+Aristofanous+Str+Athens+10554+Greece';
  const address = ex.address ?? '4 Aristofanous Str.';
  const city = ex.city ?? 'Athens 10554, Greece';
  const mapUrl = ex.mapEmbedUrl ?? 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3145.054054054054!2d23.7214!3d37.9781!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDU4JzQxLjIiTiAyM8KwNDMnMTcuMCJF!5e0!3m2!1sen!2sus!4v1234567890';
  const titleLines = rawTitle.split('\n').filter(Boolean);

  useEffect(() => {
    const section = sectionRef.current, media = mediaRef.current, text = textRef.current;
    if (!section || !media || !text) return;
    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({ scrollTrigger: { trigger: section, start: 'top top', end: '+=130%', pin: true, scrub: 0.6 } });
      scrollTl
        .fromTo(media, { x: '60vw' }, { x: 0, ease: 'none' }, 0)
        .fromTo(media.querySelector('iframe'), { scale: 1.08 }, { scale: 1, ease: 'none' }, 0)
        .fromTo(text.querySelector('.title'), { x: '-40vw', opacity: 0 }, { x: 0, opacity: 1, ease: 'none' }, 0.08)
        .fromTo(text.querySelectorAll('.fade-in'), { y: 28, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.02, ease: 'none' }, 0.16)
        .fromTo(media, { x: 0, opacity: 1 }, { x: '18vw', opacity: 0, ease: 'power2.in' }, 0.7)
        .fromTo(text, { x: 0, opacity: 1 }, { x: '-18vw', opacity: 0, ease: 'power2.in' }, 0.7);
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="section-pinned bg-frogs-dark z-[60]">
      <div className="h-full flex">
        <div ref={textRef} className="w-full lg:w-1/2 h-full flex flex-col justify-center px-6 lg:px-16" style={{ willChange: 'transform, opacity' }}>
          <span className="label-micro text-frogs-gold mb-4 fade-in">{label}</span>
          <h2 className="title font-display text-display text-frogs-text-light mb-8">
            {titleLines.map((line: string, i: number) => <span key={i} className="block">{line}</span>)}
          </h2>
          <p className="font-body text-lg text-frogs-text-light/80 leading-relaxed mb-8 max-w-md fade-in">{body}</p>
          <div className="flex items-start gap-3 mb-8 fade-in">
            <MapPin className="w-5 h-5 text-frogs-gold mt-1 flex-shrink-0" />
            <div>
              <p className="font-body text-frogs-text-light">{address}</p>
              <p className="font-body text-frogs-text-light/70">{city}</p>
            </div>
          </div>
          <a href={ctaUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary self-start fade-in">{ctaLabel}</a>
        </div>
        <div ref={mediaRef} className="hidden lg:block w-1/2 h-full relative overflow-hidden" style={{ willChange: 'transform, opacity' }}>
          <iframe src={mapUrl} width="100%" height="100%" style={{ border: 0, filter: 'grayscale(100%) invert(92%) contrast(83%)' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="The Frogs Guesthouse Location" className="w-full h-full" />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-frogs-dark/20 pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
