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
  AlertCircle
} from 'lucide-react';

import { useLanguage } from '@/context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

const directoryItems = [
  {
    icon: Calendar,
    titleEN: 'Check In Time',
    titleEL: 'Ώρα Check In',
    contentEN: 'Check in time from 15:00 to 23:00, after 23:00 there is an extra charge of 20 Euros. Early check-in is available upon request and subjected to availability.',
    contentEL: 'Ώρα check-in από τις 15:00 έως τις 23:00. Μετά τις 23:00 υπάρχει επιπλέον χρέωση 20 Ευρώ. Το πρόωρο check-in είναι διαθέσιμο κατόπιν αιτήματος και ανάλογα με τη διαθεσιμότητα.',
  },
  {
    icon: Clock,
    titleEN: 'Check Out Time',
    titleEL: 'Ώρα Check Out',
    contentEN: 'Check-out time is at 11:00 am. Please make sure you have not forgotten any personal items before leaving your room and that you have returned your key to the Reception Desk. Late check-out is available upon request and subject to availability.',
    contentEL: 'Η ώρα check-out είναι στις 11:00 π.μ. Παρακαλούμε βεβαιωθείτε ότι δεν έχετε ξεχάσει προσωπικά αντικείμενα πριν φύγετε από το δωμάτιό σας και ότι έχετε επιστρέψει το κλειδί στη Ρεσεψιόν. Η καθυστερημένη αναχώρηση είναι διαθέσιμη κατόπιν αιτήματος και ανάλογα με τη διαθεσιμότητα.',
  },
  {
    icon: Sparkles,
    titleEN: 'Housekeeping Services',
    titleEL: 'Υπηρεσίες Καθαριότητας',
    contentEN: 'Rooms are cleaned daily between 14:00pm – 16:00pm. Towels, bathrobes and bed linens are changed every 2 days. If you wish any extra set of pillows, towels or bathrobes please ask at the Reception.',
    contentEL: 'Τα δωμάτια καθαρίζονται καθημερινά μεταξύ 14:00μμ – 16:00μμ. Οι πετσέτες, τα μπουρνούζια και τα κλινοσκεπάσματα αλλάζονται κάθε 2 ημέρες. Εάν επιθυμείτε επιπλέον μαξιλάρια, πετσέτες ή μπουρνούζια, παρακαλούμε ζητήστε το στη Ρεσεψιόν.',
  },
  {
    icon: Baby,
    titleEN: 'Baby Cot',
    titleEL: 'Βρεφική Κούνια',
    contentEN: 'We provide baby cot free of charge. Please inform our Reception prior to your arrival.',
    contentEL: 'Παρέχουμε βρεφική κούνια δωρεάν. Παρακαλούμε ενημερώστε τη Ρεσεψιόν μας πριν από την άφιξή σας.',
  },
  {
    icon: Heart,
    titleEN: 'First Aid Kit',
    titleEL: 'Φαρμακείο Πρώτων Βοηθειών',
    contentEN: 'A First Aid Kit is located at our Reception.',
    contentEL: 'Ένα φαρμακείο πρώτων βοηθειών βρίσκεται στη Ρεσεψιόν μας.',
  },
  {
    icon: Wifi,
    titleEN: 'Internet / Free Wifi',
    titleEL: 'Ίντερνετ / Δωρεάν Wifi',
    contentEN: 'Free wifi access is available in all the areas of the hotel.',
    contentEL: 'Δωρεάν πρόσβαση wifi είναι διαθέσιμη σε όλους τους χώρους του ξενοδοχείου.',
  },
  {
    icon: Laptop,
    titleEN: 'Laptop / Tablet (upon request)',
    titleEL: 'Laptop / Tablet (κατόπιν αιτήματος)',
    contentEN: 'Free usage of a laptop or tablet, upon request. Please ask at the Reception.',
    contentEL: 'Δωρεάν χρήση laptop ή tablet, κατόπιν αιτήματος. Παρακαλούμε ζητήστε το στη Ρεσεψιόν.',
  },
  {
    icon: Car,
    titleEN: 'Taxi Service',
    titleEL: 'Υπηρεσία Ταξί',
    contentEN: 'Transport to and from the airport / port with extra charge.',
    contentEL: 'Μεταφορά από και προς το αεροδρόμιο / λιμάνι με επιπλέον χρέωση.',
  },
  {
    icon: MapPin,
    titleEN: 'Parking',
    titleEL: 'Στάθμευση',
    contentEN: 'Private parking space upon request just 100m away from our guesthouse. Please ask at the reception for further details.',
    contentEL: 'Ιδιωτικός χώρος στάθμευσης κατόπιν αιτήματος μόλις 100μ μακριά από τον ξενώνα μας. Παρακαλούμε ρωτήστε στη ρεσεψιόν για περισσότερες λεπτομέρειες.',
  },
  {
    icon: Bus,
    titleEN: 'Daily Excursions & City Tours',
    titleEL: 'Καθημερινές Εκδρομές & Περιηγήσεις στην Πόλη',
    contentEN: 'We provide daily excursions & city tours upon request with extra charge. We advise you to express your interest at least 2 days prior to your arrival and ask our Reception for further information.',
    contentEL: 'Παρέχουμε καθημερινές εκδρομές & περιηγήσεις στην πόλη κατόπιν αιτήματος με επιπλέον χρέωση. Σας συμβουλεύουμε να εκδηλώσετε το ενδιαφέρον σας τουλάχιστον 2 ημέρες πριν από την άφιξή σας και να ρωτήσετε τη Ρεσεψιόν μας για περισσότερες πληροφορίες.',
  },
  {
    icon: Briefcase,
    titleEN: 'Porter & Luggage Storage Services',
    titleEL: 'Υπηρεσίες Μεταφοράς & Φύλαξης Αποσκευών',
    contentEN: 'Porter services are available upon request. Luggage storage is available after check out. Please ask at the reception.',
    contentEL: 'Υπηρεσίες αχθοφόρου είναι διαθέσιμες κατόπιν αιτήματος. Η φύλαξη αποσκευών είναι διαθέσιμη μετά το check out. Παρακαλούμε ρωτήστε στη ρεσεψιόν.',
  },
  {
    icon: Coffee,
    titleEN: 'Room Service',
    titleEL: 'Υπηρεσία Δωματίου',
    contentEN: 'Room service upon request between 10:00am – 22:00pm.',
    contentEL: 'Υπηρεσία δωματίου κατόπιν αιτήματος μεταξύ 10:00πμ – 22:00μμ.',
  },
  {
    icon: Sun,
    titleEN: 'Breakfast Room Service & Early Breakfast',
    titleEL: 'Υπηρεσία Πρωινού στο Δωμάτιο & Πρόωρο Πρωινό',
    contentEN: 'Breakfast room service, upon request, with extra charge. Early breakfast take away package, upon request, free of charge. Please ask at the reception for your menu choices.',
    contentEL: 'Υπηρεσία πρωινού στο δωμάτιο, κατόπιν αιτήματος, με επιπλέον χρέωση. Πακέτο πρόωρου πρωινού (take away), κατόπιν αιτήματος, δωρεάν. Παρακαλούμε ζητήστε στη ρεσεψιόν τις επιλογές του μενού σας.',
  },
  {
    icon: Shirt,
    titleEN: 'Laundry & Dry Cleaning Service',
    titleEL: 'Υπηρεσία Πλυντηρίου & Στεγνού Καθαρίσματος',
    contentEN: 'Laundry & Dry cleaning Service is available upon request with extra charge, every day except national holidays. Please ask at the reception.',
    contentEL: 'Η υπηρεσία πλυντηρίου και στεγνού καθαρίσματος είναι διαθέσιμη κατόπιν αιτήματος με επιπλέον χρέωση, κάθε μέρα εκτός από τις εθνικές εορτές. Παρακαλούμε ρωτήστε στη ρεσεψιόν.',
  },
];

