"use client";
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mail, Phone } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { HomeSectionRow } from '@/types/home-section';
import { useLanguage } from '@/context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

type Props = { data?: HomeSectionRow | null };

export default function ContactCTA({ data }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const image = data?.image ?? '/images/contact-coffee.jpg';
  const label = t(data?.labelEN ?? 'REACH OUT', data?.labelEL ?? 'ΕΠΙΚΟΙΝΩΝΙΑ');
  const rawTitle = t(data?.titleEN ?? 'GET IN\nTOUCH', data?.titleEL ?? 'ΕΠΙΚΟΙΝΩΝΙΑ\nΜΑΖΙ ΜΑΣ');
  const body = t(data?.bodyEN ?? 'For bookings, questions, or just to say hello—drop us a line. We read everything.', data?.bodyEL ?? 'Για κρατήσεις, ερωτήσεις ή απλά για να πείτε γεια — στείλτε μας γραμμή. Διαβάζουμε τα πάντα.');
  const ctaLabel = t(data?.ctaLabelEN ?? 'Send a Message', data?.ctaLabelEL ?? 'Στείλτε Μήνυμα');
  const ctaUrl = data?.ctaUrl ?? '/contact';
  const ex = (data?.extras ?? {}) as { email?: string; phone?: string; whatsapp?: string };
  const email = ex.email ?? 'thefrogs.guesthouse@gmail.com';
  const phone = ex.phone ?? '+30 21 1401 9607';
  const titleLines = rawTitle.split('\n').filter(Boolean);

  useEffect(() => {
    const section = sectionRef.current, media = mediaRef.current, text = textRef.current;
    if (!section || !media || !text) return;
    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({ scrollTrigger: { trigger: section, start: 'top top', end: '+=130%', pin: true, scrub: 0.6 } });
      scrollTl
        .fromTo(media, { x: '60vw' }, { x: 0, ease: 'none' }, 0)
        .fromTo(media.querySelector('img'), { scale: 1.1, x: '-4vw' }, { scale: 1, x: 0, ease: 'none' }, 0)
        .fromTo(text.querySelector('.title'), { x: '-40vw', opacity: 0 }, { x: 0, opacity: 1, ease: 'none' }, 0.08)
        .fromTo(text.querySelectorAll('.fade-in'), { y: 28, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.02, ease: 'none' }, 0.16)
        .fromTo(media, { x: 0, opacity: 1 }, { x: '18vw', opacity: 0, ease: 'power2.in' }, 0.7)
        .fromTo(text, { x: 0, opacity: 1 }, { x: '-18vw', opacity: 0, ease: 'power2.in' }, 0.7);
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="section-pinned bg-frogs-dark z-[90]">
      <div className="h-full flex">
        <div ref={textRef} className="w-full lg:w-1/2 h-full flex flex-col justify-center px-6 lg:px-16" style={{ willChange: 'transform, opacity' }}>
          <span className="label-micro text-frogs-gold mb-4 fade-in">{label}</span>
          <h2 className="title font-display text-display text-frogs-text-light mb-8">
            {titleLines.map((line, i) => <span key={i} className="block">{line}</span>)}
          </h2>
          <p className="font-body text-lg text-frogs-text-light/80 leading-relaxed mb-8 max-w-md fade-in">{body}</p>
          <div className="space-y-4 mb-8 fade-in">
            <a href={`mailto:${email}`} className="flex items-center gap-3 text-frogs-text-light/80 hover:text-frogs-gold transition-colors">
              <Mail className="w-5 h-5" /><span className="font-body">{email}</span>
            </a>
            <a href={`tel:${phone.replace(/\s/g, '')}`} className="flex items-center gap-3 text-frogs-text-light/80 hover:text-frogs-gold transition-colors">
              <Phone className="w-5 h-5" /><span className="font-body">{phone}</span>
            </a>
          </div>
          <Link href={ctaUrl} className="btn-secondary self-start fade-in">{ctaLabel}</Link>
        </div>
        <div ref={mediaRef} className="hidden lg:block w-1/2 h-full relative overflow-hidden" style={{ willChange: 'transform, opacity' }}>
          <Image src={image} alt="Contact" fill sizes="50vw" className="object-cover" loading="lazy" style={{ willChange: 'transform' }} />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-frogs-dark/30" />
        </div>
      </div>
    </section>
  );
}
