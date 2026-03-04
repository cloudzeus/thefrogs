"use client";
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sun, Coffee, Wine, Moon } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const rooftopFeatures = [
  { icon: Coffee, label: 'Morning Coffee', time: '7:00 - 11:00' },
  { icon: Sun, label: 'Sun Bathing', time: '11:00 - 17:00' },
  { icon: Wine, label: 'Sunset Drinks', time: '17:00 - 21:00' },
  { icon: Moon, label: 'Stargazing', time: '21:00 - 00:00' },
];

export default function Rooftop() {
  const sectionRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const media = mediaRef.current;
    const text = textRef.current;
    const features = featuresRef.current;

    if (!section || !media || !text) return;

    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=150%',
          pin: true,
          scrub: 0.8,
        },
      });

      // ENTRANCE (0% - 30%)
      scrollTl
        .fromTo(
          media,
          { x: '-70vw', opacity: 0.5 },
          { x: 0, opacity: 1, ease: 'none' },
          0
        )
        .fromTo(
          media.querySelector('img'),
          { scale: 1.15, x: '6vw' },
          { scale: 1, x: 0, ease: 'none' },
          0
        )
        .fromTo(
          text.querySelector('.title'),
          { x: '50vw', opacity: 0 },
          { x: 0, opacity: 1, ease: 'none' },
          0.05
        )
        .fromTo(
          text.querySelectorAll('.fade-in'),
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.02, ease: 'none' },
          0.12
        );

      // Features animation
      if (features) {
        scrollTl.fromTo(
          features.querySelectorAll('.feature-item'),
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.015, ease: 'none' },
          0.18
        );
      }

      // EXIT (70% - 100%)
      scrollTl
        .fromTo(
          media,
          { x: 0, opacity: 1 },
          { x: '-25vw', opacity: 0, ease: 'power2.in' },
          0.7
        )
        .fromTo(
          text,
          { x: 0, opacity: 1 },
          { x: '25vw', opacity: 0, ease: 'power2.in' },
          0.7
        );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="section-pinned bg-frogs-dark z-[50]"
    >
      <div className="h-full flex">
        {/* Left Media Panel */}
        <div
          ref={mediaRef}
          className="hidden lg:block w-1/2 h-full relative overflow-hidden"
          style={{ willChange: 'transform, opacity' }}
        >
          <img
            src="/images/rooftop-skyline.jpg"
            alt="Rooftop View"
            className="w-full h-full object-cover"
            style={{ willChange: 'transform' }}
          />
          {/* Gradient overlays for depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-frogs-dark/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-frogs-dark/60 via-transparent to-transparent" />
          
          {/* Animated sun glow effect */}
          <div 
            className="absolute top-1/4 right-1/4 w-32 h-32 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(201,168,76,0.3) 0%, transparent 70%)',
              filter: 'blur(20px)',
              animation: 'pulse 4s ease-in-out infinite',
            }}
          />
        </div>

        {/* Right Text Area */}
        <div
          ref={textRef}
          className="w-full lg:w-1/2 h-full flex flex-col justify-center px-6 lg:px-16"
          style={{ willChange: 'transform, opacity' }}
        >
          <span className="label-micro text-frogs-gold mb-4 fade-in">
            UP TOP • PANORAMIC VIEWS
          </span>
          
          <h2 className="title font-display text-display text-frogs-text-light mb-6">
            THE
            <br />
            ROOFTOP
          </h2>

          <p className="font-body text-lg text-frogs-text-light/80 leading-relaxed mb-8 max-w-md fade-in">
            Morning coffee, afternoon sun, evening views. The rooftop is shared,
            quiet, and open—bring a book or a bottle. Watch the Acropolis glow
            as the sun sets over Athens.
          </p>

          {/* Features Grid */}
          <div ref={featuresRef} className="grid grid-cols-2 gap-4 mb-8">
            {rooftopFeatures.map((feature, index) => (
              <div
                key={index}
                className="feature-item p-4 rounded-lg bg-frogs-dark/50 border border-frogs-border/10 hover:border-frogs-gold/30 transition-all duration-300 group"
              >
                <feature.icon className="w-5 h-5 text-frogs-gold mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-body text-sm text-frogs-text-light">
                  {feature.label}
                </p>
                <p className="font-body text-xs text-frogs-text-light/50">
                  {feature.time}
                </p>
              </div>
            ))}
          </div>

          <button className="btn-secondary self-start fade-in">
            View Hours & Access
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }
      `}</style>
    </section>
  );
}