const emergencyInfo = {
  internationalCode: '0030',
  emergencyNumber: '112',
  fireService: '199',
};

export default function Directory({ pageMeta }: { pageMeta?: any }) {
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
      // Hero animation
      const heroTitle = hero.querySelector('.hero-title');
      if (heroTitle) {
        gsap.fromTo(
          heroTitle,
          { y: 80, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.2,
            ease: 'power3.out',
          }
        );
      }

      // Intro animation
      if (intro) {
        gsap.fromTo(
          intro,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: intro,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Grid items animation
      if (grid) {
        const items = grid.querySelectorAll('.directory-item');
        items.forEach((item, index) => {
          gsap.fromTo(
            item,
            { y: 50, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.6,
              delay: index * 0.05,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: item,
                start: 'top 90%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        });
      }

      // Emergency section animation
      if (emergency) {
        gsap.fromTo(
          emergency,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: emergency,
              start: 'top 85%',
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
        className="relative h-[50vh] lg:h-[60vh] flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0">
          {pageMeta?.heroVideo ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              title={t("Guesthouse information overview", "Επισκόπηση πληροφοριών ξενώνα")}
            >
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
            {directoryItems.map((item, index) => (
              <div
                key={index}
                className="directory-item group p-6 lg:p-8 rounded-2xl bg-frogs-dark/50 border border-frogs-border/10 hover:border-frogs-gold/30 transition-all duration-500 hover:bg-frogs-dark/70"
              >
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-xl bg-frogs-gold/10 flex items-center justify-center flex-shrink-0 group-hover:bg-frogs-gold/20 transition-colors duration-300">
                    <item.icon className="w-6 h-6 text-frogs-gold" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-xl lg:text-2xl text-frogs-text-light mb-3 group-hover:text-frogs-gold transition-colors duration-300">
                      {t(item.titleEN, item.titleEL).toUpperCase()}
                    </h3>
                    <p className="font-body text-sm lg:text-base text-frogs-text-light/60 leading-relaxed">
                      {t(item.contentEN, item.contentEL)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
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
