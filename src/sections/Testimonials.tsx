"use client";
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

import type { HomeSectionRow } from '@/types/home-section';

gsap.registerPlugin(ScrollTrigger);

type Props = { data?: HomeSectionRow | null };

const testimonials = [
  {
    quoteEN: 'Clean, quiet, and perfectly located. The bar downstairs made it feel like we were staying with friends.',
    quoteEL: 'Καθαρό, ήσυχο και σε τέλεια τοποθεσία. Το μπαρ στον κάτω όροφο μας έκανε να νιώθουμε ότι μένουμε με φίλους.',
    author: 'Elena',
    countryEN: 'Spain',
    countryEL: 'Ισπανία',
  },
  {
    quoteEN: 'We came for the price, stayed for the rooftop. The views at sunset are unforgettable.',
    quoteEL: 'Ήρθαμε για την τιμή, μείναμε για την ταράτσα. Η θέα το ηλιοβασίλεμα είναι αξέχαστη.',
    author: 'Marco',
    countryEN: 'Italy',
    countryEL: 'Ιταλία',
  },
  {
    quoteEN: 'Best sleep we had in Greece. The rooms are so peaceful and the staff is wonderful.',
    quoteEL: 'Ο καλύτερος ύπνος που είχαμε στην Ελλάδα. Τα δωμάτια είναι τόσο ήσυχα και το προσωπικό υπέροχο.',
    author: 'Priya',
    countryEN: 'UK',
    countryEL: 'Ηνωμένο Βασίλειο',
  },
  {
    quoteEN: 'Great location and a modern funky guest house. Very clean and nicely decorated. Receptionist waited for us when our ferry was late.',
    quoteEL: 'Εξαιρετική τοποθεσία και ένας μοντέρνος funky ξενώνας. Πολύ καθαρό και όμορφα διακοσμημένο. Η ρεσεψιονίστ μας περίμενε όταν το πλοίο μας καθυστέρησε.',
    author: 'Yooper',
    countryEN: 'Switzerland',
    countryEL: 'Ελβετία',
  },
  {
    quoteEN: 'Kind staff, clean room, good coffee and breakfast. The location is great—walking distance to everything.',
    quoteEL: 'Ευγενικό προσωπικό, καθαρό δωμάτιο, καλός καφές και πρωινό. Η τοποθεσία είναι εξαιρετική—σε κοντινή απόσταση με τα πόδια από τα πάντα.',
    author: 'Dimitar',
    countryEN: 'Bulgaria',
    countryEL: 'Βουλγαρία',
  },
];

export default function Testimonials({ data }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t } = useLanguage();

  useEffect(() => {
    const section = sectionRef.current;
    const card = cardRef.current;

    if (!section || !card) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        card,
        { y: 28, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  // Auto-slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <section
      ref={sectionRef}
      className="relative bg-frogs-dark py-24 lg:py-32 z-[80]"
    >
      {/* Quote Mark Background */}
      <div className="absolute top-16 left-8 lg:left-16 opacity-[0.04]">
        <Quote className="w-32 h-32 lg:w-48 lg:h-48 text-frogs-text-light" />
      </div>

      <div className="px-6 lg:px-16 max-w-4xl mx-auto">
        <div ref={cardRef} className="relative">
          {/* Testimonial Card */}
          <div className="text-center mb-12 grid">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`transition-all duration-500 col-start-1 row-start-1 ${index === currentIndex
                  ? 'opacity-100 translate-x-0 z-10'
                  : 'opacity-0 translate-x-8 pointer-events-none'
                  }`}
              >
                <blockquote className="font-heading text-2xl lg:text-4xl text-frogs-text-light leading-relaxed mb-8">
                  "{t(testimonial.quoteEN, testimonial.quoteEL) || (testimonial as any).quote || ''}"
                </blockquote>
                <cite className="font-body text-frogs-text-light/60 not-italic">
                  — {testimonial.author}, {t(testimonial.countryEN, testimonial.countryEL) || (testimonial as any).country || ''}
                </cite>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={goToPrev}
              className="p-2 rounded-full border border-frogs-border/30 text-frogs-text-light/60 hover:border-frogs-gold hover:text-frogs-gold transition-colors duration-300"
              aria-label={t("Previous testimonial", "Προηγούμενη μαρτυρία")}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex
                    ? 'bg-frogs-gold w-6'
                    : 'bg-frogs-border/30 hover:bg-frogs-border/50'
                    }`}
                  aria-label={t(`Go to testimonial ${index + 1}`, `Μετάβαση στη μαρτυρία ${index + 1}`)}
                />
              ))}
            </div>

            <button
              onClick={goToNext}
              className="p-2 rounded-full border border-frogs-border/30 text-frogs-text-light/60 hover:border-frogs-gold hover:text-frogs-gold transition-colors duration-300"
              aria-label={t("Next testimonial", "Επόμενη μαρτυρία")}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
