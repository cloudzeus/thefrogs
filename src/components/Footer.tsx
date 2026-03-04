"use client";
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { Instagram, Facebook, MessageCircle, MapPin, Phone, Mail, ArrowUpRight } from 'lucide-react';

import { useLanguage } from '@/context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const footer = footerRef.current;
    const content = contentRef.current;

    if (!footer || !content) return;

    // Animate footer content when it comes into view
    const ctx = gsap.context(() => {
      gsap.fromTo(
        content.querySelectorAll('.footer-col'),
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: footer,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, footer);

    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={footerRef}
      className="relative bg-frogs-dark z-0"
      style={{
        position: 'sticky',
        bottom: 0,
        left: 0,
        right: 0,
      }}
    >
      {/* Top decorative line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-frogs-gold/30 to-transparent" />

      <div ref={contentRef} className="px-6 lg:px-16 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto">
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
            {/* Brand Column */}
            <div className="footer-col lg:col-span-1">
              <Link href="/" className="inline-block mb-6" aria-label={t("The Frogs Guesthouse Home", "Αρχική Σελίδα The Frogs Guesthouse")}>
                <div className="h-16 relative flex items-center">
                  <img
                    src="/the-frogs.svg"
                    alt="The Frogs Guesthouse"
                    className="h-full w-auto object-contain"
                  />
                </div>
              </Link>
              <p className="font-body text-frogs-text-light/70 text-sm leading-relaxed mb-6 max-w-xs">
                {t(
                  "A boutique guesthouse in the heart of Athens with a bar downstairs and a rooftop made for golden hour.",
                  "Ένας boutique ξενώνας στην καρδιά της Αθήνας με μπαρ στο ισόγειο και ταράτσα φτιαγμένη για το ηλιοβασίλεμα."
                )}
              </p>
              <div className="flex gap-3">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-frogs-border/20 flex items-center justify-center text-frogs-text-light/60 hover:border-frogs-gold hover:text-frogs-gold hover:bg-frogs-gold/10 transition-all duration-300"
                  aria-label={t("Instagram (opens in new tab)", "Instagram (ανοίγει σε νέα καρτέλα)")}
                >
                  <Instagram className="w-4 h-4" aria-hidden="true" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-frogs-border/20 flex items-center justify-center text-frogs-text-light/60 hover:border-frogs-gold hover:text-frogs-gold hover:bg-frogs-gold/10 transition-all duration-300"
                  aria-label={t("Facebook (opens in new tab)", "Facebook (ανοίγει σε νέα καρτέλα)")}
                >
                  <Facebook className="w-4 h-4" aria-hidden="true" />
                </a>
                <a
                  href="https://wa.me/+306976908878"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-frogs-border/20 flex items-center justify-center text-frogs-text-light/60 hover:border-frogs-gold hover:text-frogs-gold hover:bg-frogs-gold/10 transition-all duration-300"
                  aria-label={t("WhatsApp (opens in new tab)", "WhatsApp (ανοίγει σε νέα καρτέλα)")}
                >
                  <MessageCircle className="w-4 h-4" aria-hidden="true" />
                </a>
              </div>
            </div>

            {/* Navigation Column */}
            <div className="footer-col">
              <h3 className="label-micro text-frogs-gold mb-6">{t("NAVIGATION", "ΠΛΟΗΓΗΣΗ")}</h3>
              <ul className="space-y-3">
                {[
                  { labelEN: 'Home', labelEL: 'Αρχική', href: '/' },
                  { labelEN: 'Rooms', labelEL: 'Δωμάτια', href: '/rooms' },
                  { labelEN: 'Gallery', labelEL: 'Γκαλερί', href: '/gallery' },
                  { labelEN: 'Athens Guide', labelEL: 'Οδηγός Αθήνας', href: '/athens' },
                  { labelEN: 'Directory', labelEL: 'Οδηγός Ξενώνα', href: '/directory' },
                  { labelEN: 'Contact', labelEL: 'Επικοινωνία', href: '/contact' },
                ].map((item) => (
                  <li key={item.labelEN}>
                    <Link href={item.href}
                      className="group flex items-center gap-2 font-body text-frogs-text-light/80 hover:text-frogs-gold transition-colors duration-300"
                    >
                      <span>{t(item.labelEN, item.labelEL)}</span>
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Column */}
            <div className="footer-col">
              <h3 className="label-micro text-frogs-gold mb-6">{t("CONTACT", "ΕΠΙΚΟΙΝΩΝΙΑ")}</h3>
              <ul className="space-y-4">
                <li>
                  <a
                    href="https://maps.google.com/?q=4+Aristofanous+Str+Athens+10554+Greece"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t("View on Google Maps (opens in new tab)", "Δείτε στο Google Maps (ανοίγει σε νέα καρτέλα)")}
                    className="flex items-start gap-3 font-body text-frogs-text-light/80 hover:text-frogs-gold transition-colors duration-300"
                  >
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <span className="text-sm">
                      {t("4 Aristofanous Str.", "Αριστοφάνους 4")}
                      <br />
                      {t("Athens 10554, Greece", "Αθήνα 10554, Ελλάδα")}
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+302114019607"
                    className="flex items-center gap-3 font-body text-frogs-text-light/80 hover:text-frogs-gold transition-colors duration-300"
                  >
                    <Phone className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                    <span className="text-sm">+30 21 1401 9607</span>
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:thefrogs.guesthouse@gmail.com"
                    className="flex items-center gap-3 font-body text-frogs-text-light/80 hover:text-frogs-gold transition-colors duration-300"
                  >
                    <Mail className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                    <span className="text-sm">thefrogs.guesthouse@gmail.com</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Book Now Column */}
            <div className="footer-col">
              <h3 className="label-micro text-frogs-gold mb-6">{t("BOOK YOUR STAY", "ΚΑΝΤΕ ΚΡΑΤΗΣΗ")}</h3>
              <p className="font-body text-frogs-text-light/70 text-sm mb-6">
                {t(
                  "Best rates when you book direct. Questions? We're here to help.",
                  "Καλύτερες τιμές απευθείας κρατήσεις. Ερωτήσεις; Είμαστε εδώ για να βοηθήσουμε."
                )}
              </p>
              <Link href="/contact"
                className="btn-primary w-full justify-center mb-4"
              >
                {t("Send Inquiry", "Αποστολή Ερωτήματος")}
              </Link>
              <div className="flex items-center gap-2 text-frogs-text-light/60 text-xs">
                <MessageCircle className="w-3 h-3" aria-hidden="true" />
                <span>WhatsApp: +30 697 690 8878</span>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-frogs-border/10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="font-body text-xs text-frogs-text-light/60">
                © 2018–{new Date().getFullYear()} {t("The Frogs Guesthouse · Athens, Greece", "The Frogs Guesthouse · Αθήνα, Ελλάδα")}
              </p>
              <div className="flex items-center gap-6">
                <Link href="#" className="font-body text-xs text-frogs-text-light/60 hover:text-frogs-gold transition-colors">
                  {t("Privacy Policy", "Πολιτική Απορρήτου")}
                </Link>
                <Link href="#" className="font-body text-xs text-frogs-text-light/60 hover:text-frogs-gold transition-colors">
                  {t("Terms & Conditions", "Όροι & Προϋποθέσεις")}
                </Link>
                <Link href="#" className="font-body text-xs text-frogs-text-light/60 hover:text-frogs-gold transition-colors">
                  {t("Cookies", "Cookies")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
