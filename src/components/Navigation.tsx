"use client";
import { useState, useEffect } from 'react';
import { Menu, X, Phone, Globe } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { labelEN: 'Home', labelEL: 'Αρχική', href: '/' },
    { labelEN: 'Rooms', labelEL: 'Δωμάτια', href: '/rooms' },
    { labelEN: 'Gallery', labelEL: 'Γκαλερί', href: '/gallery' },
    { labelEN: 'Athens', labelEL: 'Αθήνα', href: '/athens' },
    { labelEN: 'Directory', labelEL: 'Οδηγός', href: '/directory' },
    { labelEN: 'Contact', labelEL: 'Επικοινωνία', href: '/contact' },
  ];

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const toggleLanguage = (lang: 'EN' | 'GR') => {
    setLanguage(lang);
    setShowLangDropdown(false);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
          ? 'bg-frogs-dark/95 backdrop-blur-md py-4'
          : 'bg-transparent py-6'
          }`}
      >
        <div className="w-full px-6 lg:px-12 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center group" aria-label={t("The Frogs Guesthouse Home", "Αρχική Σελίδα The Frogs Guesthouse")}>
            <div className="h-10 relative flex items-center">
              <Image
                src="/the-frogs.svg"
                alt="The Frogs Guesthouse"
                width={120}
                height={40}
                className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={`relative font-body text-sm tracking-wide transition-colors duration-300 ${isActive(link.href)
                  ? 'text-frogs-gold'
                  : 'text-frogs-text-light/80 hover:text-frogs-text-light'
                  }`}
              >
                {t(link.labelEN, link.labelEL)}
                <span
                  className={`absolute -bottom-1 left-0 h-px bg-frogs-gold transition-all duration-300 ${isActive(link.href) ? 'w-full' : 'w-0 hover:w-full'
                    }`}
                />
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                aria-haspopup="listbox"
                aria-expanded={showLangDropdown}
                aria-label={t("Change language", "Αλλαγή γλώσσας")}
                className="flex items-center gap-2 px-3 py-2 rounded-full border border-frogs-border/20 text-frogs-text-light/80 hover:border-frogs-gold hover:text-frogs-gold transition-all duration-300"
              >
                <Globe className="w-4 h-4" aria-hidden="true" />
                <span className="text-sm font-medium">{language}</span>
              </button>

              {/* Language Dropdown */}
              {showLangDropdown && (
                <div
                  role="listbox"
                  className="absolute top-full right-0 mt-2 py-2 px-1 rounded-xl bg-frogs-dark/95 backdrop-blur-md border border-frogs-border/20 shadow-xl"
                >
                  <button
                    role="option"
                    aria-selected={language === 'EN'}
                    onClick={() => toggleLanguage('EN')}
                    className={`flex items-center gap-2 w-full px-4 py-2 rounded-lg text-sm transition-colors ${language === 'EN'
                      ? 'text-frogs-gold bg-frogs-gold/10'
                      : 'text-frogs-text-light/70 hover:text-frogs-text-light hover:bg-frogs-text-light/5'
                      }`}
                  >
                    <span className="w-5" aria-hidden="true">🇬🇧</span>
                    <span>English</span>
                  </button>
                  <button
                    role="option"
                    aria-selected={language === 'GR'}
                    onClick={() => toggleLanguage('GR')}
                    className={`flex items-center gap-2 w-full px-4 py-2 rounded-lg text-sm transition-colors ${language === 'GR'
                      ? 'text-frogs-gold bg-frogs-gold/10'
                      : 'text-frogs-text-light/70 hover:text-frogs-text-light hover:bg-frogs-text-light/5'
                      }`}
                  >
                    <span className="w-5" aria-hidden="true">🇬🇷</span>
                    <span>Ελληνικά</span>
                  </button>
                </div>
              )}
            </div>

            <a
              href="https://wa.me/+306976908878"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("Call or WhatsApp us at +30 697 690 8878", "Καλέστε μας ή στείλτε WhatsApp στο +30 697 690 8878")}
              className="hidden sm:flex items-center gap-2 text-frogs-text-light/80 hover:text-frogs-gold transition-colors duration-300"
            >
              <Phone className="w-4 h-4" aria-hidden="true" />
              <span className="text-sm">+30 697 690 8878</span>
            </a>

            <Link href="/contact"
              className="btn-primary hidden sm:inline-flex"
            >
              {t("Book Now", "Κράτηση")}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-frogs-text-light"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 bg-frogs-dark/98 backdrop-blur-lg transition-all duration-500 lg:hidden ${isMobileMenuOpen
          ? 'opacity-100 pointer-events-auto'
          : 'opacity-0 pointer-events-none'
          }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8">
          {navLinks.map((link, index) => (
            <Link key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`font-display text-4xl tracking-wider transition-all duration-300 ${isActive(link.href)
                ? 'text-frogs-gold'
                : 'text-frogs-text-light/80 hover:text-frogs-text-light'
                }`}
              style={{
                transitionDelay: isMobileMenuOpen ? `${index * 50}ms` : '0ms',
                transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(20px)',
                opacity: isMobileMenuOpen ? 1 : 0,
              }}
            >
              {t(link.labelEN, link.labelEL)}
            </Link>
          ))}

          {/* Mobile Language Switcher */}
          <div
            className="flex items-center gap-4 mt-4"
            style={{
              transitionDelay: isMobileMenuOpen ? '300ms' : '0ms',
              transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(20px)',
              opacity: isMobileMenuOpen ? 1 : 0,
            }}
          >
            <button
              onClick={() => setLanguage('EN')}
              className={`px-4 py-2 rounded-full border transition-all ${language === 'EN'
                ? 'border-frogs-gold text-frogs-gold'
                : 'border-frogs-border/30 text-frogs-text-light/50'
                }`}
            >
              🇬🇧 EN
            </button>
            <button
              onClick={() => setLanguage('GR')}
              className={`px-4 py-2 rounded-full border transition-all ${language === 'GR'
                ? 'border-frogs-gold text-frogs-gold'
                : 'border-frogs-border/30 text-frogs-text-light/50'
                }`}
            >
              🇬🇷 GR
            </button>
          </div>

          <Link href="/contact"
            className="btn-primary mt-8"
            style={{
              transitionDelay: isMobileMenuOpen ? '350ms' : '0ms',
              transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(20px)',
              opacity: isMobileMenuOpen ? 1 : 0,
            }}
          >
            {t("Book Now", "Κράτηση")}
          </Link>

          <div
            className="flex items-center gap-2 text-frogs-text-light/60 mt-8"
            style={{
              transitionDelay: isMobileMenuOpen ? '400ms' : '0ms',
              transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(20px)',
              opacity: isMobileMenuOpen ? 1 : 0,
            }}
          >
            <Phone className="w-4 h-4" />
            <span className="text-sm">+30 697 690 8878</span>
          </div>
        </div>
      </div>
    </>
  );
}
