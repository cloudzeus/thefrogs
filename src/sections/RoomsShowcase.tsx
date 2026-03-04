"use client";
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import Image from 'next/image';
import type { HomeSectionRow } from '@/types/home-section';
import { useLanguage } from '@/context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

type Props = {
  data?: HomeSectionRow | null;
  dbRooms?: {
    id: string;
    name?: string;
    slug?: string;
    nameEN?: string | null;
    nameEL?: string | null;
    description?: string;
    descriptionEN?: string | null;
    descriptionEL?: string | null;
    featuredImage?: string | null;
    images?: { url: string }[];
    sleeps?: number | null;
    squareMeters?: number | null;
  }[];
};

export default function RoomsShowcase({ data, dbRooms }: Props) {
  const rooms = dbRooms || [];
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [activeRoom, setActiveRoom] = useState<number | null>(null);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { t } = useLanguage();

  const label = t(data?.labelEN ?? 'ACCOMMODATIONS', data?.labelEL ?? 'ΚΑΤΑΛΥΜΑΤΑ');
  const sectionTitle = t(data?.titleEN ?? 'OUR ROOMS', data?.titleEL ?? 'ΤΑ ΔΩΜΑΤΙΑ ΜΑΣ');
  const sectionBody = t(data?.bodyEN ?? 'Six individually designed rooms, each with its own character and charm. Find the perfect space for your Athens stay.', data?.bodyEL ?? 'Έξι μοναδικά σχεδιασμένα δωμάτια, καθένα με τον δικό του χαρακτήρα.');
  const ctaLabel = t(data?.ctaLabelEN ?? 'View All Rooms', data?.ctaLabelEL ?? 'Όλα τα Δωμάτια');
  const ctaUrl = data?.ctaUrl ?? '/rooms';

  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const list = listRef.current;

    if (!section || !heading || !list) return;

    const ctx = gsap.context(() => {
      // Heading animation
      gsap.fromTo(
        heading,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: heading,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // List items stagger animation
      const items = list.querySelectorAll('.room-item');
      gsap.fromTo(
        items,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: list,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  // Mouse follow effect — RAF-throttled to avoid forced reflows on every pixel
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let rafId: number | null = null;
    let latestX = 0;
    let latestY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      latestX = e.clientX;
      latestY = e.clientY;

      // Only schedule one RAF per frame — cancel any pending one
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (activeRoom !== null && imageRefs.current[activeRoom]) {
          const img = imageRefs.current[activeRoom];
          if (img) {
            gsap.to(img, {
              x: latestX - 250,
              y: latestY - 175,
              duration: 0.6,
              ease: 'power3.out',
            });
          }
        }
      });
    };

    section.addEventListener('mousemove', handleMouseMove);
    return () => {
      section.removeEventListener('mousemove', handleMouseMove);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [activeRoom]);


  const handleRoomEnter = (index: number) => {
    setActiveRoom(index);
    const img = imageRefs.current[index];
    if (img) {
      gsap.to(img, {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: 'power3.out',
      });
    }
  };

  const handleRoomLeave = (index: number) => {
    const img = imageRefs.current[index];
    if (img) {
      gsap.to(img, {
        opacity: 0,
        scale: 0.8,
        duration: 0.4,
        ease: 'power3.in',
        onComplete: () => {
          if (activeRoom === index) {
            setActiveRoom(null);
          }
        },
      });
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative bg-frogs-dark py-24 lg:py-32 z-[75]"
    >
      {/* Floating Images Container - Fixed position following mouse */}
      <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden hidden lg:block">
        {rooms.map((room, index) => (
          <div
            key={room.id}
            ref={(el) => { imageRefs.current[index] = el; }}
            className="absolute w-[500px] h-[350px] rounded-lg overflow-hidden"
            style={{
              opacity: 0,
              transform: 'scale(0.8)',
              boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.6)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          >
            <Image
              src={room.featuredImage || room.images?.[0]?.url || ''}
              alt={t(room.nameEN, room.nameEL) || room.name || ''}
              fill
              sizes="500px"
              className="object-cover"
              loading="lazy"
            />
            {/* Subtle gold overlay */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-frogs-gold/5 to-transparent mix-blend-overlay"
            />
          </div>
        ))}
      </div>

      <div className="px-6 lg:px-16 max-w-7xl mx-auto relative">
        {/* Heading */}
        <div ref={headingRef} className="mb-16 lg:mb-24">
          <span className="label-micro text-frogs-gold mb-4 block">{label}</span>
          <h2 className="font-display text-5xl lg:text-7xl text-frogs-text-light mb-6">{sectionTitle}</h2>
          <p className="font-body text-lg text-frogs-text-light/60 max-w-xl">{sectionBody}</p>
        </div>

        {/* Rooms List - Mouse follow style */}
        <div ref={listRef} className="space-y-0">
          {rooms.map((room, index) => (
            <Link key={room.id}
              href={`/rooms/${room.slug || room.id}`}
              className="room-item group block relative z-10"
              onMouseEnter={() => handleRoomEnter(index)}
              onMouseLeave={() => handleRoomLeave(index)}
            >
              <div className="flex items-center justify-between py-8 lg:py-10 border-t border-frogs-border/20 transition-all duration-500 group-hover:pl-4 group-hover:bg-frogs-dark/30">
                <div className="flex items-baseline gap-6 lg:gap-12 flex-1">
                  {/* Room Number */}
                  <span className="font-display text-4xl lg:text-6xl text-frogs-text-light/20 group-hover:text-frogs-gold transition-colors duration-500 w-16 lg:w-20">
                    0{index + 1}
                  </span>

                  {/* Room Info */}
                  <div className="flex-1">
                    <h3 className="font-display text-2xl lg:text-4xl text-frogs-text-light group-hover:text-frogs-gold transition-colors duration-500 mb-2">
                      {(t(room.nameEN, room.nameEL) || (room as any).name || '').toUpperCase()}
                    </h3>
                    <p className="font-body text-frogs-text-light/50 group-hover:text-frogs-text-light/70 transition-colors duration-500 max-w-md line-clamp-2">
                      {t(room.descriptionEN, room.descriptionEL) || (room as any).description || ''}
                    </p>
                  </div>
                </div>

                <div className="hidden lg:flex items-center gap-12">
                  <span className="font-body text-sm text-frogs-text-light/40">
                    {room.squareMeters ? `${room.squareMeters} m²` : ''}
                  </span>
                  <span className="font-body text-sm text-frogs-text-light/40">
                    {t(`Up to ${room.sleeps || 2} guests`, `Έως ${room.sleeps || 2} επισκέπτες`)}
                  </span>

                  {/* Arrow button */}
                  <div className="w-12 h-12 rounded-full border border-frogs-border/30 flex items-center justify-center group-hover:border-frogs-gold group-hover:bg-frogs-gold transition-all duration-500">
                    <svg
                      className="w-5 h-5 text-frogs-text-light/50 group-hover:text-frogs-dark transition-colors duration-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {/* Bottom border for last item */}
          <div className="border-t border-frogs-border/20" />
        </div>

        {/* View All Button */}
        <div className="mt-16 text-center">
          <Link href={ctaUrl} className="btn-primary inline-flex">{ctaLabel}</Link>
        </div>
      </div>
    </section>
  );
}
