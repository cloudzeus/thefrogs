"use client";
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Coffee, Wine, Clock, Utensils, Sun, Moon } from 'lucide-react';
import type { HomeSectionRow } from '@/types/home-section';
import { useLanguage } from '@/context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

type Props = { data?: HomeSectionRow | null };

type BarExtras = {
  breakfastImage?: string;
  breakfastLabelEN?: string;
  breakfastLabelEL?: string;
  breakfastTitleEN?: string;
  breakfastTitleEL?: string;
  breakfastSubtitleEN?: string;
  breakfastSubtitleEL?: string;
  breakfastBodyEN?: string;
  breakfastBodyEL?: string;
  breakfastFeatures?: { icon: string; titleEN: string; titleEL: string; descEN: string; descEL: string }[];
  cocktailsImage?: string;
  cocktailsLabelEN?: string;
  cocktailsLabelEL?: string;
  cocktailsTitleEN?: string;
  cocktailsTitleEL?: string;
  cocktailsSubtitleEN?: string;
  cocktailsSubtitleEL?: string;
  cocktailsBodyEN?: string;
  cocktailsBodyEL?: string;
  cocktailTagsEN?: string[];
  cocktailTagsEL?: string[];
  hours?: { icon: string; labelEN: string; labelEL: string; sublabelEN?: string; sublabelEL?: string; time: string; descEN: string; descEL: string }[];
  galleryImages?: string[];
};

const iconMap: Record<string, React.ElementType> = { Sun, Utensils, Coffee, Wine, Clock, Moon };

const DEFAULT_EXTRAS: Required<BarExtras> = {
  breakfastImage: '/images/Th_Frogs_96.jpg',
  breakfastLabelEN: 'GOOD MORNING',
  breakfastLabelEL: 'ΚΑΛΗΜΕΡΑ',
  breakfastTitleEN: 'THE FROGS BREAKFAST',
  breakfastTitleEL: 'ΤΟ ΠΡΩΙΝΟ ΤΟΥ THE FROGS',
  breakfastSubtitleEN: 'Our kind of wake up call',
  breakfastSubtitleEL: 'Ο δικός μας τρόπος για να ξυπνήσετε',
  breakfastBodyEN: 'Our rich breakfast offers many delicious options, giving a tasty culinary touch to your holiday.',
  breakfastBodyEL: 'Το πλούσιο πρωινό μας προσφέρει πολλές νόστιμες επιλογές, δίνοντας μια γευστική γαστρονομική πινελιά στις διακοπές σας.',
  breakfastFeatures: [
    { icon: 'Sun', titleEN: 'Fresh & Healthy', titleEL: 'Φρέσκο & Υγιεινό', descEN: 'Full of energy in every bite', descEL: 'Γεμάτο ενέργεια σε κάθε μπουκιά' },
    { icon: 'Utensils', titleEN: 'Regional Quality', titleEL: 'Τοπική Ποιότητα', descEN: '100% convinced by local produce', descEL: '100% τοπικά προϊόντα' },
    { icon: 'Coffee', titleEN: 'Homemade Delights', titleEL: 'Σπιτικές Λιχουδιές', descEN: 'Fruit spreads, jams & pastries', descEL: 'Μαρμελάδες, γλυκά & αρτοσκευάσματα' },
  ],
  cocktailsImage: '/images/Th_Frogs_98.jpg',
  cocktailsLabelEN: 'EVENING VIBES',
  cocktailsLabelEL: 'ΒΡΑΔΙΝΗ ΑΤΜΟΣΦΑΙΡΑ',
  cocktailsTitleEN: 'THE FROGS COCKTAILS',
  cocktailsTitleEL: 'ΤΑ ΚΟΚΤΕΪΛ ΤΟΥ THE FROGS',
  cocktailsSubtitleEN: 'Meet our delicious ways',
  cocktailsSubtitleEL: 'Γνωρίστε τις γευστικές μας προτάσεις',
  cocktailsBodyEN: 'Cocktails at Frogs Guest House focus on all-time classic recipes, while the use of fresh ingredients is our signature.',
  cocktailsBodyEL: 'Τα κοκτέιλ στο The Frogs επικεντρώνονται σε διαχρονικές κλασικές συνταγές, ενώ η χρήση φρέσκων υλικών είναι η υπογραφή μας.',
  cocktailTagsEN: ['Classic Recipes', 'Fresh Ingredients', 'Urban Vibes'],
  cocktailTagsEL: ['Κλασικές Συνταγές', 'Φρέσκα Υλικά', 'Urban Vibes'],
  hours: [
    { icon: 'Coffee', labelEN: 'Breakfast', labelEL: 'Πρωινό', sublabelEN: 'Start your day right', sublabelEL: 'Ξεκινήστε σωστά τη μέρα σας', time: '08:00 - 12:00', descEN: 'Daily — Enjoy our delicious breakfast with regional foodstuffs', descEL: 'Καθημερινά — Απολαύστε το νόστιμο πρωινό μας με τοπικά προϊόντα' },
    { icon: 'Wine', labelEN: 'All Day Bar', labelEL: 'All Day Bar', sublabelEN: 'Coffee, snacks & treats', sublabelEL: 'Καφές, σνακ & λιχουδιές', time: 'ALL DAY', descEN: 'Browse through our wide selection of mouthwatering snacks and sweet treats', descEL: 'Περιηγηθείτε στη μεγάλη ποικιλιλία από λαχταριστά σνακ και γλυκά' },
  ],
  galleryImages: ['/images/Th_Frogs_86.jpg', '/images/Th_Frogs_94.jpg', '/images/Th_Frogs_96.jpg', '/images/Th_Frogs_98.jpg'],
};

