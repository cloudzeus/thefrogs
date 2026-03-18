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

export default function SecondBuilding({ data }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const mediaRef  = useRef<HTMLDivElement>(null);
  const textRef   = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const image     = data?.image ?? '/images/guesthouse-room.jpg';
  const label     = t(data?.labelEN ?? 'SECOND BUILDING • EST. 2022', data?.labelEL ?? 'ΔΕΥΤΕΡΟ ΚΤΗΡΙΟ • EST. 2022');
  const rawTitle  = t(data?.titleEN ?? 'THE\nANNEX', data?.titleEL ?? 'ΤΟ\nΠΑΡΑΡΤΗΜΑ');
  const body      = t(
    data?.bodyEN ?? 'A quieter corner just steps away — five freshly designed rooms with the same care and character, perfect for longer stays.',
    data?.bodyEL ?? 'Μία πιο ήσυχη γωνιά, λίγα βήματα μακριά — πέντε δωμάτια με την ίδια φροντίδα και χαρακτήρα, ιδανικά για μεγαλύτερες διαμονές.'
  );
  const ctaLabel  = t(data?.ctaLabelEN ?? 'See Rooms', data?.ctaLabelEL ?? 'Δείτε Δωμάτια');
  const ctaUrl    = data?.ctaUrl    ?? '/rooms';
  const cta2Label = t(data?.cta2LabelEN ?? 'Check Availability', data?.cta2LabelEL ?? 'Ελέγξτε Διαθεσιμότητα');
  const cta2Url   = data?.cta2Url   ?? 'https://thefrogsguesthouse.reserve-online.net/';

  useEffect(() => {
    const section = sectionRef.current;
    const media   = mediaRef.current;
    const text    = textRef.current;
    if (!section || !media || !text) return;

    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.6,
        },
      });

      scrollTl
        // Image slides in from the RIGHT
        .fromTo(media, { x: '60vw' }, { x: 0, ease: 'none' }, 0)
        .fromTo(media.querySelector('img'), { scale: 1.1, x: '-4vw' }, { scale: 1, x: 0, ease: 'none' }, 0)
        // Text slides in from the LEFT
        .fromTo(text.querySelector('.title'), { x: '-40vw', opacity: 0 }, { x: 0, opacity: 1, ease: 'none' }, 0.08)
        .fromTo(text.querySelectorAll('.fade-in'), { y: 28, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.02, ease: 'none' }, 0.16)
        // Exit: image to RIGHT, text to LEFT
        .fromTo(media, { x: 0, opacity: 1 }, { x: '18vw',  opacity: 0, ease: 'power2.in' }, 0.7)
        .fromTo(text,  { x: 0, opacity: 1 }, { x: '-18vw', opacity: 0, ease: 'power2.in' }, 0.7);
    }, section);

    return () => ctx.revert();
  }, []);

  const titleLines = rawTitle.split('\n').filter(Boolean);

  return (
    <section ref={sectionRef} className="section-pinned bg-frogs-dark z-30">
      <div className="h-full flex">

        {/* ── Text — LEFT ──────────────────────────────────────────────── */}
        <div
          ref={textRef}
          className="w-full lg:w-1/2 h-full flex flex-col justify-center px-6 lg:px-16"
          style={{ willChange: 'transform, opacity' }}
        >
          <span className="label-micro text-frogs-gold mb-4 fade-in">{label}</span>
          <h2 className="title font-display text-display text-frogs-text-light mb-8">
            {titleLines.map((line: string, i: number) => (
              <span key={i} className="block">{line}</span>
            ))}
          </h2>
          <p className="font-body text-lg text-frogs-text-light/80 leading-relaxed mb-8 max-w-md fade-in">
            {body}
          </p>
          <div className="flex flex-wrap gap-4 fade-in">
            <Link href={ctaUrl} className="btn-primary">{ctaLabel}</Link>
            <a href={cta2Url} target="_blank" rel="noopener noreferrer" className="btn-secondary">
              {cta2Label}
            </a>
          </div>
        </div>

        {/* ── Image — RIGHT ────────────────────────────────────────────── */}
        <div
          ref={mediaRef}
          className="hidden lg:block w-1/2 h-full relative overflow-hidden"
          style={{ willChange: 'transform, opacity' }}
        >
          <Image
            src={image}
            alt="Second Building"
            fill
            sizes="50vw"
            className="object-cover"
            loading="lazy"
            style={{ willChange: 'transform' }}
          />
          {/* Gradient fades left edge into dark bg */}
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-frogs-dark/30" />
        </div>

      </div>
    </section>
  );
}
