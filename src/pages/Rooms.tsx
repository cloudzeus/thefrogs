"use client";
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { Check, Users, Maximize, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

const rooms = [
  {
    id: 'deluxe-suite',
    labelEN: 'MAIN BUILDING • EST. 2018',
    labelEL: 'ΚΕΝΤΡΙΚΟ ΚΤΙΡΙΟ • ΙΔΡ. 2018',
    nameEN: 'DELUXE SUITE',
    nameEL: 'DELUXE ΣΟΥΙΤΑ',
    size: 30,
    maxGuests: 4,
    descriptionEN:
      'Our Deluxe Suite has a separate room with a king size bed and a living room with 2 Single Sofa Beds. Can accommodate up to 4 people and has an ensuite bathroom with a separate shower room.',
    descriptionEL:
      'Η Deluxe Σουίτα μας διαθέτει ξεχωριστό υπνοδωμάτιο με king size κρεβάτι και σαλόνι με 2 μονούς καναπέδες-κρεβάτια. Μπορεί να φιλοξενήσει έως 4 άτομα και διαθέτει ιδιωτικό μπάνιο με ξεχωριστό ντους.',
    image: '/images/room-deluxe-suite.jpg',
    facilitiesEN: [
      'Minibar', 'Safety Deposit Box', 'Air Conditioning', 'Terrace',
      '2 Single Sofa Beds', 'Free WiFi', 'Hairdryer',
    ],
    facilitiesEL: [
      'Minibar', 'Χρηματοκιβώτιο', 'Κλιματισμός', 'Βεράντα',
      '2 Μονοί Καναπέδες-Κρεβάτια', 'Δωρεάν WiFi', 'Στεγνωτήρας μαλλιών',
    ],
    priceEN: 'From €120/night',
    priceEL: 'Από €120/νύχτα',
  },
  {
    id: 'deluxe-triple',
    labelEN: 'MAIN BUILDING • EST. 2018',
    labelEL: 'ΚΕΝΤΡΙΚΟ ΚΤΙΡΙΟ • ΙΔΡ. 2018',
    nameEN: 'DELUXE TRIPLE ROOM',
    nameEL: 'DELUXE ΤΡΙΚΛΙΝΟ ΔΩΜΑΤΙΟ',
    size: 26,
    maxGuests: 3,
    descriptionEN:
      'Our Deluxe Triple room has a king size bed, a single sofa bed and an ensuite bathroom.',
    descriptionEL:
      'Το Deluxe Τρίκλινο δωμάτιό μας διαθέτει ένα king size κρεβάτι, έναν μονό καναπέ-κρεβάτι και ιδιωτικό μπάνιο.',
    image: '/images/room-deluxe-triple.jpg',
    facilitiesEN: [
      'Minibar', 'Safety Deposit Box', 'Air Conditioning',
      'Single Sofa Bed', 'Free WiFi', 'Hairdryer',
    ],
    facilitiesEL: [
      'Minibar', 'Χρηματοκιβώτιο', 'Κλιματισμός',
      'Μονός Καναπές-Κρεβάτι', 'Δωρεάν WiFi', 'Στεγνωτήρας μαλλιών',
    ],
    priceEN: 'From €95/night',
    priceEL: 'Από €95/νύχτα',
  },
  {
    id: 'deluxe-double',
    labelEN: 'MAIN BUILDING • EST. 2018',
    labelEL: 'ΚΕΝΤΡΙΚΟ ΚΤΙΡΙΟ • ΙΔΡ. 2018',
    nameEN: 'DELUXE DOUBLE ROOM',
    nameEL: 'DELUXE ΔΙΚΛΙΝΟ ΔΩΜΑΤΙΟ',
    size: 22,
    maxGuests: 2,
    descriptionEN:
      'Our Deluxe Double room has a king size bed and an ensuite bathroom.',
    descriptionEL:
      'Το Deluxe Δίκλινο δωμάτιό μας διαθέτει ένα king size κρεβάτι και ιδιωτικό μπάνιο.',
    image: '/images/room-deluxe-double.jpg',
    facilitiesEN: [
      'Minibar', 'Safety Deposit Box', 'Air Conditioning',
      'Free WiFi', 'Hairdryer',
    ],
    facilitiesEL: [
      'Minibar', 'Χρηματοκιβώτιο', 'Κλιματισμός',
      'Δωρεάν WiFi', 'Στεγνωτήρας μαλλιών',
    ],
    priceEN: 'From €85/night',
    priceEL: 'Από €85/νύχτα',
  },
  {
    id: 'loft',
    labelEN: 'NEXT DOOR • NEW APARTMENTS',
    labelEL: 'ΔΙΠΛΑ • ΝΕΑ ΔΙΑΜΕΡΙΣΜΑΤΑ',
    nameEN: 'THE LOFT',
    nameEL: 'ΤΟ LOFT',
    size: 37,
    maxGuests: 4,
    descriptionEN:
      'This one-story loft features a king-size bed on the upper level and a spacious living room with a double sofa bed on the lower level.',
    descriptionEL:
      'Αυτό το loft διαθέτει ένα king-size κρεβάτι στο επάνω επίπεδο και ένα ευρύχωρο σαλόνι με διπλό καναπέ-κρεβάτι στο κάτω επίπεδο.',
    image: '/images/room-loft.jpg',
    facilitiesEN: [
      'Minibar', 'Safety Deposit Box', 'Air Conditioning',
      'Double Sofa Bed', 'Free WiFi', 'Hairdryer',
    ],
    facilitiesEL: [
      'Minibar', 'Χρηματοκιβώτιο', 'Κλιματισμός',
      'Διπλός Καναπές-Κρεβάτι', 'Δωρεάν WiFi', 'Στεγνωτήρας μαλλιών',
    ],
    priceEN: 'From €140/night',
    priceEL: 'Από €140/νύχτα',
  },
  {
    id: 'sailor',
    labelEN: 'NEXT DOOR • NEW APARTMENTS',
    labelEL: 'ΔΙΠΛΑ • ΝΕΑ ΔΙΑΜΕΡΙΣΜΑΤΑ',
    nameEN: 'SAILOR ROOM',
    nameEL: 'SAILOR ΔΩΜΑΤΙΟ',
    size: 32,
    maxGuests: 3,
    descriptionEN:
      'Our Deluxe Triple Sailor Room has a king size bed and a single sofa bed. Nautical themed with maritime charm.',
    descriptionEL:
      'Το Deluxe Τρίκλινο Sailor δωμάτιό μας διαθέτει ένα king size κρεβάτι και έναν μονό καναπέ-κρεβάτι. Με ναυτικό θέμα και θαλασσινή γοητεία.',
    image: '/images/room-sailor.jpg',
    facilitiesEN: [
      'Minibar', 'Safety Deposit Box', 'Air Conditioning',
      'Single Sofa Bed', 'Free WiFi', 'Hairdryer',
    ],
    facilitiesEL: [
      'Minibar', 'Χρηματοκιβώτιο', 'Κλιματισμός',
      'Μονός Καναπές-Κρεβάτι', 'Δωρεάν WiFi', 'Στεγνωτήρας μαλλιών',
    ],
    priceEN: 'From €100/night',
    priceEL: 'Από €100/νύχτα',
  },
  {
    id: 'african',
    labelEN: 'NEXT DOOR • NEW APARTMENTS',
    labelEL: 'ΔΙΠΛΑ • ΝΕΑ ΔΙΑΜΕΡΙΣΜΑΤΑ',
    nameEN: 'AFRICAN ROOM',
    nameEL: 'AFRICAN ΔΩΜΑΤΙΟ',
    size: 30,
    maxGuests: 2,
    descriptionEN:
      'Our Deluxe Double African Room is a haven of cultural fusion with rich textures and warm earth tones.',
    descriptionEL:
      'Το Deluxe Δίκλινο African δωμάτιό μας είναι ένα καταφύγιο πολιτισμικής ένωσης με πλούσιες υφές και ζεστούς γήινους τόνους.',
    image: '/images/room-african.jpg',
    facilitiesEN: [
      'Minibar', 'Safety Deposit Box', 'Air Conditioning',
      'Free WiFi', 'Hairdryer',
    ],
    facilitiesEL: [
      'Minibar', 'Χρηματοκιβώτιο', 'Κλιματισμός',
      'Δωρεάν WiFi', 'Στεγνωτήρας μαλλιών',
    ],
    priceEN: 'From €110/night',
    priceEL: 'Από €110/νύχτα',
  },
];

export default function Rooms() {
  const heroRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const { t, language } = useLanguage();

  useEffect(() => {
    const hero = heroRef.current;
    const grid = gridRef.current;

    if (!hero) return;

    const ctx = gsap.context(() => {
      // Hero animation
      gsap.fromTo(
        hero.querySelector('.hero-title'),
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'power3.out',
        }
      );

      gsap.fromTo(
        hero.querySelector('.hero-subtitle'),
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: 0.3,
          ease: 'power3.out',
        }
      );

      // Room cards animation
      if (grid) {
        const cards = grid.querySelectorAll('.room-card');
        cards.forEach((card: Element, index: number) => {
          gsap.fromTo(
            card,
            { y: 60, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              delay: index * 0.1,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="bg-frogs-dark min-h-screen">
      {/* Hero */}
      <section
        ref={heroRef}
        className="relative h-[60vh] lg:h-[70vh] flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0">
          <img
            src="/images/guesthouse-room.jpg"
            alt={t("The Rooms", "Τα Δωμάτια")}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-frogs-dark/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-frogs-dark via-transparent to-transparent" />
        </div>
        <div className="relative z-10 text-center px-6">
          <h1 className="hero-title font-display text-6xl lg:text-9xl text-frogs-text-light mb-6">
            {t("THE ROOMS", "ΤΑ ΔΩΜΑΤΙΑ")}
          </h1>
          <p className="hero-subtitle font-body text-lg lg:text-xl text-frogs-text-light/70 max-w-xl mx-auto">
            {t("Six individually designed spaces, each with its own character and charm", "Έξι ξεχωριστά σχεδιασμένοι χώροι, ο καθένας με τον δικό του χαρακτήρα και γοητεία")}
          </p>
        </div>
      </section>

      {/* Rooms Grid - 3 columns for 6 rooms */}
      <section className="py-20 lg:py-32 px-6 lg:px-16">
        <div ref={gridRef} className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {rooms.map((room, index) => (
              <Link key={room.id}
                href={`/rooms/${room.id}`}
                className="room-card group relative overflow-hidden rounded-2xl bg-frogs-dark/50 border border-frogs-border/10 hover:border-frogs-gold/30 transition-all duration-500"
              >
                {/* Image */}
                <div className="relative h-64 lg:h-72 overflow-hidden">
                  <img
                    src={room.image}
                    alt={t(room.nameEN, room.nameEL)}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-frogs-dark via-frogs-dark/40 to-transparent" />

                  {/* Room Number */}
                  <div className="absolute top-4 left-4 font-display text-5xl text-frogs-text-light/20 group-hover:text-frogs-gold/40 transition-colors duration-500">
                    0{index + 1}
                  </div>

                  {/* Price Badge */}
                  <div className="absolute top-4 right-4 px-4 py-2 rounded-full bg-frogs-dark/70 backdrop-blur-sm border border-frogs-border/20">
                    <span className="font-body text-sm text-frogs-gold">{t(room.priceEN, room.priceEL)}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <span className="label-micro text-frogs-gold mb-2 block">{t(room.labelEN, room.labelEL)}</span>
                  <h2 className="font-display text-2xl text-frogs-text-light mb-3 group-hover:text-frogs-gold transition-colors">
                    {t(room.nameEN, room.nameEL)}
                  </h2>

                  <div className="flex flex-wrap gap-4 mb-4">
                    <div className="flex items-center gap-2 text-frogs-text-light/60">
                      <Maximize className="w-4 h-4" />
                      <span className="font-body text-sm">{room.size} m²</span>
                    </div>
                    <div className="flex items-center gap-2 text-frogs-text-light/60">
                      <Users className="w-4 h-4" />
                      <span className="font-body text-sm">{t(`Up to ${room.maxGuests}`, `Έως ${room.maxGuests}`)}</span>
                    </div>
                  </div>

                  <p className="font-body text-frogs-text-light/60 text-sm mb-4 line-clamp-2">
                    {t(room.descriptionEN, room.descriptionEL)}
                  </p>

                  {/* Quick Facilities */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(language === 'GR' ? room.facilitiesEL : room.facilitiesEN).slice(0, 4).map((facility: string, i: number) => (
                      <span
                        key={i}
                        className="flex items-center gap-1 px-2 py-1 rounded bg-frogs-dark/50 text-frogs-text-light/50 text-xs"
                      >
                        <Check className="w-3 h-3 text-frogs-gold" />
                        {facility}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="flex items-center gap-2 text-frogs-gold opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <span className="font-body text-sm">{t("View Details", "Προβολή Λεπτομερειών")}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 px-6 lg:px-16 bg-frogs-dark/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-4xl lg:text-6xl text-frogs-text-light mb-6">
            {t("READY TO BOOK?", "ΕΤΟΙΜΟΙ ΓΙΑ ΚΡΑΤΗΣΗ?")}
          </h2>
          <p className="font-body text-lg text-frogs-text-light/60 mb-8 max-w-xl mx-auto">
            {t("Best rates when you book direct. Questions? We're here to help.", "Οι καλύτερες τιμές όταν κάνετε απευθείας κράτηση. Ερωτήσεις; Είμαστε εδώ για να βοηθήσουμε.")}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="btn-primary">
              {t("Send Inquiry", "Αποστολή Ερώτησης")}
            </Link>
            <a
              href="https://wa.me/+306976908878"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              {t("WhatsApp Us", "WhatsApp")}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
