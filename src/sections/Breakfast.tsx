"use client";
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Coffee, Utensils, Sun } from 'lucide-react';
import Image from 'next/image';
import type { HomeSectionRow } from '@/types/home-section';
import { useLanguage } from '@/context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

type Props = { data?: HomeSectionRow | null };

const iconMap: Record<string, React.ElementType> = { Sun, Utensils, Coffee };

type BreakfastExtras = {
  features?: { icon: string; titleEN: string; titleEL: string; descEN: string; descEL: string }[];
};

const DEFAULT_FEATURES = [
  { icon: 'Sun', titleEN: 'Fresh & Healthy', titleEL: 'Φρέσκο & Υγιεινό', descEN: 'Full of energy in every bite', descEL: 'Γεμάτο ενέργεια σε κάθε μπουκιά' },
  { icon: 'Utensils', titleEN: 'Regional Quality', titleEL: 'Τοπική Ποιότητα', descEN: '100% convinced by local produce', descEL: '100% τοπικά προϊόντα' },
  { icon: 'Coffee', titleEN: 'Homemade Delights', titleEL: 'Σπιτικές Λιχουδιές', descEN: 'Fruit spreads, jams & pastries', descEL: 'Μαρμελάδες, γλυκά & αρτοσκευάσματα' },
];

export default function Breakfast({ data }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const image = data?.image ?? 'https://thefrogs.b-cdn.net/1774543513042-greekyoghurt2.webp';
  const label = t(data?.labelEN ?? 'GOOD MORNING', data?.labelEL ?? 'ΚΑΛΗΜΕΡΑ') || '';
  const title = t(data?.titleEN ?? 'THE FROGS BREAKFAST', data?.titleEL ?? 'ΤΟ ΠΡΩΙΝΟ ΤΟΥ THE FROGS') || '';
  const subtitle = t(data?.subtitleEN ?? 'Our kind of wake up call', data?.subtitleEL ?? 'Ο δικός μας τρόπος για να ξυπνήσετε') || '';
  const body = t(data?.bodyEN ?? 'Our rich breakfast offers many delicious options, giving a tasty culinary touch to your holiday.', data?.bodyEL ?? 'Το πλούσιο πρωινό μας προσφέρει πολλές νόστιμες επιλογές, δίνοντας μια γευστική γαστρονομική πινελιά στις διακοπές σας.') || '';
  
  const ex = (data?.extras ?? {}) as BreakfastExtras;
  const features = ex.features ?? DEFAULT_FEATURES;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      if (titleRef.current) {
        gsap.fromTo(titleRef.current, 
          { y: 50, autoAlpha: 0 }, 
          { 
            y: 0, 
            autoAlpha: 1, 
            duration: 0.8, 
            ease: 'power3.out', 
            scrollTrigger: { 
              trigger: titleRef.current, 
              start: 'top 75%', 
              toggleActions: 'play none none reverse' 
            } 
          }
        );
      }
      if (featuresRef.current) {
        gsap.fromTo(featuresRef.current.querySelectorAll('.feature-card'), 
          { y: 40, autoAlpha: 0 }, 
          { 
            y: 0, 
            autoAlpha: 1, 
            duration: 0.6, 
            stagger: 0.15, 
            ease: 'power2.out', 
            scrollTrigger: { 
              trigger: featuresRef.current, 
              start: 'top 65%', 
              toggleActions: 'play none none reverse' 
            } 
          }
        );
      }
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 lg:py-32 px-6 lg:px-16 bg-frogs-dark relative z-40 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-16">
          <div ref={titleRef} className="breakfast-title">
            <span className="label-micro text-frogs-gold mb-4 block">
              {label}
            </span>
            <h3 className="font-display text-4xl lg:text-6xl text-frogs-text-light mb-6">
              {title}
            </h3>
            <p className="font-heading text-2xl lg:text-3xl text-frogs-gold mb-6">
              {subtitle}
            </p>
            <p className="font-body text-frogs-text-light/85 leading-relaxed">
              {body}
            </p>
          </div>
          <div className="relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden">
            <Image
              src={image}
              alt={t("Breakfast at The Frogs", "Πρωινό στο The Frogs")}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-frogs-dark/40 to-transparent" />
          </div>
        </div>
        <div ref={featuresRef} className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = iconMap[f.icon] ?? Coffee;
            return (
              <div key={i} className="feature-card p-8 rounded-2xl bg-frogs-dark/50 border border-frogs-border/10 hover:border-frogs-gold/30 transition-all duration-500 group">
                <div className="w-14 h-14 rounded-full bg-frogs-gold/10 flex items-center justify-center mb-6 group-hover:bg-frogs-gold/20 transition-colors">
                  <Icon className="w-6 h-6 text-frogs-gold" />
                </div>
                <h4 className="font-heading text-xl text-frogs-text-light mb-2">
                  {t(f.titleEN, f.titleEL)}
                </h4>
                <p className="font-body text-sm text-frogs-text-light/80">
                  {t(f.descEN, f.descEL)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