export default function Bar({ data }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const breakfastRef = useRef<HTMLDivElement>(null);
  const cocktailsRef = useRef<HTMLDivElement>(null);
  const hoursRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const { t, language } = useLanguage();

  const image = data?.image ?? '/images/Th_Frogs_86.jpg';
  const label = t(data?.labelEN ?? 'EST. 2018', data?.labelEL ?? 'EST. 2018');
  const title = t(data?.titleEN ?? 'THE BAR', data?.titleEL ?? 'ΤΟ BAR');
  const subtitle = t(data?.subtitleEN ?? 'Coffee • Food • Cocktails — Where your day in Athens begins and ends', data?.subtitleEL ?? 'Καφές • Φαγητό • Κοκτέιλ — Εκεί που η μέρα σας στην Αθήνα ξεκινά και τελειώνει');

  const ex = { ...DEFAULT_EXTRAS, ...((data?.extras ?? {}) as BarExtras) };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      if (heroRef.current) {
        gsap.fromTo(heroRef.current.querySelector('.hero-image'), { scale: 1.1, opacity: 0.7 }, { scale: 1, opacity: 1, duration: 1.2, ease: 'power2.out', scrollTrigger: { trigger: heroRef.current, start: 'top 80%', toggleActions: 'play none none reverse' } });
        gsap.fromTo(heroRef.current.querySelector('.hero-content'), { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: heroRef.current, start: 'top 70%', toggleActions: 'play none none reverse' } });
      }
      if (breakfastRef.current) {
        gsap.fromTo(breakfastRef.current.querySelector('.breakfast-title'), { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: breakfastRef.current, start: 'top 75%', toggleActions: 'play none none reverse' } });
        gsap.fromTo(breakfastRef.current.querySelectorAll('.feature-card'), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: 'power2.out', scrollTrigger: { trigger: breakfastRef.current, start: 'top 65%', toggleActions: 'play none none reverse' } });
      }
      if (cocktailsRef.current) {
        gsap.fromTo(cocktailsRef.current.querySelector('.cocktails-content'), { x: -60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: cocktailsRef.current, start: 'top 70%', toggleActions: 'play none none reverse' } });
        gsap.fromTo(cocktailsRef.current.querySelector('.cocktails-image'), { x: 60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: cocktailsRef.current, start: 'top 70%', toggleActions: 'play none none reverse' } });
      }
      if (hoursRef.current) {
        gsap.fromTo(hoursRef.current.querySelectorAll('.hour-card'), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out', scrollTrigger: { trigger: hoursRef.current, start: 'top 75%', toggleActions: 'play none none reverse' } });
      }
      if (galleryRef.current) {
        gsap.fromTo(galleryRef.current.querySelectorAll('.gallery-item'), { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out', scrollTrigger: { trigger: galleryRef.current, start: 'top 75%', toggleActions: 'play none none reverse' } });
      }
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-frogs-dark z-40">
      {/* Hero */}
      <div ref={heroRef} className="relative h-[70vh] lg:h-[80vh] overflow-hidden">
        <div className="hero-image absolute inset-0">
          <img src={image} alt={t("The Frogs Bar", "Το Bar του The Frogs")} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-frogs-dark via-frogs-dark/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-frogs-dark/70 to-transparent" />
        </div>
        <div className="hero-content absolute bottom-0 left-0 right-0 p-6 lg:p-16">
          <div className="max-w-4xl">
            <span className="label-micro text-frogs-gold mb-4 block">{label}</span>
            <h2 className="font-display text-5xl lg:text-7xl text-frogs-text-light mb-4">{title}</h2>
            <p className="font-body text-lg lg:text-xl text-frogs-text-light/80 max-w-xl">{subtitle}</p>
          </div>
        </div>
      </div>

      {/* Breakfast */}
      <div ref={breakfastRef} className="py-20 lg:py-32 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-16">
            <div className="breakfast-title">
              <span className="label-micro text-frogs-gold mb-4 block">
                {t(ex.breakfastLabelEN, ex.breakfastLabelEL) || (ex as any).breakfastLabel || ''}
              </span>
              <h3 className="font-display text-4xl lg:text-6xl text-frogs-text-light mb-6">
                {t(ex.breakfastTitleEN, ex.breakfastTitleEL) || (ex as any).breakfastTitle || ''}
              </h3>
              <p className="font-heading text-2xl lg:text-3xl text-frogs-gold mb-6">
                {t(ex.breakfastSubtitleEN, ex.breakfastSubtitleEL) || (ex as any).breakfastSubtitle || ''}
              </p>
              <p className="font-body text-frogs-text-light/70 leading-relaxed">
                {t(ex.breakfastBodyEN, ex.breakfastBodyEL) || (ex as any).breakfastBody || ''}
              </p>
            </div>
            <div className="relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden">
              <img src={ex.breakfastImage} alt={t("Breakfast at The Frogs", "Πρωινό στο The Frogs")} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-frogs-dark/40 to-transparent" />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {ex.breakfastFeatures.map((f, i) => {
              const Icon = iconMap[f.icon] ?? Coffee;
              return (
                <div key={i} className="feature-card p-8 rounded-2xl bg-frogs-dark/50 border border-frogs-border/10 hover:border-frogs-gold/30 transition-all duration-500 group">
                  <div className="w-14 h-14 rounded-full bg-frogs-gold/10 flex items-center justify-center mb-6 group-hover:bg-frogs-gold/20 transition-colors">
                    <Icon className="w-6 h-6 text-frogs-gold" />
                  </div>
                  <h4 className="font-heading text-xl text-frogs-text-light mb-2">
                    {t(f.titleEN, f.titleEL) || (f as any).title || ''}
                  </h4>
                  <p className="font-body text-sm text-frogs-text-light/60">
                    {t(f.descEN, f.descEL) || (f as any).desc || ''}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cocktails */}
      <div ref={cocktailsRef} className="py-20 lg:py-32 px-6 lg:px-16 bg-frogs-dark/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="cocktails-content order-2 lg:order-1">
              <span className="label-micro text-frogs-gold mb-4 block">
                {t(ex.cocktailsLabelEN, ex.cocktailsLabelEL) || (ex as any).cocktailsLabel || ''}
              </span>
              <h3 className="font-display text-4xl lg:text-6xl text-frogs-text-light mb-6">
                {t(ex.cocktailsTitleEN, ex.cocktailsTitleEL) || (ex as any).cocktailsTitle || ''}
              </h3>
              <p className="font-heading text-2xl lg:text-3xl text-frogs-gold mb-6">
                {t(ex.cocktailsSubtitleEN, ex.cocktailsSubtitleEL) || (ex as any).cocktailsSubtitle || ''}
              </p>
              <p className="font-body text-frogs-text-light/70 leading-relaxed mb-8">
                {t(ex.cocktailsBodyEN, ex.cocktailsBodyEL) || (ex as any).cocktailsBody || ''}
              </p>
              <div className="flex flex-wrap gap-4">
                {(language === 'GR' ? ex.cocktailTagsEL : ex.cocktailTagsEN).map((tag, i) => (
                  <span key={i} className="px-4 py-2 rounded-full bg-frogs-gold/10 text-frogs-gold text-sm font-body">{tag}</span>
                ))}
              </div>
            </div>
            <div className="cocktails-image order-1 lg:order-2 relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden">
              <img src={ex.cocktailsImage} alt={t("Cocktails at The Frogs", "Κοκτέιλ στο The Frogs")} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-frogs-dark/40 to-transparent" />
            </div>
          </div>
        </div>
      </div>

      {/* Hours */}
      <div ref={hoursRef} className="py-20 lg:py-32 px-6 lg:px-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="label-micro text-frogs-gold mb-4 block">{t("VISIT US", "ΕΠΙΣΚΕΦΘΕΙΤΕ ΜΑΣ")}</span>
            <h3 className="font-display text-4xl lg:text-5xl text-frogs-text-light">{t("OPENING HOURS", "ΩΡΑΡΙΟ ΛΕΙΤΟΥΡΓΙΑΣ")}</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {ex.hours.map((h, i) => {
              const Icon = iconMap[h.icon] ?? Coffee;
              return (
                <div key={i} className={`hour-card p-8 rounded-2xl border ${i === 0 ? 'bg-frogs-gold/5 border-frogs-gold/20' : 'bg-frogs-dark/50 border-frogs-border/10'}`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${i === 0 ? 'bg-frogs-gold/20' : 'bg-frogs-gold/10'}`}>
                      <Icon className="w-6 h-6 text-frogs-gold" />
                    </div>
                    <div>
                      <h4 className="font-heading text-xl text-frogs-text-light">
                        {t(h.labelEN, h.labelEL) || (h as any).label || ''}
                      </h4>
                      {t(h.sublabelEN || "", h.sublabelEL || "") && (
                        <p className="font-body text-sm text-frogs-text-light/50">
                          {t(h.sublabelEN || "", h.sublabelEL || "") || (h as any).sublabel || ''}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-frogs-gold">
                    <Clock className="w-4 h-4" />
                    <span className="font-display text-2xl">{h.time}</span>
                  </div>
                  <p className="font-body text-sm text-frogs-text-light/60 mt-4">
                    {t(h.descEN, h.descEL) || (h as any).desc || ''}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Gallery */}
      {ex.galleryImages.length > 0 && (
        <div ref={galleryRef} className="py-20 lg:py-32 px-6 lg:px-16 bg-frogs-dark/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <span className="label-micro text-frogs-gold mb-4 block">{t("TAKE A LOOK", "ΜΙΑ ΜΑΤΙΑ")}</span>
              <h3 className="font-display text-4xl lg:text-5xl text-frogs-text-light">{t("BAR GALLERY", "ΓΚΑΛΕΡΙ ΤΟΥ BAR")}</h3>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {ex.galleryImages.map((img, i) => (
                <div key={i} className={`gallery-item relative overflow-hidden rounded-xl group ${i === 0 ? 'col-span-2 row-span-2' : ''}`}>
                  <div className={i === 0 ? 'aspect-square' : 'aspect-[4/3]'}>
                    <img src={img} alt={t(`Bar interior ${i + 1}`, `Εσωτερικό του bar ${i + 1}`)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <div className="absolute inset-0 bg-frogs-dark/30 opacity-100 group-hover:opacity-0 transition-opacity duration-500" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
