"use client";
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';

gsap.registerPlugin(ScrollTrigger);

export default function ReservationCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const media = mediaRef.current;
    const text = textRef.current;

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

      // ENTRANCE (0% - 30%)
      scrollTl
        .fromTo(
          media,
          { x: '-60vw' },
          { x: 0, ease: 'none' },
          0
        )
        .fromTo(
          media.querySelector('img'),
          { scale: 1.1, x: '4vw' },
          { scale: 1, x: 0, ease: 'none' },
          0
        )
        .fromTo(
          text.querySelector('.title'),
          { x: '40vw', opacity: 0 },
          { x: 0, opacity: 1, ease: 'none' },
          0.08
        )
        .fromTo(
          text.querySelectorAll('.fade-in'),
          { y: 28, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.02, ease: 'none' },
          0.16
        );

      // EXIT (70% - 100%)
      scrollTl
        .fromTo(
          media,
          { x: 0, opacity: 1 },
          { x: '-18vw', opacity: 0, ease: 'power2.in' },
          0.7
        )
        .fromTo(
          text,
          { x: 0, opacity: 1 },
          { x: '18vw', opacity: 0, ease: 'power2.in' },
          0.7
        );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="section-pinned bg-frogs-dark z-[70]"
    >
      <div className="h-full flex">
        {/* Left Media Panel */}
        <div
          ref={mediaRef}
          className="hidden lg:block w-1/2 h-full relative overflow-hidden"
          style={{ willChange: 'transform, opacity' }}
        >
          <img
            src="/images/reservation-room.jpg"
            alt="Reservation Room"
            className="w-full h-full object-cover"
            style={{ willChange: 'transform' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-frogs-dark/30" />
        </div>

        {/* Right Text Area */}
        <div
          ref={textRef}
          className="w-full lg:w-1/2 h-full flex flex-col justify-center px-6 lg:px-16"
          style={{ willChange: 'transform, opacity' }}
        >
          <span className="label-micro text-frogs-gold mb-4 fade-in">
            BOOK DIRECT
          </span>
          
          <h2 className="title font-display text-display text-frogs-text-light mb-8">
            MAKE YOUR
            <br />
            RESERVATION
          </h2>

          <p className="font-body text-lg text-frogs-text-light/80 leading-relaxed mb-8 max-w-md fade-in">
            Best rates when you book direct. Questions? Message us and we'll
            reply within the hour.
          </p>

          <div className="flex flex-wrap gap-4 fade-in">
            <a
              href="https://thefrogsguesthouse.reserve-online.net/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Book a Room
            </a>
            <Link href="/contact" className="btn-secondary">
              Ask a Question
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
