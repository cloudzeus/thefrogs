"use client";
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

import type { HomeSectionRow } from '@/types/home-section';

gsap.registerPlugin(ScrollTrigger);

type Props = { 
  data?: HomeSectionRow | null;
  dbReviews?: {
    id: string;
    name: string;
    contentEL: string;
    contentEN?: string | null;
    titleEL?: string | null;
    titleEN?: string | null;
    avatar?: string | null;
    order: number;
  }[];
};

export default function Testimonials({ data, dbReviews = [] }: Props) {
  const testimonials = dbReviews;
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t } = useLanguage();

  if (testimonials.length === 0) return null;

  useEffect(() => {
    const section = sectionRef.current;
    const card = cardRef.current;

    if (!section || !card) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        card,
        { y: 28, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
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
        <Quote className="w-32 h-32 lg:w-48 lg:h-48 text-frogs-text-light" aria-hidden="true" />
      </div>

      <div className="px-6 lg:px-16 max-w-4xl mx-auto">
        <div ref={cardRef} className="relative">
          {/* Testimonial Card */}
          <div className="text-center mb-12 grid">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`transition-all duration-500 col-start-1 row-start-1 ${index === currentIndex
                  ? 'opacity-100 translate-x-0 z-10 visible'
                  : 'opacity-0 translate-x-8 pointer-events-none invisible'
                  }`}
              >
                <blockquote className="font-heading text-2xl lg:text-4xl text-frogs-text-light leading-relaxed mb-8">
                  "{t(testimonial.contentEN || "", testimonial.contentEL) || ""}"
                </blockquote>
                <cite className="font-body text-frogs-text-light/80 not-italic">
                  — {testimonial.name}, {t(testimonial.titleEN || "", testimonial.titleEL || "") || ""}
                </cite>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={goToPrev}
              className="p-2 rounded-full border border-frogs-border/30 text-frogs-text-light/85 hover:border-frogs-gold hover:text-frogs-gold transition-colors duration-300"
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
                    : 'bg-frogs-text-light/30 hover:bg-frogs-text-light/50'
                    }`}
                  aria-label={t(`Go to testimonial ${index + 1}`, `Μετάβαση στη μαρτυρία ${index + 1}`)}
                />
              ))}
            </div>

            <button
              onClick={goToNext}
              className="p-2 rounded-full border border-frogs-border/30 text-frogs-text-light/85 hover:border-frogs-gold hover:text-frogs-gold transition-colors duration-300"
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
