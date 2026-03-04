"use client";
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Wifi, Wind, Sparkles, Bed, Coffee, Clock, Luggage, Umbrella, Wine } from 'lucide-react';
import type { HomeSectionRow } from '@/types/home-section';
import { useLanguage } from '@/context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

type Props = { data?: HomeSectionRow | null };

const ICON_MAP: Record<string, React.ElementType> = { Wifi, Wind, Sparkles, Bed, Coffee, Clock, Luggage, Umbrella, Wine };

const DEFAULT_ITEMS = [
  { icon: 'Wifi', labelEN: 'Free Wi-Fi', labelEL: 'Δωρεάν Wi-Fi', descEN: 'Fast, everywhere.', descEL: 'Γρήγορο, παντού.' },
  { icon: 'Wind', labelEN: 'Air Conditioning', labelEL: 'Κλιματισμός', descEN: 'Cool summers.', descEL: 'Δροσερά καλοκαίρια.' },
  { icon: 'Sparkles', labelEN: 'Daily Cleaning', labelEL: 'Καθημερινή Καθαριότητα', descEN: 'Neat returns.', descEL: 'Καθαρά δωμάτια.' },
  { icon: 'Bed', labelEN: 'Cotton Linens', labelEL: 'Βαμβακερά Σεντόνια', descEN: 'Crisp beds.', descEL: 'Πεντακάθαρα κρεβάτια.' },
  { icon: 'Coffee', labelEN: 'Coffee & Tea', labelEL: 'Καφές & Τσάι', descEN: 'In every room.', descEL: 'Σε κάθε δωμάτιο.' },
  { icon: 'Clock', labelEN: '24h Check-in', labelEL: '24ωρο Check-in', descEN: 'Late arrivals welcome.', descEL: 'Καλωσορίζουμε τις αργοπορημένες αφίξεις.' },
  { icon: 'Luggage', labelEN: 'Luggage Storage', labelEL: 'Φύλαξη Αποσκευών', descEN: 'Before and after.', descEL: 'Πριν και μετά.' },
  { icon: 'Umbrella', labelEN: 'Rooftop Access', labelEL: 'Πρόσβαση στην Ταράτσα', descEN: 'Sunset included.', descEL: 'Το ηλιοβασίλεμα περιλαμβάνεται.' },
  { icon: 'Wine', labelEN: 'Bar Downstairs', labelEL: 'Μπαρ στο Ισόγειο', descEN: 'Open late.', descEL: 'Ανοιχτό μέχρι αργά.' },
];

export default function Amenities({ data }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const ex = (data?.extras ?? {}) as { items?: { icon: string; labelEN: string; labelEL: string; descEN: string; descEL: string }[] };
  const title = t(data?.titleEN ?? 'Everything you need', data?.titleEL ?? 'Όλα όσα χρειάζεστε');
  const body = t(data?.bodyEN ?? 'Simple, reliable, comfortable.', data?.bodyEL ?? 'Απλό, αξιόπιστο, άνετο.');
  const items = ex.items ?? DEFAULT_ITEMS;

  useEffect(() => {
    const section = sectionRef.current, heading = headingRef.current, grid = gridRef.current;
    if (!section || !heading || !grid) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(heading, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out', scrollTrigger: { trigger: heading, start: 'top 80%', toggleActions: 'play none none reverse' } });
      gsap.fromTo(grid.querySelectorAll('.amenity-item'), { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.06, ease: 'power2.out', scrollTrigger: { trigger: grid, start: 'top 75%', toggleActions: 'play none none reverse' } });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-frogs-dark py-24 lg:py-32 z-[80]">
      <div className="px-6 lg:px-16 max-w-7xl mx-auto">
        <div ref={headingRef} className="mb-16">
          <h2 className="font-heading text-headline text-frogs-text-light mb-4">{title}</h2>
          <p className="font-body text-frogs-text-light/60 text-lg">{body}</p>
        </div>
        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((amenity, i) => {
            const Icon = ICON_MAP[amenity.icon] ?? Wifi;
            return (
              <div key={i} className="amenity-item flex items-start gap-4 p-6 rounded-lg bg-frogs-dark/50 border border-frogs-border/10 hover:border-frogs-gold/30 transition-colors duration-300">
                <div className="w-10 h-10 rounded-full bg-frogs-gold/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-frogs-gold" />
                </div>
                <div>
                  <h3 className="font-body font-medium text-frogs-text-light mb-1">
                    {t(amenity.labelEN, amenity.labelEL) || (amenity as any).label || ''}
                  </h3>
                  <p className="font-body text-sm text-frogs-text-light/60">
                    {t(amenity.descEN, amenity.descEL) || (amenity as any).desc || ''}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
