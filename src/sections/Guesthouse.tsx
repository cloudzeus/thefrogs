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

export default function Guesthouse({ data }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const image = data?.image ?? '/images/guesthouse-room.jpg';
  const label = t(data?.labelEN ?? 'MAIN BUILDING • EST. 2018', data?.labelEL ?? 'ΚΥΡΙΟ ΚΤΗΡΙΟ • EST. 2018') || (data as any)?.label || '';
  const rawTitle = t(data?.titleEN ?? 'THE\nGUESTHOUSE', data?.titleEL ?? 'ΤΟ\nΞΕΝΟΔΟΧΕΙΟ') || (data as any)?.title || '';
  const body = t(data?.bodyEN ?? 'Seven rooms, calm and quiet, with good light, cotton linens, and details that make it feel like home—only cleaner.', data?.bodyEL ?? 'Επτά δωμάτια, ήσυχα και γαλήνια, με καλό φως, βαμβακερά σεντόνια και λεπτομέρειες που το κάνουν σαν σπίτι — μόνο πιο καθαρό.') || (data as any)?.body || '';
  const ctaLabel = t(data?.ctaLabelEN ?? 'See Rooms', data?.ctaLabelEL ?? 'Δείτε Δωμάτια');
  const ctaUrl = data?.ctaUrl ?? '/rooms';
  const cta2Label = t(data?.cta2LabelEN ?? 'Check Availability', data?.cta2LabelEL ?? 'Ελέγξτε Διαθεσιμότητα');
  const cta2Url = data?.cta2Url ?? 'https://thefrogsguesthouse.reserve-online.net/';

  useEffect(() => {
    const section = sectionRef.current, media = mediaRef.current, text = textRef.current;
    if (!section || !media || !text) return;
    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({ scrollTrigger: { trigger: section, start: 'top top', end: '+=130%', pin: true, scrub: 0.6 } });
      scrollTl
        .fromTo(media, { x: '-60vw' }, { x: 0, ease: 'none' }, 0)
        .fromTo(media.querySelector('img'), { scale: 1.1, x: '4vw' }, { scale: 1, x: 0, ease: 'none' }, 0)
        .fromTo(text.querySelector('.title'), { x: '40vw', opacity: 0 }, { x: 0, opacity: 1, ease: 'none' }, 0.08)
        .fromTo(text.querySelectorAll('.fade-in'), { y: 28, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.02, ease: 'none' }, 0.16)
        .fromTo(media, { x: 0, opacity: 1 }, { x: '-18vw', opacity: 0, ease: 'power2.in' }, 0.7)
        .fromTo(text, { x: 0, opacity: 1 }, { x: '18vw', opacity: 0, ease: 'power2.in' }, 0.7);
    }, section);
    return () => ctx.revert();
  }, []);

  const titleLines = rawTitle.split('\n').filter(Boolean);

  return (
    <section ref={sectionRef} className="section-pinned bg-frogs-dark z-30">
      <div className="h-full flex">
        <div ref={mediaRef} className="hidden lg:block w-1/2 h-full relative overflow-hidden" style={{ willChange: 'transform, opacity' }}>
          <Image src={image} alt="Guesthouse Room" fill sizes="50vw" className="object-cover" loading="lazy" style={{ willChange: 'transform' }} />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-frogs-dark/30" />
        </div>
        <div ref={textRef} className="w-full lg:w-1/2 h-full flex flex-col justify-center px-6 lg:px-16" style={{ willChange: 'transform, opacity' }}>
          <span className="label-micro text-frogs-gold mb-4 fade-in">{label}</span>
          <h2 className="title font-display text-display text-frogs-text-light mb-8">
            {titleLines.map((line: string, i: number) => <span key={i} className="block">{line}</span>)}
          </h2>
          <p className="font-body text-lg text-frogs-text-light/80 leading-relaxed mb-8 max-w-md fade-in">{body}</p>
          <div className="flex flex-wrap gap-4 fade-in">
            <Link href={ctaUrl} className="btn-primary">{ctaLabel}</Link>
            <a href={cta2Url} target="_blank" rel="noopener noreferrer" className="btn-secondary">{cta2Label}</a>
          </div>
        </div>
      </div>
    </section>
  );
}
