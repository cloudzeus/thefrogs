"use client";
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { MapPin, Clock, ArrowRight, Camera, Landmark, Mountain, Utensils } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

const sights = [
  {
    id: 'acropolis',
    nameEN: 'The Acropolis',
    nameEL: 'Η Ακρόπολη',
    subtitleEN: 'Crown of Athens',
    subtitleEL: 'Το Στέμμα της Αθήνας',
    descriptionEN: 'The ancient citadel perched above the city, home to the iconic Parthenon and a symbol of classical spirit and civilization.',
    descriptionEL: 'Η αρχαία ακρόπολη πάνω από την πόλη, σπίτι του εμβληματικού Παρθενώνα και σύμβολο του κλασικού πνεύματος και του πολιτισμού.',
    image: '/images/hero-athens-bar.jpg',
    categoryEN: 'landmark',
    categoryEL: 'αξιοθέατο',
    distanceEN: '15 min walk',
    distanceEL: '15 λεπτά με τα πόδια',
    timeEN: '2-3 hours',
    timeEL: '2-3 ώρες',
    icon: Landmark,
  },
  {
    id: 'plaka',
    nameEN: 'Plaka Neighborhood',
    nameEL: 'Πλάκα',
    subtitleEN: 'The Old Town',
    subtitleEL: 'Η Παλιά Πόλη',
    descriptionEN: 'Wander through the charming streets of Athens\' oldest neighborhood, with neoclassical architecture, tavernas, and shops.',
    descriptionEL: 'Περιπλανηθείτε στους γοητευτικούς δρόμους της παλαιότερης γειτονιάς της Αθήνας, με νεοκλασική αρχιτεκτονική, ταβέρνες και καταστήματα.',
    image: '/images/gallery-1.jpg',
    categoryEN: 'neighborhood',
    categoryEL: 'γειτονιά',
    distanceEN: '5 min walk',
    distanceEL: '5 λεπτά με τα πόδια',
    timeEN: 'Half day',
    timeEL: 'Μισή μέρα',
    icon: Camera,
  },
  {
    id: 'monastiraki',
    nameEN: 'Monastiraki Flea Market',
    nameEL: 'Μοναστηράκι',
    subtitleEN: 'Treasure Hunting',
    subtitleEL: 'Κυνήγι Θησαυρού',
    descriptionEN: 'A vibrant marketplace where you can find everything from antiques and souvenirs to local crafts and street food.',
    descriptionEL: 'Μια ζωντανή αγορά όπου μπορείτε να βρεθείτε τα πάντα, από αντίκες και αναμνηστικά μέχρι τοπικά χειροτεχνήματα και street food.',
    image: '/images/gallery-3.jpg',
    categoryEN: 'shopping',
    categoryEL: 'αγορές',
    distanceEN: '8 min walk',
    distanceEL: '8 λεπτά με τα πόδια',
    timeEN: '2-4 hours',
    timeEL: '2-4 ώρες',
    icon: Utensils,
  },
  {
    id: 'lycabettus',
    nameEN: 'Mount Lycabettus',
    nameEL: 'Λυκαβηττός',
    subtitleEN: 'Panoramic Views',
    subtitleEL: 'Πανοραμική Θέα',
    descriptionEN: 'The highest point in Athens offering breathtaking 360° views of the city, especially magical at sunset.',
    descriptionEL: 'Το υψηλότερο σημείο της Αθήνας που προσφέρει εκπληκτική θέα 360° στην πόλη, ιδιαίτερα μαγική στο ηλιοβασίλεμα.',
    image: '/images/rooftop-skyline.jpg',
    categoryEN: 'nature',
    categoryEL: 'φύση',
    distanceEN: '20 min walk',
    distanceEL: '20 λεπτά με τα πόδια',
    timeEN: '1-2 hours',
    timeEL: '1-2 ώρες',
    icon: Mountain,
  },
  {
    id: 'national-museum',
    nameEN: 'National Archaeological Museum',
    nameEL: 'Εθνικό Αρχαιολογικό Μουσείο',
    subtitleEN: 'Ancient Treasures',
    subtitleEL: 'Αρχαίοι Θησαυροί',
    descriptionEN: 'One of the world\'s most important museums, housing an extensive collection of ancient Greek artifacts.',
    descriptionEL: 'Ένα από τα σημαντικότερα μουσεία του κόσμου, που στεγάζει μια εκτενή συλλογή αρχαίων ελληνικών αντικειμένων.',
    image: '/images/gallery-2.jpg',
    categoryEN: 'museum',
    categoryEL: 'μουσείο',
    distanceEN: '25 min walk',
    distanceEL: '25 λεπτά με τα πόδια',
    timeEN: '2-4 hours',
    timeEL: '2-4 ώρες',
    icon: Landmark,
  },
  {
    id: 'syntagma',
    nameEN: 'Syntagma Square',
    nameEL: 'Πλατεία Συντάγματος',
    subtitleEN: 'Heart of the City',
    subtitleEL: 'Η Καρδιά της Πόλης',
    descriptionEN: 'The central square of Athens, home to the Hellenic Parliament and the famous Changing of the Guard ceremony.',
    descriptionEL: 'Η κεντρική πλατεία της Αθήνας, σπίτι του Ελληνικού Κοινοβουλίου και της διάσημης τελετής Αλλαγής Φρουράς.',
    image: '/images/gallery-4.jpg',
    categoryEN: 'landmark',
    categoryEL: 'αξιοθέατο',
    distanceEN: '12 min walk',
    distanceEL: '12 λεπτά με τα πόδια',
    timeEN: '1 hour',
    timeEL: '1 ώρα',
    icon: Landmark,
  },
  {
    id: 'anafiotika',
    nameEN: 'Anafiotika',
    nameEL: 'Αναφιώτικα',
    subtitleEN: 'Hidden Village',
    subtitleEL: 'Κρυμμένο Χωριό',
    descriptionEN: 'A secret village-like neighborhood under the Acropolis with whitewashed houses and narrow alleys reminiscent of the Greek islands.',
    descriptionEL: 'Μια μυστική γειτονιά που μοιάζει με χωριό κάτω από την Ακρόπολη, με λευκά σπίτια και στενά σοκάκια που θυμίζουν τα ελληνικά νησιά.',
    image: '/images/gallery-6.jpg',
    categoryEN: 'neighborhood',
    categoryEL: 'γειτονιά',
    distanceEN: '10 min walk',
    distanceEL: '10 λεπτά με τα πόδια',
    timeEN: '1-2 hours',
    timeEL: '1-2 ώρες',
    icon: Camera,
  },
  {
    id: 'gazi',
    nameEN: 'Gazi & Technopolis',
    nameEL: 'Γκάζι & Τεχνόπολις',
    subtitleEN: 'Nightlife Hub',
    subtitleEL: 'Κέντρο Νυχτερινής Ζωής',
    descriptionEN: 'The former gasworks turned cultural center, now Athens\' trendiest nightlife and dining district.',
    descriptionEL: 'Το πρώην εργοστάσιο φωταερίου που μετατράπηκε σε πολιτιστικό κέντρο, τώρα η πιο μοντέρνα περιοχή νυχτερινής ζωής και εστίασης της Αθήνας.',
    image: '/images/bar-interior.jpg',
    categoryEN: 'nightlife',
    categoryEL: 'νυχτερινή ζωή',
    distanceEN: '15 min walk',
    distanceEL: '15 λεπτά με τα πόδια',
    timeEN: 'Evening',
    timeEL: 'Βράδυ',
    icon: Utensils,
  },
];



