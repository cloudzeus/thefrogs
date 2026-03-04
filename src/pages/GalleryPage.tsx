"use client";
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { X } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const galleryImages = [
  { src: '/images/hero-athens-bar.jpg', alt: 'Exterior', category: 'exterior' },
  { src: '/images/guesthouse-room.jpg', alt: 'Room Detail', category: 'main-building' },
  { src: '/images/bar-interior.jpg', alt: 'Bar Interior', category: 'bar' },
  { src: '/images/bar-counter.jpg', alt: 'Bar Counter', category: 'bar' },
  { src: '/images/rooftop-skyline.jpg', alt: 'Rooftop View', category: 'exterior' },
  { src: '/images/reservation-room.jpg', alt: 'Room Interior', category: 'main-building' },
  { src: '/images/gallery-1.jpg', alt: 'Athens Street', category: 'exterior' },
  { src: '/images/gallery-2.jpg', alt: 'Room Corner', category: 'main-building' },
  { src: '/images/gallery-3.jpg', alt: 'Bar Detail', category: 'bar' },
  { src: '/images/gallery-4.jpg', alt: 'Rooftop Terrace', category: 'exterior' },
  { src: '/images/gallery-5.jpg', alt: 'Breakfast', category: 'breakfast' },
  { src: '/images/gallery-6.jpg', alt: 'Staircase', category: 'main-building' },
  { src: '/images/room-deluxe-suite.jpg', alt: 'Deluxe Suite', category: 'main-building' },
  { src: '/images/room-deluxe-triple.jpg', alt: 'Deluxe Triple', category: 'main-building' },
  { src: '/images/room-deluxe-double.jpg', alt: 'Deluxe Double', category: 'main-building' },
  { src: '/images/room-loft.jpg', alt: 'Loft', category: 'next-door' },
  { src: '/images/room-sailor.jpg', alt: 'Sailor Room', category: 'next-door' },
  { src: '/images/room-african.jpg', alt: 'African Room', category: 'next-door' },
  { src: '/images/contact-coffee.jpg', alt: 'Coffee', category: 'breakfast' },
];

const categories = [
  { id: 'all', label: 'All' },
  { id: 'main-building', label: 'Main Building' },
  { id: 'next-door', label: 'Next Door' },
  { id: 'bar', label: 'Bar' },
  { id: 'exterior', label: 'Exterior' },
  { id: 'breakfast', label: 'Breakfast' },
];

export default function GalleryPage() {
  const heroRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const filteredImages =
    activeCategory === 'all'
      ? galleryImages
      : galleryImages.filter((img) => img.category === activeCategory);

  useEffect(() => {
    const hero = heroRef.current;
    const grid = gridRef.current;

    if (!hero) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        hero.querySelector('.hero-title'),
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power2.out',
        }
      );

      if (grid) {
        const items = grid.querySelectorAll('.gallery-item');
        gsap.fromTo(
          items,
          { scale: 0.95, y: 20, opacity: 0 },
          {
            scale: 1,
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.05,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: grid,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, [activeCategory]);

  return (
    <div className="bg-frogs-dark min-h-screen">
      {/* Hero */}
      <section
        ref={heroRef}
        className="relative h-[40vh] lg:h-[50vh] flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0">
          <img
            src="/images/gallery-4.jpg"
            alt="Gallery"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-frogs-dark/60" />
        </div>
        <div className="relative z-10 text-center px-6">
          <h1 className="hero-title font-display text-giant text-frogs-text-light">
            GALLERY
          </h1>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="py-8 px-6 lg:px-16 border-b border-frogs-border/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-5 py-2 rounded-full font-body text-sm transition-all duration-300 ${
                  activeCategory === category.id
                    ? 'bg-frogs-gold text-frogs-dark'
                    : 'bg-frogs-dark/50 text-frogs-text-light/70 border border-frogs-border/20 hover:border-frogs-gold/50'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16 lg:py-24 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div
            ref={gridRef}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {filteredImages.map((image, index) => (
              <div
                key={`${image.src}-${index}`}
                className={`gallery-item relative overflow-hidden rounded-lg cursor-pointer group ${
                  index === 0 || index === 5 || index === 10
                    ? 'col-span-2 row-span-2'
                    : ''
                }`}
                onClick={() => setLightboxImage(image.src)}
              >
                <div
                  className={`${
                    index === 0 || index === 5 || index === 10
                      ? 'aspect-square'
                      : 'aspect-[4/3]'
                  }`}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-frogs-dark/30 opacity-100 group-hover:opacity-0 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-frogs-dark/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="font-body text-sm text-frogs-text-light">
                    {image.alt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[100] bg-frogs-dark/95 backdrop-blur-lg flex items-center justify-center p-6"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute top-6 right-6 p-2 text-frogs-text-light/60 hover:text-frogs-text-light transition-colors"
            onClick={() => setLightboxImage(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={lightboxImage}
            alt="Gallery preview"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
