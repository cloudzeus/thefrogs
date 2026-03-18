"use client";
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Clock,
  Calendar,
  Sparkles,
  Baby,
  Heart,
  Wifi,
  Laptop,
  Car,
  MapPin,
  Bus,
  Briefcase,
  Shirt,
  Phone,
  Coffee,
  Sun,
  Moon,
  AlertCircle,
  Package,
  Star,
  Home,
  Settings,
  Bell,
  Key,
  Utensils,
  type LucideIcon,
} from 'lucide-react';
import type { DirectoryItem } from '@/app/lib/actions/directory';
import { useLanguage } from '@/context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

// Map icon name strings → Lucide components
const ICON_MAP: Record<string, LucideIcon> = {
  Clock, Calendar, Sparkles, Baby, Heart, Wifi, Laptop, Car,
  MapPin, Bus, Briefcase, Shirt, Phone, Coffee, Sun, Moon,
  AlertCircle, Package, Star, Home, Settings, Bell, Key, Utensils,
};

const emergencyInfo = {
  internationalCode: '0030',
  emergencyNumber: '112',
  fireService: '199',
};

export default function Directory({
  pageMeta,
  items = [],
}: {
  pageMeta?: any;
  items?: DirectoryItem[];
}) {
  const { t } = useLanguage();
  const heroRef = useRef<HTMLElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const emergencyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const intro = introRef.current;
    const grid = gridRef.current;
    const emergency = emergencyRef.current;

    if (!hero) return;

    const ctx = gsap.context(() => {
      const heroTitle = hero.querySelector('.hero-title');
      if (heroTitle) {
        gsap.fromTo(heroTitle, { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' });
      }
      if (intro) {
        gsap.fromTo(intro, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: intro, start: 'top 80%', toggleActions: 'play none none reverse' } });
      }
      if (grid) {
        const itemEls = grid.querySelectorAll('.directory-item');
        itemEls.forEach((item, index) => {
          gsap.fromTo(item, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, delay: index * 0.05, ease: 'power3.out', scrollTrigger: { trigger: item, start: 'top 90%', toggleActions: 'play none none reverse' } });
        });
      }
      if (emergency) {
        gsap.fromTo(emergency, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: emergency, start: 'top 85%', toggleActions: 'play none none reverse' } });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="bg-frogs-dark min-h-screen">
      {/* Hero */}
      <section ref={heroRef} className="relative h-[50vh] lg:h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          {pageMeta?.heroVideo ? (
            <video autoPlay loop muted playsInline className="w-full h-full object-cover" title={t("Guesthouse information overview", "Επισκόπηση πληροφοριών ξενώνα")}>
              <source src={pageMeta.heroVideo} type="video/mp4" />
            </video>
          ) : (
            <img
              src={pageMeta?.heroImage || "/images/guesthouse-room.jpg"}
              alt={t("Detailed directory of services and amenities at The Frogs Guesthouse", "Λεπτομερής οδηγός υπηρεσιών και παροχών στον ξενώνα The Frogs")}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-frogs-dark/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-frogs-dark via-transparent to-transparent" />
        </div>
        <div className="relative z-10 text-center px-6">
          <span className="label-micro text-frogs-gold mb-4 block underline decoration-frogs-gold/30 underline-offset-8">
            {t("INFORMATION", "ΠΛΗΡΟΦΟΡΙΕΣ")}
          </span>
          <h1 className="hero-title font-display text-4xl lg:text-7xl text-frogs-text-light mb-4 flex flex-col items-center">
            <span className="block italic">{t("GUESTHOUSE", "ΟΔΗΓΟΣ")}</span>
            <span className="text-frogs-gold block">{t("DIRECTORY", "ΞΕΝΩΝΑ")}</span>
          </h1>
        </div>
      </section>

      {/* Introduction */}
      <section ref={introRef} className="py-20 lg:py-32 px-6 lg:px-16">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-heading text-xl lg:text-2xl text-frogs-text-light/80 leading-relaxed mb-8">
            {t("Dear Guests,", "Αγαπητοί Επισκέπτες,")}
          </p>
          <p className="font-body text-frogs-text-light/60 leading-relaxed mb-6">
            {t(
              "We are pleased to welcome you to the Frogs Guesthouse. In this directory, you will find helpful information about our services. In case you need any further assistance do not hesitate to contact the Reception. Our friendly staff is committed to ensure an enjoyable and comfortable Athenian stay.",
              "Με χαρά σας καλωσορίζουμε στον ξενώνα The Frogs. Σε αυτόν τον οδηγό, θα βρείτε χρήσιμες πληροφορίες για τις υπηρεσίες μας. Σε περίπτωση που χρειαστείτε οποιαδήποτε περαιτέρω βοήθεια, μη διστάσετε να επικοινωνήσετε με τη Ρεσεψιόν. Το φιλικό προσωπικό μας είναι αφοσιωμένο στο να διασφαλίσει μια ευχάριστη και άνετη διαμονή στην Αθήνα."
            )}
          </p>
          <p className="font-heading text-lg text-frogs-gold italic">
            {t("On behalf of the Management and the Staff,", "Εκ μέρους της Διεύθυνσης και του Προσωπικού,")}
            <br />
            {t("We wish you a pleasant stay!", "Σας ευχόμαστε μια ευχάριστη διαμονή!")}
          </p>
        </div>
      </section>

      {/* Directory Grid */}
      <section className="py-20 lg:py-32 px-6 lg:px-16 bg-frogs-dark/50">
        <div className="max-w-7xl mx-auto">
          <div ref={gridRef} className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {items.map((item) => {
              const IconComp = ICON_MAP[item.icon ?? ''] ?? Package;
              return (
                <div
                  key={item.id}
                  className="directory-item group p-6 lg:p-8 rounded-2xl bg-frogs-dark/50 border border-frogs-border/10 hover:border-frogs-gold/30 transition-all duration-500 hover:bg-frogs-dark/70"
                >
                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 rounded-xl bg-frogs-gold/10 flex items-center justify-center flex-shrink-0 group-hover:bg-frogs-gold/20 transition-colors duration-300">
                      <IconComp className="w-6 h-6 text-frogs-gold" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-xl lg:text-2xl text-frogs-text-light mb-3 group-hover:text-frogs-gold transition-colors duration-300">
                        {t(item.titleEN ?? item.titleEL, item.titleEL).toUpperCase()}
                      </h3>
                      <p className="font-body text-sm lg:text-base text-frogs-text-light/60 leading-relaxed">
                        {t(item.descriptionEN ?? item.descriptionEL ?? '', item.descriptionEL ?? '')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Emergency Information */}
      <section ref={emergencyRef} className="py-20 lg:py-32 px-6 lg:px-16">
        <div className="max-w-5xl mx-auto">
          <div className="p-8 lg:p-12 rounded-2xl bg-gradient-to-br from-frogs-gold/10 to-frogs-gold/5 border border-frogs-gold/20">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-frogs-gold/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-frogs-gold" />
              </div>
              <h3 className="font-display text-2xl lg:text-3xl text-frogs-text-light">
                {t("EMERGENCY INFORMATION", "ΠΛΗΡΟΦΟΡΙΕΣ ΕΚΤΑΚΤΗΣ ΑΝΑΓΚΗΣ")}
              </h3>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="text-center p-6 rounded-xl bg-frogs-dark/50">
                <Phone className="w-6 h-6 text-frogs-gold mx-auto mb-3" />
                <p className="label-micro text-frogs-text-light/50 mb-2">{t("INTERNATIONAL CODE", "ΔΙΕΘΝΗΣ ΚΩΔΙΚΟΣ")}</p>
                <p className="font-display text-2xl text-frogs-text-light">{emergencyInfo.internationalCode}</p>
              </div>
              <div className="text-center p-6 rounded-xl bg-frogs-dark/50">
                <AlertCircle className="w-6 h-6 text-frogs-gold mx-auto mb-3" />
                <p className="label-micro text-frogs-text-light/50 mb-2">{t("EMERGENCY NUMBER", "ΑΡΙΘΜΟΣ ΕΚΤΑΚΤΗΣ ΑΝΑΓΚΗΣ")}</p>
                <p className="font-display text-2xl text-frogs-text-light">{emergencyInfo.emergencyNumber}</p>
              </div>
              <div className="text-center p-6 rounded-xl bg-frogs-dark/50">
                <Moon className="w-6 h-6 text-frogs-gold mx-auto mb-3" />
                <p className="label-micro text-frogs-text-light/50 mb-2">{t("ATHENS FIRE SERVICE", "ΠΥΡΟΣΒΕΣΤΙΚΗ ΑΘΗΝΩΝ")}</p>
                <p className="font-display text-2xl text-frogs-text-light">{emergencyInfo.fireService}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