export default function Athens() {
  const heroRef = useRef<HTMLElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const hero = heroRef.current;
    const intro = introRef.current;
    const grid = gridRef.current;
    const cta = ctaRef.current;

    if (!hero) return;

    const ctx = gsap.context(() => {
      // Hero animations
      gsap.fromTo(
        hero.querySelector('.hero-title'),
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'power3.out',
        }
      );

      gsap.fromTo(
        hero.querySelector('.hero-subtitle'),
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: 0.3,
          ease: 'power3.out',
        }
      );

      // Intro section
      if (intro) {
        gsap.fromTo(
          intro.querySelector('.intro-text'),
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: intro,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Grid cards animation
      if (grid) {
        const cards = grid.querySelectorAll('.sight-card');
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

      // CTA section
      if (cta) {
        gsap.fromTo(
          cta,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cta,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="bg-frogs-dark min-h-screen">
      {/* Hero */}
      <section
        ref={heroRef}
        className="relative h-[70vh] lg:h-[80vh] flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0">
          <img
            src="/images/rooftop-skyline.jpg"
            alt={t("Athens Skyline", "Ορίζοντας της Αθήνας")}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-frogs-dark/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-frogs-dark via-transparent to-transparent" />
        </div>
        <div className="relative z-10 text-center px-6">
          <span className="label-micro text-frogs-gold mb-4 block">{t("DISCOVER", "ΑΝΑΚΑΛΥΨΤΕ")}</span>
          <h1 className="hero-title font-display text-6xl lg:text-9xl text-frogs-text-light mb-6">
            {t("ATHENS", "ΑΘΗΝΑ")}
          </h1>
          <p className="hero-subtitle font-heading text-xl lg:text-2xl text-frogs-text-light/80 max-w-2xl mx-auto">
            {t(
              "A city where ancient history meets modern life, just steps from your door",
              "Μια πόλη όπου η αρχαία ιστορία συναντά τη σύγχρονη ζωή, λίγα βήματα από την πόρτα σας"
            )}
          </p>
        </div>
      </section>

      {/* Intro Section */}
      <section ref={introRef} className="py-20 lg:py-32 px-6 lg:px-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="intro-text">
            <h2 className="font-display text-4xl lg:text-5xl text-frogs-text-light mb-8">
              {t("EXPLORE THE CITY", "ΕΞΕΡΕΥΝΗΣΤΕ ΤΗΝ ΠΟΛΗ")}
            </h2>
            <p className="font-body text-lg text-frogs-text-light/70 leading-relaxed">
              {t(
                "Located in the heart of Psyri, The Frogs Guesthouse puts you within walking distance of Athens' most iconic landmarks, vibrant neighborhoods, and hidden gems. From the ancient Acropolis to trendy nightlife districts, discover the many faces of this extraordinary city.",
                "Στην καρδιά στου Ψυρρή, το The Frogs Guesthouse σας τοποθετεί σε κοντινή απόσταση με τα πόδια από τα πιο εμβληματικά ορόσημα της Αθήνας, τις ζωντανές γειτονιές και τα κρυμμένα διαμάντια. Από την αρχαία Ακρόπολη μέχρι τις μοντέρνες περιοχές νυχτερινής ζωής, ανακαλύψτε τα πολλά πρόσωπα αυτής της εξαιρετικής πόλης."
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Sights Grid */}
      <section className="py-20 lg:py-32 px-6 lg:px-16 bg-frogs-dark/50">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12">
            <div>
              <span className="label-micro text-frogs-gold mb-4 block">{t("MUST SEE", "Πρέπει να δείτε")}</span>
              <h2 className="font-display text-4xl lg:text-5xl text-frogs-text-light">
                {t("TOP ATTRACTIONS", "Κορυφαία Αξιοθέατα")}
              </h2>
            </div>
            <p className="font-body text-frogs-text-light/50 mt-4 lg:mt-0">
              {t("All within walking distance from The Frogs", "Όλα σε κοντινή απόσταση με τα πόδια από το The Frogs")}
            </p>
          </div>

          {/* Grid */}
          <div ref={gridRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {sights.map((sight) => (
              <Link key={sight.id}
                href={`/athens/${sight.id}`}
                className="sight-card group relative overflow-hidden rounded-2xl bg-frogs-dark/50 border border-frogs-border/10 hover:border-frogs-gold/30 transition-all duration-500"
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={sight.image}
                    alt={t(sight.nameEN, sight.nameEL)}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-frogs-dark via-frogs-dark/40 to-transparent" />

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-frogs-dark/70 backdrop-blur-sm border border-frogs-border/20">
                    <span className="font-body text-xs text-frogs-gold uppercase tracking-wider">
                      {t(sight.categoryEN, sight.categoryEL)}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-frogs-gold/20 flex items-center justify-center">
                    <sight.icon className="w-5 h-5 text-frogs-gold" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="label-micro text-frogs-text-light/40 mb-2">
                    {t(sight.subtitleEN, sight.subtitleEL).toUpperCase()}
                  </p>
                  <h3 className="font-display text-2xl text-frogs-text-light mb-3 group-hover:text-frogs-gold transition-colors">
                    {t(sight.nameEN, sight.nameEL).toUpperCase()}
                  </h3>
                  <p className="font-body text-sm text-frogs-text-light/60 mb-4 line-clamp-2">
                    {t(sight.descriptionEN, sight.descriptionEL)}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-frogs-text-light/40">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span className="font-body text-xs">{t(sight.distanceEN, sight.distanceEL)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span className="font-body text-xs">{t(sight.timeEN, sight.timeEL)}</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-4 flex items-center gap-2 text-frogs-gold opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <span className="font-body text-sm">{t("Explore", "Εξερευνήστε")}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 lg:py-32 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="label-micro text-frogs-gold mb-4 block">{t("LOCATION", "ΤΟΠΟΘΕΣΙΑ")}</span>
              <h2 className="font-display text-4xl lg:text-5xl text-frogs-text-light mb-6">
                {t("PERFECTLY", "ΤΕΛΕΙΑ")}
                <br />
                {t("POSITIONED", "ΤΟΠΟΘΕΤΗΜΕΝΟ")}
              </h2>
              <p className="font-body text-frogs-text-light/70 leading-relaxed mb-8">
                {t(
                  "The Frogs Guesthouse sits in the vibrant Psyri neighborhood, one of Athens' most exciting areas. You're just minutes away from major attractions, excellent restaurants, and the city's best nightlife.",
                  "Το The Frogs Guesthouse βρίσκεται στη ζωντανή γειτονιά στου Ψυρρή, μια από τις πιο συναρπαστικές περιοχές της Αθήνας. Απέχετε μόλις λίγα λεπτά από τα κυριότερα αξιοθέατα, εξαιρετικά εστιατόρια και την καλύτερη νυχτερινή ζωή της πόλης."
                )}
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-frogs-gold/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-frogs-gold" />
                  </div>
                  <div>
                    <p className="font-body text-frogs-text-light">{t("4 Aristofanous Str.", "Αριστοφάνους 4")}</p>
                    <p className="font-body text-sm text-frogs-text-light/50">{t("Psyri, Athens 10554", "Ψυρρή, Αθήνα 10554")}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3145.054054054054!2d23.7214!3d37.9781!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDU4JzQxLjIiTiAyM8KwNDMnMTcuMCJF!5e0!3m2!1sen!2sus!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'grayscale(100%) invert(92%) contrast(83%)' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={t("The Frogs Guesthouse Location", "Η τοποθεσία του The Frogs Guesthouse")}
                className="rounded-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-20 lg:py-32 px-6 lg:px-16 bg-frogs-dark/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-4xl lg:text-6xl text-frogs-text-light mb-6">
            {t("READY TO EXPLORE?", "ΕΤΟΙΜΟΙ ΓΙΑ ΕΞΕΡΕΥΝΗΣΗ;")}
          </h2>
          <p className="font-body text-lg text-frogs-text-light/60 mb-8 max-w-xl mx-auto">
            {t("Book your stay at The Frogs and discover Athens from the perfect base.", "Κλείστε τη διαμονή σας στο The Frogs και ανακαλύψτε την Αθήνα από την τέλεια βάση.")}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://thefrogsguesthouse.reserve-online.net/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              {t("Book Your Stay", "Κάντε Κράτηση")}
            </a>
            <Link href="/contact" className="btn-secondary">
              {t("Get Recommendations", "Λάβετε Προτάσεις")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
